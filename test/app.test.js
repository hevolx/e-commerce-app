const request = require('supertest');
const { app, sessionStore } = require('../app');

describe('GET /', () => {
  afterAll(async () => {
    await sessionStore.close();
  });

  it('responds with 200', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
  });
});
