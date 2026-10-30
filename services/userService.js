const pool = require('../db/pool');

/**
 * Deletes a user together with their carts and orders. Child rows are removed
 * before their parents so no foreign key blocks the delete, and everything runs
 * in one transaction so a failure leaves the user untouched.
 */
const deleteUserWithData = async (userId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      'DELETE FROM cartItems WHERE cartId IN (SELECT id FROM carts WHERE userId = $1)',
      [userId]
    );
    await client.query('DELETE FROM carts WHERE userId = $1', [userId]);
    await client.query(
      'DELETE FROM orderItems WHERE orderId IN (SELECT id FROM orders WHERE userId = $1)',
      [userId]
    );
    await client.query('DELETE FROM orders WHERE userId = $1', [userId]);
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  deleteUserWithData
}
