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

  it('returns 403 when the caller is not an admin', async () => {
    const nonAdminEmail = `regular.user.${Date.now()}@example.com`;
    const nonAdminPassword = 'supersecret123';

    await request(app).post('/register').send({
      email: nonAdminEmail,
      password: nonAdminPassword,
      firstName: 'Grace',
      lastName: 'Hopper',
    });
    const loginResponse = await request(app)
      .post('/login')
      .send({ email: nonAdminEmail, password: nonAdminPassword });
    const nonAdminCookie = loginResponse.headers['set-cookie'].find((c) =>
      c.startsWith('connect.sid=')
    );

    const response = await request(app)
      .post('/products')
      .set('Cookie', nonAdminCookie)
      .send({ name: 'Unauthorized Product', price: 9.99, description: 'Should not be created' });

    expect(response.status).toBe(403);

    await pool.query('DELETE FROM users WHERE email = $1', [nonAdminEmail]);
  });
});

describe('PUT /products/:id', () => {
  const email = `admin.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let productId;

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

    const result = await pool.query(
      `INSERT INTO products (name, price, description)
      VALUES ($1, $2, $3)
      RETURNING id`,
      ['Original Product', 9.99, 'A product used for testing']
    );
    productId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('updates an existing product', async () => {
    const response = await request(app)
      .put(`/products/${productId}`)
      .set('Cookie', cookie)
      .send({ name: 'Updated Product', price: 29.99, description: 'An updated description' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ id: productId, name: 'Updated Product' })
    );
  });
});

describe('DELETE /products/:id', () => {
  const email = `admin.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let productId;

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

    const result = await pool.query(
      `INSERT INTO products (name, price, description)
      VALUES ($1, $2, $3)
      RETURNING id`,
      ['Product To Delete', 9.99, 'A product used for testing']
    );
    productId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('deletes an existing product', async () => {
    const response = await request(app)
      .delete(`/products/${productId}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(200);

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    expect(result.rows).toHaveLength(0);
  });
});
