const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

describe('GET /carts/:id/checkout', () => {
  const email = `checkout.page.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;
  let cartId;

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

    const cartResponse = await request(app).post('/cart').set('Cookie', cookie);
    cartId = cartResponse.body.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM carts WHERE userid = $1', [userId]);
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('renders a checkout form that posts to the checkout endpoint', async () => {
    const response = await request(app).get(`/carts/${cartId}/checkout`).set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.text).toContain('data-testid="checkout-form"');
    expect(response.text).toContain(`action="/cart/${cartId}/checkout"`);
  });
});
