const request = require('supertest');
const { app } = require('../app');

describe('GET /login', () => {
  it('renders the login form', async () => {
    const response = await request(app).get('/login');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<form');
  });
});

describe('POST /login', () => {
  it('re-renders the login form with an error message when credentials are invalid', async () => {
    const response = await request(app).post('/login').send({
      email: `nonexistent.${Date.now()}@example.com`,
      password: 'wrongpassword',
    });

    expect(response.text).toContain('data-testid="login-error"');
  });
});
