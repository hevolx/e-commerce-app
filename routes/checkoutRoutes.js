const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/carts/:id/checkout', isAuthenticated, checkoutController.renderCheckout);
router.post('/cart/:id/checkout', isAuthenticated, checkoutController.checkoutCart);

module.exports = router;
