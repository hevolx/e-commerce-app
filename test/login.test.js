const request = require('supertest');
const { app, sessionStore } = require('../app');
const pool = require('../db/pool.js');

describe('POST /login', () => {
  const email = `login.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let sessionId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
  });

  afterAll(async () => {
    if (sessionId) {
      await new Promise((resolve, reject) => {
        sessionStore.destroy(sessionId, (error) => (error ? reject(error) : resolve()));
      });
    }
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

    const cookie = response.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));
    const rawValue = decodeURIComponent(cookie.split(';')[0].split('=')[1]);
    sessionId = rawValue.split('.')[0].slice(2);
  });

  it('responds with 401 and creates no session when the password is incorrect', async () => {
    const response = await request(app).post('/login').send({ email, password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.headers['set-cookie']).toBeUndefined();
  });
});
