const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

describe('GET /product/:id', () => {
  let productId;

  beforeAll(async () => {
    const result = await pool.query(
      `INSERT INTO products (name, price, description)
      VALUES ($1, $2, $3)
      RETURNING id`,
      ['Product Page Test Item', 9.99, 'A product used for testing']
    );
    productId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    await pool.end();
  });

  it('renders the product details', async () => {
    const response = await request(app).get(`/product/${productId}`);

    expect(response.status).toBe(200);
    expect(response.text).toContain('data-testid="product-detail"');
    expect(response.text).toContain('Product Page Test Item');
  });
});
