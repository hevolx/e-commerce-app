const pool = require('../db/pool');

const findOwnedCart = async (cartId, userid) => {
  const { rows } = await pool.query(
    'SELECT id FROM carts WHERE id = $1 AND userid = $2',
    [cartId, userid]
  );
  return rows[0] || null;
};

const sumCartItems = (items) => {
  return items.reduce((sum, item) => sum + item.qty * Number(item.price), 0);
};

const emptyCart = async (cartId, userId) => {
  const { rows } = await pool.query(
    'DELETE FROM cartItems WHERE cartId = $1',
    [cartId]
  );
  return rows[0] || null;
};

module.exports = {
  findOwnedCart,
  sumCartItems,
  emptyCart
}
