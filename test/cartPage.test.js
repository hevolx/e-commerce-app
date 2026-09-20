const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

describe('GET /carts/:id', () => {
  const email = `cart.page.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;
  let cartId;
  let productId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Valentina',
      lastName: 'Tereshkova',
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
      ['Cart Page Test Product', 10.00, 'A product used for cart page testing']
    );
    productId = productResult.rows[0].id;

    await request(app).post(`/cart/${cartId}`).set('Cookie', cookie).send({ productId });
  });

  afterAll(async () => {
    await pool.query('DELETE FROM cartItems WHERE cartId = $1', [cartId]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.query('DELETE FROM carts WHERE userid = $1', [userId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('renders the cart contents with the total', async () => {
    const response = await request(app).get(`/carts/${cartId}`).set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.text).toContain('data-testid="cart-page"');
    expect(response.text).toContain('Cart Page Test Product');
    expect(response.text).toContain('10');
  });
});
