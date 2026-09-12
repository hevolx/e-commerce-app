const request = require('supertest');
const { app, sessionStore } = require('../app');
const pool = require('../db/pool.js');

function extractSid(setCookieHeader) {
  const raw = setCookieHeader.find((cookie) => cookie.startsWith('connect.sid='));
  const decoded = decodeURIComponent(raw.split(';')[0].split('=')[1]);
  return decoded.split('.')[0].slice(2);
}

describe('POST /logout', () => {
  const email = `logout.user.${Date.now()}@example.com`;
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

  it('removes the session from the session store', async () => {
    const agent = request.agent(app);
    const loginResponse = await agent.post('/login').send({ email, password });
    const sid = extractSid(loginResponse.headers['set-cookie']);

    await agent.post('/logout');

    const results = await pool.query('SELECT sid FROM session WHERE sid = $1', [sid]);
    expect(results.rows).toHaveLength(0);
  });
});
