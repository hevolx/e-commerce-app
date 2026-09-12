const request = require('supertest');
const { app } = require('../app');

describe('GET /login', () => {
  it('renders the login form', async () => {
    const response = await request(app).get('/login');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<form');
  });
});
