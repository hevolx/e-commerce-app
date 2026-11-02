const request = require('supertest');
const { app } = require('../app');
const pool = require('../db/pool.js');

describe('Site header', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('renders a header with navigation links on the login page', async () => {
    const response = await request(app).get('/login');

    expect(response.status).toBe(200);
    expect(response.text).toContain('data-testid="site-header"');
    expect(response.text).toContain('data-testid="site-nav"');
    expect(response.text).toContain('href="/"');
    expect(response.text).toContain('href="/cart"');
  });

  it('shows login and register links when the user is logged out', async () => {
    const response = await request(app).get('/login');

    expect(response.text).toContain('data-testid="nav-login"');
    expect(response.text).toContain('href="/login"');
    expect(response.text).toContain('data-testid="nav-register"');
    expect(response.text).toContain('href="/register"');
  });

  describe('when the user is logged in', () => {
    const email = `header.user.${Date.now()}@example.com`;
    const password = 'supersecret123';
    let cookie;

    beforeAll(async () => {
      await request(app).post('/register').send({
        email,
        password,
        firstName: 'Mae',
        lastName: 'Jemison',
      });

      const loginResponse = await request(app).post('/login').send({ email, password });
      cookie = loginResponse.headers['set-cookie'].find((c) => c.startsWith('connect.sid='));
    });

    afterAll(async () => {
      await pool.query('DELETE FROM users WHERE email = $1', [email]);
    });

    it('shows account, order history and logout instead of login and register', async () => {
      const response = await request(app).get('/login').set('Cookie', cookie);

      expect(response.text).toContain('data-testid="nav-account"');
      expect(response.text).toContain('data-testid="nav-order-history"');
      expect(response.text).toContain('data-testid="nav-logout"');
      expect(response.text).not.toContain('data-testid="nav-login"');
      expect(response.text).not.toContain('data-testid="nav-register"');
    });
  });
});
