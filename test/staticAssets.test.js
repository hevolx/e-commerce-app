const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

describe('Static assets', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('serves the stylesheet at /css/style.css', async () => {
    const response = await request(app).get('/css/style.css');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/css/);
  });
});
