const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

describe('Server errors', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('renders a 500 page when a route throws', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(pool, 'query').mockRejectedValueOnce(new Error('database exploded'));

    const response = await request(app).get('/');

    expect(response.status).toBe(500);
    expect(response.headers['content-type']).toMatch(/html/);
    expect(response.text).toContain('data-testid="server-error-page"');
  });
});
