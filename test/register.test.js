const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool.js');

describe('POST /register', () => {
  const email = `new.user.${Date.now()}@example.com`;

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
    await pool.end();
  });

  it('creates a new user in the database', async () => {
    await request(app).post('/register').send({
      email,
      password: 'supersecret123',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    expect(result.rows[0]).toMatchObject({
      email,
      firstname: 'Ada',
      lastname: 'Lovelace',
    });
  });
});
