const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

afterAll(async () => {
  await pool.end();
});

describe('GET /account', () => {
  const email = `account.page.${Date.now()}@example.com`;
  const password = 'supersecret123';
  let cookie;

  beforeAll(async () => {
    await request(app).post('/register').send({
      email,
      password,
      firstName: 'Rosalind',
      lastName: 'Franklin',
    });

    const loginResponse = await request(app).post('/login').send({ email, password });
    cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it("renders the logged-in user's profile", async () => {
    const response = await request(app).get('/account').set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.text).toContain('data-testid="account-profile"');
    expect(response.text).toContain(email);
  });

  it('redirects to /login when there is no session', async () => {
    const response = await request(app).get('/account');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });

  it('renders an edit form prefilled with the current firstName', async () => {
    const response = await request(app).get('/account').set('Cookie', cookie);

    expect(response.text).toContain('data-testid="account-edit-form"');
    expect(response.text).toContain('value="Rosalind"');
  });

  it('redirects to /account after saving a new firstName', async () => {
    const response = await request(app)
      .post('/account')
      .set('Cookie', cookie)
      .send({ firstname: 'Marie' });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/account');
  });

  it('renders a delete-account form requiring confirmation', async () => {
    const response = await request(app).get('/account').set('Cookie', cookie);

    expect(response.text).toContain('data-testid="account-delete-form"');
    expect(response.text).toContain('name="confirmDelete"');
    expect(response.text).toContain('required');
  });

  it('deletes the account and redirects to /login when confirmed', async () => {
    const response = await request(app)
      .post('/account/delete')
      .set('Cookie', cookie)
      .send({ confirmDelete: 'on' });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    expect(result.rows).toHaveLength(0);
  });
});
