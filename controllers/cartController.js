const pool = require('../db/pool');

const findOwnedCart = async (cartId, userid) => {
  const { rows } = await pool.query(
    'SELECT id FROM carts WHERE id = $1 AND userid = $2',
    [cartId, userid]
  );
  return rows[0] || null;
};

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
  const userId = req.user.id;

  try {
    const cart = await findOwnedCart(cartId, userId);
    if (!cart) {
      return res.sendStatus(404);
    }

    const query = `
      SELECT cartItems.id, cartItems.qty, products.name, products.price
      FROM cartItems
      JOIN products ON products.id = cartItems.productId
      WHERE cartId = $1`;

    const { rows } = await pool.query(query, [cartId]);

    let total = 0;
    for (let i = 0; i < rows.length; i++) {
      total += rows[i].qty * rows[i].price;
    };

    res.status(200).render('pages/cart', { carts: rows, total: total, cartId: cartId });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
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
  removeProductFromCart,
  calculateTotal,
  renderCart,
  renderRemoveProductFromCartForm
};