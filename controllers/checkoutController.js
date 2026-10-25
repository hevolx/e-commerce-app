const pool = require('../db/pool');
const { processPayment } = require('../services/paymentService');
const { findOwnedCart, sumCartItems, emptyCart } = require('../services/cartService');
const { createOrder } = require('../services/orderService');

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
      return res.sendStatus(400);
    }

    const total = sumCartItems(rows);
    await processPayment(total);
    const order = await createOrder(userId, total, rows);
    await emptyCart(cartId);

    res.status(201).json(order);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

const renderCheckout = (req, res) => {
  res.status(200).render('pages/checkout', { cartId: req.params.id });
};

const renderOrderConfirmation = (req, res) => {
  res.status(200).render('pages/orderConfirmation', { orderId: req.params.id });
};

module.exports = {
  checkoutCart,
  renderCheckout,
  renderOrderConfirmation
}