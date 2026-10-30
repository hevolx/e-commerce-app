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

const findOrdersByUser = async (userId) => {
  const { rows } = await pool.query('SELECT * FROM orders WHERE userId = $1', [userId]);
  return rows;
};

const findOrderById = async (orderId) => {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  return rows[0];
};

const findOrderItems = async (orderId) => {
  const query = `
    SELECT oi.qty, oi.price, p.name
    FROM orderItems oi
    JOIN products p ON oi.productId = p.id
    WHERE oi.orderId = $1
  `;
  const { rows } = await pool.query(query, [orderId]);
  return rows;
};

module.exports = {
  createOrder,
  findOrdersByUser,
  findOrderById,
  findOrderItems
}
