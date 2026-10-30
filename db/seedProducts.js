const pool = require('./pool');

// Free demo catalogue with images, no API key needed
const PRODUCTS_URL = 'https://dummyjson.com/products';
const DEFAULT_LIMIT = 30;

/** Maps a DummyJSON product to the columns of the products table. */
const toProductRow = (product) => ({
  name: product.title,
  price: product.price,
  description: product.description,
  url: product.thumbnail
});

/**
 * Inserts the products and skips any whose name already exists, so the seed
 * can be run again without creating duplicates. Returns how many were added.
 */
const insertProducts = async (products) => {
  const query = `
    INSERT INTO products (name, price, description, url)
    SELECT $1::VARCHAR, $2::DECIMAL, $3::TEXT, $4::VARCHAR
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = $1::VARCHAR)
    RETURNING id`;

  let inserted = 0;
  for (const { name, price, description, url } of products) {
    const { rowCount } = await pool.query(query, [name, price, description, url]);
    inserted += rowCount;
  }

  return inserted;
};

const fetchProducts = async (limit) => {
  const response = await fetch(`${PRODUCTS_URL}?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Fetching products failed with status ${response.status}`);
  }

  const { products } = await response.json();
  return products.map(toProductRow);
};

// Run with `npm run seed:products` or `npm run seed:products -- 100`
if (require.main === module) {
  (async () => {
    const limit = Number(process.argv[2]) || DEFAULT_LIMIT;

    try {
      const products = await fetchProducts(limit);
      const inserted = await insertProducts(products);
      console.log(`Added ${inserted} of ${products.length} products (the rest already existed).`);
    } catch (err) {
      console.log('ERROR SEEDING PRODUCTS: ', err);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  })();
}

module.exports = {
  toProductRow,
  insertProducts
};
