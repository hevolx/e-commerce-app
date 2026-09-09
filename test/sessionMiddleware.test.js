const request = require('supertest');
const { app, sessionStore } = require('../app');
const pool = require('../db/pool.js');

describe('Session middleware', () => {
  afterAll(async () => {
    await sessionStore.close();
    await pool.end();
  });

  it('issues a session cookie on a request', async () => {
    const response = await request(app).get('/');

    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringMatching(/connect\.sid=/)])
    );
  });
});
