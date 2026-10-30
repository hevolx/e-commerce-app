const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

describe('Site header', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('renders a header with navigation links on the login page', async () => {
    const response = await request(app).get('/login');

    expect(response.status).toBe(200);
    expect(response.text).toContain('data-testid="site-header"');
    expect(response.text).toContain('data-testid="site-nav"');
    expect(response.text).toContain('href="/"');
    expect(response.text).toContain('href="/cart"');
  });
});
