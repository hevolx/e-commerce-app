const request = require('supertest');
const app = require('../app');

describe('GET /register', () => {
  it('renders the registration form', async () => {
    const response = await request(app).get('/register');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<form');
  });
});
