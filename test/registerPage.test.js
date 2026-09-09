const request = require('supertest');
const { app, sessionStore } = require('../app');
const pool = require('../db/pool.js');

describe('GET /register', () => {
  it('renders the registration form', async () => {
    const response = await request(app).get('/register');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<form');
  });
});

describe('POST /register', () => {
  const email = `duplicate.user.${Date.now()}@example.com`;
  const password = 'supersecret123';

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
    await sessionStore.close();
    await pool.end();
  });

  it('re-renders the registration form with an error message when the email is already registered', async () => {
    const response = await request(app).post('/register').send({
      email,
      password,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    expect(response.text).toContain('data-testid="register-error"');
  });
});
