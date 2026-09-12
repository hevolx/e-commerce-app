const request = require('supertest');
const { app, sessionStore } = require('../app');
const pool = require('../db/pool.js');

describe('Session middleware', () => {
  afterAll(async () => {
    await sessionStore.close();
    await pool.end();
  });

  it('does not issue a session cookie for an unauthenticated request', async () => {
    const response = await request(app).get('/');

    expect(response.headers['set-cookie']).toBeUndefined();
  });
});
