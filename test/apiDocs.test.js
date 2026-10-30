const request = require('supertest');
const { app, sessionStore } = require('../app');

const fetchSpec = async () => {
  const response = await request(app).get('/api-docs/swagger-ui-init.js');
  const options = response.text.match(/var options = (\{[\s\S]*?\n\});/)[1];

  return JSON.parse(options).swaggerDoc;
};

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

  it('documents the admin product endpoints', async () => {
    const spec = await fetchSpec();

    expect(spec.paths['/products']).toHaveProperty('post');
    expect(spec.paths['/products/{productId}']).toHaveProperty('put');
    expect(spec.paths['/products/{productId}']).toHaveProperty('delete');
  });

  it('documents the user endpoints', async () => {
    const spec = await fetchSpec();

    expect(spec.paths['/users']).toHaveProperty('get');
    expect(spec.paths['/users/{userId}']).toHaveProperty('get');
    expect(spec.paths['/users/{userId}']).toHaveProperty('put');
    expect(spec.paths['/users/{userId}']).toHaveProperty('delete');
  });

  it('documents the cart and checkout endpoints', async () => {
    const spec = await fetchSpec();

    expect(spec.paths['/cart']).toHaveProperty('post');
    expect(spec.paths['/cart/{cartId}']).toHaveProperty('get');
    expect(spec.paths['/cart/{cartId}']).toHaveProperty('post');
    expect(spec.paths['/cart/{cartId}/items/{itemId}']).toHaveProperty('delete');
    expect(spec.paths['/cart/{cartId}/checkout']).toHaveProperty('post');
  });

  it('documents the order endpoints', async () => {
    const spec = await fetchSpec();

    expect(spec.paths['/orders']).toHaveProperty('get');
    expect(spec.paths['/orders/{orderId}']).toHaveProperty('get');
  });
});
