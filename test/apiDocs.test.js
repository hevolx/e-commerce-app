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

  it('documents the authentication endpoints', async () => {
    const response = await request(app).get('/api-docs/swagger-ui-init.js');

    expect(response.status).toBe(200);
    expect(response.text).toContain('"/register"');
    expect(response.text).toContain('"/login"');
    expect(response.text).toContain('"/logout"');
  });

  it('documents the product endpoints', async () => {
    const response = await request(app).get('/api-docs/swagger-ui-init.js');

    expect(response.status).toBe(200);
    expect(response.text).toContain('"/products"');
    expect(response.text).toContain('"/products/{productId}"');
  });
});
