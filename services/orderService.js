const pool = require('../db/pool');

const createOrder = async (userId, total, cartItems) => {
  const { rows } = await pool.query(
    'INSERT INTO orders (userId, total, status) VALUES ($1, $2, $3) RETURNING id',
    [userId, total, 'COMPLETE']
  );
  const order = rows[0];

  for (const item of cartItems) {
    await pool.query(
      'INSERT INTO orderItems (orderId, productId, qty, price) VALUES ($1, $2, $3, $4)',
      [order.id, item.productid, item.qty, item.price]
    );
  }

  return order;
};

module.exports = {
  createOrder
}
