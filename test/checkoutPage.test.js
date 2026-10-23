const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

describe('GET /carts/:id/checkout', () => {
  const email = `checkout.page.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;
  let cartId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Katherine',
      lastName: 'Johnson',
    });

    const loginResponse = await request(app).post('/login').send({ email, password });
    cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    userId = userResult.rows[0].id;

    const cartResponse = await request(app).post('/cart').set('Cookie', cookie);
    cartId = cartResponse.body.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM carts WHERE userid = $1', [userId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('renders a checkout form that posts to the checkout endpoint', async () => {
    const response = await request(app).get(`/carts/${cartId}/checkout`).set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.text).toContain('data-testid="checkout-form"');
    expect(response.text).toContain(`action="/cart/${cartId}/checkout"`);
  });
});

describe('GET /orders/:id/confirmation', () => {
  const email = `order.confirmation.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;
  let cartId;
  let productId;
  let orderId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Dorothy',
      lastName: 'Vaughan',
    });

    const loginResponse = await request(app).post('/login').send({ email, password });
    cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    userId = userResult.rows[0].id;

    const cartResponse = await request(app).post('/cart').set('Cookie', cookie);
    cartId = cartResponse.body.id;

    const productResult = await pool.query(
      `INSERT INTO products (name, price, description)
      VALUES ($1, $2, $3)
      RETURNING id`,
      ['Confirmation Test Product', 15.0, 'A product used for order confirmation testing']
    );
    productId = productResult.rows[0].id;

    await request(app).post(`/cart/${cartId}`).set('Cookie', cookie).send({ productId });

    const checkoutResponse = await request(app)
      .post(`/cart/${cartId}/checkout`)
      .set('Cookie', cookie);
    orderId = checkoutResponse.body.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM orderItems WHERE orderId = $1', [orderId]);
    await pool.query('DELETE FROM orders WHERE userId = $1', [userId]);
    await pool.query('DELETE FROM cartItems WHERE cartId = $1', [cartId]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.query('DELETE FROM carts WHERE userid = $1', [userId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('renders a confirmation for the completed order', async () => {
    const response = await request(app)
      .get(`/orders/${orderId}/confirmation`)
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.text).toContain('data-testid="order-confirmation"');
    expect(response.text).toContain(`Order #${orderId}`);
  });
});
