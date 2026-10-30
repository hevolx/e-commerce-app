const pool = require('../db/pool.js');
const { toProductRow, insertProducts } = require('../db/seedProducts');

// Shaped like a product from https://dummyjson.com/products
const apiProduct = {
  id: 1,
  title: `Seed Test Mascara ${Date.now()}`,
  price: 9.99,
  description:
    'A popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting formula.',
  thumbnail: 'https://cdn.dummyjson.com/product-images/beauty/mascara/thumbnail.webp',
  category: 'beauty',
};

afterAll(async () => {
  await pool.query('DELETE FROM products WHERE name = $1', [apiProduct.title]);
  await pool.end();
});

describe('toProductRow', () => {
  it('maps an API product to the columns of the products table', () => {
    expect(toProductRow(apiProduct)).toEqual({
      name: apiProduct.title,
      price: 9.99,
      description: apiProduct.description,
      url: apiProduct.thumbnail,
    });
  });
});

describe('insertProducts', () => {
  it('stores the products, including descriptions longer than 50 characters', async () => {
    const inserted = await insertProducts([toProductRow(apiProduct)]);

    const { rows } = await pool.query('SELECT * FROM products WHERE name = $1', [apiProduct.title]);
    expect(inserted).toBe(1);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      price: '9.99',
      description: apiProduct.description,
      url: apiProduct.thumbnail,
    });
  });

  it('skips products that already exist so it can run more than once', async () => {
    const inserted = await insertProducts([toProductRow(apiProduct)]);

    const { rows } = await pool.query('SELECT id FROM products WHERE name = $1', [apiProduct.title]);
    expect(inserted).toBe(0);
    expect(rows).toHaveLength(1);
  });
});
