const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const pool = require('../db/pool.js');

describe('POST /register', () => {
  const email = `new.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let user;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    user = result.rows[0];
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
    await pool.end();
  });

  it('creates a new user in the database', () => {
    expect(user).toMatchObject({
      email,
      firstname: 'Ada',
      lastname: 'Lovelace',
    });
  });

  it('stores the password as a bcrypt hash, not in plain text', async () => {
    expect(user.passwordhash).not.toBe(password);
    await expect(bcrypt.compare(password, user.passwordhash)).resolves.toBe(true);
  });
});
