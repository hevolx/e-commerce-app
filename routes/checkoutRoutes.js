const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/carts/:id/checkout', isAuthenticated, checkoutController.renderCheckout);
/**
 * @openapi
 * /cart/{cartId}/checkout:
 *   post:
 *     summary: Check out the cart and create an order
 */
router.post('/cart/:id/checkout', isAuthenticated, checkoutController.checkoutCart);
router.get('/orders/:id/confirmation', isAuthenticated, checkoutController.renderOrderConfirmation);

module.exports = router;
