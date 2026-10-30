const pool = require('../db/pool');
const { processPayment } = require('../services/paymentService');
const { findOwnedCart, findCartItems, sumCartItems, emptyCart } = require('../services/cartService');
const { createOrder, findOrderById } = require('../services/orderService');
const wantsHtml = require('../utils/wantsHtml');

const checkoutCart = async (req, res) => {
  const cartId = req.params.id;
  const userId = req.user.id;
  
  try {
    const cart = await findOwnedCart(cartId, userId);
    if (!cart) {
      return res.sendStatus(400);
    }
    
    const query = `
      SELECT ci.id AS cartItemId, ci.qty, p.price, p.id AS productId
      FROM cartItems ci
      JOIN products p ON ci.productId = p.id
      WHERE ci.cartId = $1
    `;
    const { rows } = await pool.query(query, [cartId]);
    
    if (rows.length === 0) {
      return wantsHtml(req) ? res.redirect(`/carts/${cartId}`) : res.sendStatus(400);
    }

    const total = sumCartItems(rows);
    await processPayment(total);
    const order = await createOrder(userId, total, rows);
    await emptyCart(cartId);

    if (wantsHtml(req)) {
      return res.redirect(`/orders/${order.id}/confirmation`);
    }
    res.status(201).json(order);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

const renderCheckout = async (req, res) => {
  const cartId = req.params.id;

  const cart = await findOwnedCart(cartId, req.user.id);
  if (!cart) {
    return res.status(404).render('pages/notFound');
  }

  const items = await findCartItems(cartId);
  res.status(200).render('pages/checkout', { cartId, items, total: sumCartItems(items) });
};

const renderOrderConfirmation = async (req, res) => {
  const order = await findOrderById(req.params.id);
  if (!order || order.userid !== req.user.id) {
    return res.status(404).render('pages/notFound');
  }

  res.status(200).render('pages/orderConfirmation', { order });
};

module.exports = {
  checkoutCart,
  renderCheckout,
  renderOrderConfirmation
}