const request = require('supertest');
const { app, sessionStore } = require('../app');
const pool = require('../db/pool.js');
const { verifyCredentials } = require('../auth/localStrategy');

describe('verifyCredentials', () => {
  const email = `strategy.user.${Date.now()}@example.com`;
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

  it('passes the matching user to the callback for valid credentials', async () => {
    const result = await new Promise((resolve, reject) => {
      verifyCredentials(email, password, (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    expect(result).toMatchObject({ email });
  });
});
