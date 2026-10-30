const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

// Browsers send form posts as urlencoded and ask for HTML back
const browserPost = (agent, url) => agent.post(url).type('form').set('Accept', 'text/html');
const browserGet = (agent, url) => agent.get(url).set('Accept', 'text/html');

afterAll(async () => {
  await pool.end();
});

describe('browser user flow', () => {
  const email = `browser.flow.${Date.now()}@example.com`;
  const password = 'supersecret123';
  const agent = request.agent(app);
  let productId;
  let cartId;

  beforeAll(async () => {
    const result = await pool.query(
      `INSERT INTO products (name, price, description)
      VALUES ($1, $2, $3)
      RETURNING id`,
      ['Browser Flow Product', 12.5, 'A product used for flow testing']
    );
    productId = result.rows[0].id;
  });

  afterAll(async () => {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    const userId = rows[0] && rows[0].id;
    await pool.query(
      'DELETE FROM orderItems WHERE orderId IN (SELECT id FROM orders WHERE userId = $1)',
      [userId]
    );
    await pool.query('DELETE FROM orders WHERE userId = $1', [userId]);
    await pool.query(
      'DELETE FROM cartItems WHERE cartId IN (SELECT id FROM carts WHERE userId = $1)',
      [userId]
    );
    await pool.query('DELETE FROM carts WHERE userId = $1', [userId]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('redirects a guest to /login when visiting a protected page', async () => {
    const response = await browserGet(request(app), '/cart');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });

  it('shows the register form again with an error when a field is missing', async () => {
    const response = await browserPost(request(app), '/register').send({ email });

    expect(response.status).toBe(400);
    expect(response.text).toContain('data-testid="register-error"');
  });

  it('logs the new user in and redirects to the home page after registering', async () => {
    const response = await browserPost(agent, '/register').send({
      email,
      password,
      firstName: 'Grace',
      lastName: 'Hopper',
    });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/');

    const home = await browserGet(agent, '/');
    expect(home.text).toContain('data-testid="nav-account"');
  });

  it('links each product on the home page to its product page', async () => {
    const response = await browserGet(agent, '/');

    expect(response.text).toContain(`href="/product/${productId}"`);
  });

  it('renders an add-to-cart form on the product page', async () => {
    const response = await browserGet(agent, `/product/${productId}`);

    expect(response.text).toContain('data-testid="add-to-cart-form"');
    expect(response.text).toContain('action="/add-to-cart"');
  });

  it('renders the not found page for a missing product', async () => {
    const response = await browserGet(agent, '/product/2147483647');

    expect(response.status).toBe(404);
    expect(response.text).toContain('data-testid="not-found-page"');
  });

  it('adds a product to the cart and redirects to the cart page', async () => {
    const response = await browserPost(agent, '/add-to-cart').send({ productId });

    const { rows } = await pool.query(
      'SELECT carts.id FROM carts JOIN users ON users.id = carts.userId WHERE users.email = $1',
      [email]
    );
    cartId = rows[0].id;

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(`/carts/${cartId}`);

    const cart = await browserGet(agent, `/carts/${cartId}`);
    expect(cart.text).toContain('Browser Flow Product');
    expect(cart.text).toContain(`href="/carts/${cartId}/checkout"`);
  });

  it('places the order and redirects to the order confirmation', async () => {
    const response = await browserPost(agent, `/cart/${cartId}/checkout`);

    expect(response.status).toBe(302);
    expect(response.headers.location).toMatch(/^\/orders\/\d+\/confirmation$/);
  });

  it('redirects back to the cart when checking out an empty cart', async () => {
    const response = await browserPost(agent, `/cart/${cartId}/checkout`);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(`/carts/${cartId}`);
  });

  it('logs out and redirects to the home page', async () => {
    const response = await browserPost(agent, '/logout');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/');

    const home = await browserGet(agent, '/');
    expect(home.text).toContain('data-testid="nav-login"');
  });

  it('logs in and redirects to the home page', async () => {
    const response = await browserPost(agent, '/login').send({ email, password });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/');
  });
});
