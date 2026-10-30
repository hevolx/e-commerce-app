const request = require('supertest');
const { app, sessionStore } = require('../app');

describe('GET /api-docs', () => {
  afterAll(async () => {
    await sessionStore.close();
  });

  it('serves the Swagger UI page', async () => {
    const response = await request(app).get('/api-docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger-ui');
  });
});
