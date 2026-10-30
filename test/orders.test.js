const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

describe('GET /orders', () => {
  const email = `orders.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;
  let orderId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Mary',
      lastName: 'Jackson',
    });

    const loginResponse = await request(app).post('/login').send({ email, password });
    cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    userId = userResult.rows[0].id;

    const orderResult = await pool.query(
      'INSERT INTO orders (userId, total, status) VALUES ($1, $2, $3) RETURNING id',
      [userId, 42.5, 'COMPLETE']
    );
    orderId = orderResult.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM orders WHERE userId = $1', [userId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it("lists the logged-in user's orders", async () => {
    const response = await request(app).get('/orders').set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ id: orderId });
  });
});

describe('GET /orders/:orderId', () => {
  const email = `order.details.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;
  let orderId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Katherine',
      lastName: 'Johnson',
    });

    const loginResponse = await request(app).post('/login').send({ email, password });
    cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    userId = userResult.rows[0].id;

    const orderResult = await pool.query(
      'INSERT INTO orders (userId, total, status) VALUES ($1, $2, $3) RETURNING id',
      [userId, 99.0, 'COMPLETE']
    );
    orderId = orderResult.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM orders WHERE userId = $1', [userId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('returns the details of a specific order', async () => {
    const response = await request(app).get(`/orders/${orderId}`).set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: orderId, userid: userId, status: 'COMPLETE' });
  });
});
