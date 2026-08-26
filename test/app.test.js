const request = require('supertest');
const app = require('../app');

describe('GET /', () => {
  it('svarar med 200', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
  });
});
