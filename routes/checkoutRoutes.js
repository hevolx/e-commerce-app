const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/cart/:id/checkout', isAuthenticated, checkoutController.checkoutCart);

module.exports = router;
