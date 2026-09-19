const pool = require('../db/pool');

const createCart = async (req, res) => {
  const userid = req.user.id;
  const query = `
  INSERT INTO carts (userId)
  VALUES ($1)
  RETURNING *`;

  const { rows } = await pool.query(query, [userid]);

  if (rows[0] == null) {
    return res.sendStatus(409);
  } else { res.status(201).json({ id: rows[0].id, userid: rows[0].userId }) };
}

const addProduct = async (req, res) => {
  const cartId = req.params.id;
  const { productId } = req.body;

  const query = `
    INSERT INTO cartItems (cartId, productId)
    VALUES ($1, $2)
    ON CONFLICT (cartId, productId) DO UPDATE SET qty = cartItems.qty + 1
    RETURNING *`;

  try {
    const { rows } = await pool.query(query, [cartId, productId]);

    if (rows[0] == null) {
      return res.sendStatus(409);
    } else { res.status(201).json({ cartid: rows[0].cartId, productid: rows[0].productId }) };
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

module.exports = {
  createCart,
  addProduct
};