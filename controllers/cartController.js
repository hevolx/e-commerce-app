const pool = require('../db/pool');
const { findOwnedCart, findOrCreateCart, findCartItems, sumCartItems } = require('../services/cartService');

const createCart = async (req, res) => {
  const userId = req.user.id;
  const query = `
  INSERT INTO carts (userId)
  VALUES ($1)
  RETURNING *`;

  const { rows } = await pool.query(query, [userId]);

  if (rows[0] == null) {
    return res.sendStatus(409);
  } else { res.status(201).json({ id: rows[0].id, userid: rows[0].userid }) };
}

const addProductToCart = async (req, res) => {
  const cartId = req.params.id;
  const userId = req.user.id;
  const { productId } = req.body;

  const query = `
    INSERT INTO cartItems (cartId, productId)
    VALUES ($1, $2)
    ON CONFLICT (cartId, productId) DO UPDATE SET qty = cartItems.qty + 1
    RETURNING *`;

  try {
    const cart = await findOwnedCart(cartId, userId);
    if (!cart) {
      return res.sendStatus(404);
    }

    const { rows } = await pool.query(query, [cartId, productId]);

    if (rows[0] == null) {
      return res.sendStatus(409);
    } else { res.status(201).json({ cartid: rows[0].cartid, productid: rows[0].productid }) };
  } catch (err) {
    res.sendStatus(500);
  }
}

const addProductToOwnCart = async (req, res) => {
  const { productId } = req.body;
  const cart = await findOrCreateCart(req.user.id);

  await pool.query(
    `INSERT INTO cartItems (cartId, productId)
    VALUES ($1, $2)
    ON CONFLICT (cartId, productId) DO UPDATE SET qty = cartItems.qty + 1`,
    [cart.id, productId]
  );

  res.redirect(`/carts/${cart.id}`);
}

const removeProductFromCart = async (req, res) => {
  const { cartId, itemId } = req.params;
  const userId = req.user.id;

  const query = `
    DELETE FROM cartItems
    WHERE id = $1 AND cartId = $2`;

  try {
    const cart = await findOwnedCart(cartId, userId);
    if (!cart) {
      return res.sendStatus(404);
    }

    await pool.query(query, [itemId, cartId]);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

const calculateTotal = async (req, res) => {
  const cartId = req.params.id;
  const userId = req.user.id;

  try {
    const cart = await findOwnedCart(cartId, userId);
    if (!cart) {
      return res.sendStatus(404);
    }

    const query = `
      SELECT *
      FROM cartItems
      JOIN products ON products.id = cartItems.productId
      WHERE cartId = $1`;

    const { rows } = await pool.query(query, [cartId]);

    const total = sumCartItems(rows);

    res.status(200).json({ total: total });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

const renderCart = async (req, res) => {
  const cartId = req.params.id;
  const userId = req.user.id;

  try {
    const cart = await findOwnedCart(cartId, userId);
    if (!cart) {
      return res.status(404).render('pages/notFound');
    }

    const rows = await findCartItems(cartId);
    const total = sumCartItems(rows);

    res.status(200).render('pages/cart', { carts: rows, total: total, cartId: cartId });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

const redirectToCart = async (req, res) => {
  const cart = await findOrCreateCart(req.user.id);
  res.redirect(`/carts/${cart.id}`);
}

const renderRemoveProductFromCartForm = async (req, res) => {
  const { cartId, itemId } = req.params;
  const userId = req.user.id;

  const query = `
    DELETE FROM cartItems
    WHERE id = $1 AND cartId = $2`;

  const cart = await findOwnedCart(cartId, userId);
  if (!cart) {
    return res.sendStatus(404);
  }

  await pool.query(query, [itemId, cartId]);
  res.redirect(`/carts/${cartId}`);
}

module.exports = {
  createCart,
  addProductToCart,
  addProductToOwnCart,
  removeProductFromCart,
  calculateTotal,
  renderCart,
  redirectToCart,
  renderRemoveProductFromCartForm
};