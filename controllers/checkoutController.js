const pool = require('../db/pool');

const findOwnedCart = async (cartId, userid) => {
  const { rows } = await pool.query(
    'SELECT id FROM carts WHERE id = $1 AND userid = $2',
    [cartId, userid]
  );
  return rows[0] || null;
};

const checkoutCart = async (req, res) => {
  const cartId = req.params.id;
  const userId = req.user.id;
  
  try {
    const cart = await findOwnedCart(cartId, userId);
    if (!cart) {
      return res.sendStatus(400);
    }
    
    const query = `
      SELECT ci.id AS cartItemId, ci.qty, p.price
      FROM cartItems ci
      JOIN products p ON ci.productId = p.id
      WHERE ci.cartId = $1
    `;
    const { rows } = await pool.query(query, [cartId]);
    
    if (rows.length === 0) {
      return res.sendStatus(400);
    } else { res.json(rows) }
  
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

module.exports = {
  checkoutCart
}