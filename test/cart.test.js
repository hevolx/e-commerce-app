const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

describe('POST /cart', () => {
  const email = `cart.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const loginResponse = await request(app).post('/login').send({ email, password });
    cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    userId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM carts WHERE userid = $1', [userId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('creates a new cart for the logged-in user', async () => {
    const response = await request(app).post('/cart').set('Cookie', cookie);

    expect(response.status).toBe(201);

    const result = await pool.query('SELECT * FROM carts WHERE id = $1', [response.body.id]);
    expect(result.rows[0]).toMatchObject({ userid: userId });
  });
});
