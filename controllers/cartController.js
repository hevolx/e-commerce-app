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

const addProductToCart = async (req, res) => {
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
    res.sendStatus(500);
  }
}

const removeProductFromCart = async (req, res) => {
  const { cartId, itemId } = req.params;

  const query = `
    DELETE FROM cartItems
    WHERE id = $1 AND cartId = $2`;

  try {
    await pool.query(query, [itemId, cartId]);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

const calculateTotal = async (req, res) => {
  const cartId = req.params.id;

  try {
    const query = `
      SELECT *
      FROM cartItems
      JOIN products ON products.id = cartItems.productId
      WHERE cartId = $1`;

    const { rows } = await pool.query(query, [cartId]);

    let total = 0;
    for (let i = 0; i < rows.length; i++) {
      total += rows[i].qty * rows[i].price;
    };

    res.status(200).json({ total: total });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

const renderCart = async (req, res) => {
  const cartId = req.params.id;

  try {
    const query = `
      SELECT *
      FROM cartItems
      JOIN products ON products.id = cartItems.productId
      WHERE cartId = $1`;

    const { rows } = await pool.query(query, [cartId]);

    let total = 0;
    for (let i = 0; i < rows.length; i++) {
      total += rows[i].qty * rows[i].price;
    };

    if (rows[0] == null) {
      return res.sendStatus(404);
    } else { res.status(200).render('pages/cart', { carts: rows, total: total }) }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

module.exports = {
  createCart,
  addProductToCart,
  removeProductFromCart,
  calculateTotal,
  renderCart
};