const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

describe('Unknown routes', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('renders a 404 page when the route does not exist', async () => {
    const response = await request(app).get('/this-route-does-not-exist');

    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toMatch(/html/);
    expect(response.text).toContain('data-testid="not-found-page"');
  });
});
