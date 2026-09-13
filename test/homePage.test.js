const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

describe('GET /', () => {
  let productId;

  beforeAll(async () => {
    const result = await pool.query(
      `INSERT INTO products (name, price, description)
      VALUES ($1, $2, $3)
      RETURNING id`,
      ['Homepage Test Product', 9.99, 'A product used for testing']
    );
    productId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.end();
  });

  it('renders a list of products', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('data-testid="product-list"');
    expect(response.text).toContain('Homepage Test Product');
  });
});
