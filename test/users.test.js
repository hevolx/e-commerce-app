const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

describe('GET /users', () => {
  const email = `admin.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    await pool.query('UPDATE users SET isAdmin = true WHERE email = $1', [email]);

    const loginResponse = await request(app).post('/login').send({ email, password });
    cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('lists all users', async () => {
    const response = await request(app).get('/users').set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ email })])
    );
  });
});

describe('GET /users/:id', () => {
  const email = `profile.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Grace',
      lastName: 'Hopper',
    });

    const loginResponse = await request(app).post('/login').send({ email, password });
    cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    userId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it("returns the user's profile", async () => {
    const response = await request(app).get(`/users/${userId}`).set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ id: userId, email })
    );
  });

  it("returns 403 when the caller requests another user's profile without admin rights", async () => {
    const otherEmail = `other.user.${Date.now()}@example.com`;
    const otherPassword = 'supersecret123';

    await request(app).post('/register').send({
      email: otherEmail,
      password: otherPassword,
      firstName: 'Katherine',
      lastName: 'Johnson',
    });
    const otherLoginResponse = await request(app)
      .post('/login')
      .send({ email: otherEmail, password: otherPassword });
    const otherCookie = otherLoginResponse.headers['set-cookie'].find((c) =>
      c.startsWith('connect.sid=')
    );

    const response = await request(app).get(`/users/${userId}`).set('Cookie', otherCookie);

    expect(response.status).toBe(403);

    await pool.query('DELETE FROM users WHERE email = $1', [otherEmail]);
  });
});

describe('PUT /users/:id', () => {
  const email = `update.user.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;
  let userId;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Margaret',
      lastName: 'Hamilton',
    });

    const loginResponse = await request(app).post('/login').send({ email, password });
    cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    userId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it("updates the caller's own profile", async () => {
    const response = await request(app)
      .put(`/users/${userId}`)
      .set('Cookie', cookie)
      .send({ firstName: 'Katherine' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ id: userId, firstName: 'Katherine' })
    );
  });

  it("returns 403 when the caller tries to update another user's profile", async () => {
    const otherEmail = `other.update.${Date.now()}@example.com`;
    const otherPassword = 'supersecret123';

    await request(app).post('/register').send({
      email: otherEmail,
      password: otherPassword,
      firstName: 'Dorothy',
      lastName: 'Vaughan',
    });
    const otherLoginResponse = await request(app)
      .post('/login')
      .send({ email: otherEmail, password: otherPassword });
    const otherCookie = otherLoginResponse.headers['set-cookie'].find((c) =>
      c.startsWith('connect.sid=')
    );

    const response = await request(app)
      .put(`/users/${userId}`)
      .set('Cookie', otherCookie)
      .send({ firstName: 'Hijacked' });

    expect(response.status).toBe(403);

    await pool.query('DELETE FROM users WHERE email = $1', [otherEmail]);
  });
});
