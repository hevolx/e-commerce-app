const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

describe('POST /cart/:cartId/checkout', () => {
  const email = `checkout.empty.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;
  let cartId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Grace',
      lastName: 'Hopper',
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

  it('responds with 400 when the cart is empty', async () => {
    const response = await request(app)
      .post(`/cart/${cartId}/checkout`)
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
  });
});

describe('POST /cart/:cartId/checkout with products in the cart', () => {
  const email = `checkout.filled.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;
  let cartId;
  let productId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Margaret',
      lastName: 'Hamilton',
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
      ['Checkout Test Product', 9.99, 'A product used for checkout testing']
    );
    productId = productResult.rows[0].id;

    await request(app)
      .post(`/cart/${cartId}`)
      .set('Cookie', cookie)
      .send({ productId });
  });

  afterAll(async () => {
    await pool.query(
      'DELETE FROM orderItems WHERE orderId IN (SELECT id FROM orders WHERE userId = $1)',
      [userId]
    );
    await pool.query('DELETE FROM orders WHERE userId = $1', [userId]);
    await pool.query('DELETE FROM cartItems WHERE cartId = $1', [cartId]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.query('DELETE FROM carts WHERE userid = $1', [userId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('responds with 201 when the payment succeeds', async () => {
    const response = await request(app)
      .post(`/cart/${cartId}/checkout`)
      .set('Cookie', cookie);

    expect(response.status).toBe(201);
  });
});
