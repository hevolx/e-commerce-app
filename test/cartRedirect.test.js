const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

describe('GET /cart', () => {
  const email = `cart.redirect.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;
  let cartId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Sally',
      lastName: 'Ride',
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

  it('redirects a logged-in user to their cart page', async () => {
    const response = await request(app).get('/cart').set('Cookie', cookie);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(`/carts/${cartId}`);
  });

  describe('when the user has no cart yet', () => {
    const newEmail = `cart.redirect.nocart.${Date.now()}@example.com`;
    let newCookie;
    let newUserId;

    beforeAll(async () => {
      await request(app).post('/register').send({
        email: newEmail,
        password,
        firstName: 'Kalpana',
        lastName: 'Chawla',
      });

      const loginResponse = await request(app).post('/login').send({ email: newEmail, password });
      newCookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));

      const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [newEmail]);
      newUserId = userResult.rows[0].id;
    });

    afterAll(async () => {
      await pool.query('DELETE FROM carts WHERE userid = $1', [newUserId]);
      await pool.query('DELETE FROM users WHERE email = $1', [newEmail]);
    });

    it('creates a cart and redirects to it', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await request(app).get('/cart').set('Cookie', newCookie);

      const cartResult = await pool.query('SELECT id FROM carts WHERE userid = $1', [newUserId]);
      expect(response.status).toBe(302);
      expect(cartResult.rows).toHaveLength(1);
      expect(response.headers.location).toBe(`/carts/${cartResult.rows[0].id}`);
    });
  });
});
