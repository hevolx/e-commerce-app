const request = require('supertest');
const { app, sessionStore } = require('../app');
const pool = require('../db/pool.js');

describe('POST /login', () => {
  const email = `login.user.${Date.now()}@example.com`;
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

  it('creates a session and responds with success when credentials are correct', async () => {
    const response = await request(app).post('/login').send({ email, password });

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringMatching(/connect\.sid=/)])
    );
  });
});
