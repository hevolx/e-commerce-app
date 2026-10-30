const pool = require('../db/pool');

const findOwnedCart = async (cartId, userid) => {
  const { rows } = await pool.query(
    'SELECT id FROM carts WHERE id = $1 AND userid = $2',
    [cartId, userid]
  );
  return rows[0] || null;
};

const findOrCreateCart = async (userId) => {
  let { rows } = await pool.query('SELECT id FROM carts WHERE userid = $1', [userId]);

  if (rows[0] == null) {
    ({ rows } = await pool.query('INSERT INTO carts (userId) VALUES ($1) RETURNING id', [userId]));
  }

  return rows[0];
};

const findCartItems = async (cartId) => {
  const query = `
    SELECT cartItems.id, cartItems.qty, products.id AS productid, products.name, products.price
    FROM cartItems
    JOIN products ON products.id = cartItems.productId
    WHERE cartId = $1
    ORDER BY cartItems.id`;

  const { rows } = await pool.query(query, [cartId]);
  return rows;
};

const sumCartItems = (items) => {
  return items.reduce((sum, item) => sum + item.qty * Number(item.price), 0);
};

const emptyCart = async (cartId) => {
  await pool.query('DELETE FROM cartItems WHERE cartId = $1', [cartId]);
};

module.exports = {
  findOwnedCart,
  findOrCreateCart,
  findCartItems,
  sumCartItems,
  emptyCart
}
