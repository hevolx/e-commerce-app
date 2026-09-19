const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

describe('POST /cart', () => {
  const email = `cart.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const loginResponse = await request(app).post('/login').send({ email, password });
    cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    userId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM carts WHERE userid = $1', [userId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('creates a new cart for the logged-in user', async () => {
    const response = await request(app).post('/cart').set('Cookie', cookie);

    expect(response.status).toBe(201);

    const result = await pool.query('SELECT * FROM carts WHERE id = $1', [response.body.id]);
    expect(result.rows[0]).toMatchObject({ userid: userId });
  });
});

describe('POST /cart/:cartId', () => {
  const email = `cart.items.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;
  let cartId;
  let productId;

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

    const productResult = await pool.query(
      `INSERT INTO products (name, price, description)
      VALUES ($1, $2, $3)
      RETURNING id`,
      ['Cart Test Product', 9.99, 'A product used for cart testing']
    );
    productId = productResult.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM cartItems WHERE cartId = $1', [cartId]);
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.query('DELETE FROM carts WHERE userid = $1', [userId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('adds a product to the cart', async () => {
    const response = await request(app)
      .post(`/cart/${cartId}`)
      .set('Cookie', cookie)
      .send({ productId });

    expect(response.status).toBe(201);

    const result = await pool.query(
      'SELECT * FROM cartItems WHERE cartId = $1 AND productId = $2',
      [cartId, productId]
    );
    expect(result.rows).toHaveLength(1);
  });
});
