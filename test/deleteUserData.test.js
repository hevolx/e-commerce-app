const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

// Registers a user, logs in and gives them a cart item and a completed order
const createShopper = async (email, productId) => {
  const password = 'supersecret123';
  await request(app).post('/register').send({
    email,
    password,
    firstName: 'Hedy',
    lastName: 'Lamarr',
  });

  const loginResponse = await request(app).post('/login').send({ email, password });
  const cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));

  const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  const userId = userResult.rows[0].id;

  const cartResponse = await request(app).post('/cart').set('Cookie', cookie);
  const cartId = cartResponse.body.id;

  await request(app).post(`/cart/${cartId}`).set('Cookie', cookie).send({ productId });
  await request(app).post(`/cart/${cartId}/checkout`).set('Cookie', cookie);
  await request(app).post(`/cart/${cartId}`).set('Cookie', cookie).send({ productId });

  return { cookie, userId };
};

const countUserData = async (userId) => {
  const { rows } = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM users WHERE id = $1) AS users,
      (SELECT COUNT(*) FROM carts WHERE userId = $1) AS carts,
      (SELECT COUNT(*) FROM cartItems WHERE cartId IN (SELECT id FROM carts WHERE userId = $1)) AS cartitems,
      (SELECT COUNT(*) FROM orders WHERE userId = $1) AS orders`,
    [userId]
  );
  return rows[0];
};

describe('deleting a user who has a cart and orders', () => {
  let productId;

  beforeAll(async () => {
    const result = await pool.query(
      `INSERT INTO products (name, price, description)
      VALUES ($1, $2, $3)
      RETURNING id`,
      ['Delete Data Test Product', 20.0, 'A product used for deletion testing']
    );
    productId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
  });

  it('removes the account and its data via the account page', async () => {
    const { cookie, userId } = await createShopper(`delete.data.page.${Date.now()}@example.com`, productId);
    expect(await countUserData(userId)).toEqual({ users: '1', carts: '1', cartitems: '1', orders: '1' });

    const response = await request(app)
      .post('/account/delete')
      .set('Cookie', cookie)
      .send({ confirmDelete: 'on' });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
    expect(await countUserData(userId)).toEqual({ users: '0', carts: '0', cartitems: '0', orders: '0' });
  });

  it('removes the account and its data via the API', async () => {
    const { cookie, userId } = await createShopper(`delete.data.api.${Date.now()}@example.com`, productId);

    const response = await request(app).delete(`/users/${userId}`).set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(await countUserData(userId)).toEqual({ users: '0', carts: '0', cartitems: '0', orders: '0' });
  });
});
