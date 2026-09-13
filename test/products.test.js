const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

describe('GET /products', () => {
  let productId;

  beforeAll(async () => {
    const result = await pool.query(
      `INSERT INTO products (name, price, description)
      VALUES ($1, $2, $3)
      RETURNING id`,
      ['Test Product', 9.99, 'A product used for testing']
    );
    productId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
  });

  it('lists all products', async () => {
    const response = await request(app).get('/products');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productId, name: 'Test Product' })])
    );
  });
});

describe('GET /products/:id', () => {
  let productId;

  beforeAll(async () => {
    const result = await pool.query(
      `INSERT INTO products (name, price, description)
      VALUES ($1, $2, $3)
      RETURNING id`,
      ['Test Product', 9.99, 'A product used for testing']
    );
    productId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
  });

  it('returns the specific product', async () => {
    const response = await request(app).get(`/products/${productId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ id: productId, name: 'Test Product' })
    );
  });

  it('returns 404 when the product does not exist', async () => {
    const nonExistentId = productId + 1000000;

    const response = await request(app).get(`/products/${nonExistentId}`);

    expect(response.status).toBe(404);
  });
});

describe('POST /products', () => {
  const email = `admin.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let createdProductId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    await pool.query('UPDATE users SET isAdmin = true WHERE email = $1', [email]);

    const loginResponse = await request(app).post('/login').send({ email, password });
    cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));
  });

  afterAll(async () => {
    if (createdProductId) {
      await pool.query('DELETE FROM products WHERE id = $1', [createdProductId]);
    }
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('creates a new product', async () => {
    const response = await request(app)
      .post('/products')
      .set('Cookie', cookie)
      .send({ name: 'New Product', price: 19.99, description: 'A brand new product' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'New Product' })
    );
    createdProductId = response.body.id;
  });
});
