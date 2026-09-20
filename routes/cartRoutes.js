const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/cart', isAuthenticated, cartController.createCart);
router.post('/cart/:id', isAuthenticated, cartController.addProductToCart);

router.delete('/cart/:cartId/items/:itemId', isAuthenticated, cartController.removeProductFromCart);

router.get('/cart/:id', isAuthenticated, cartController.calculateTotal);

router.get('/carts/:id', isAuthenticated, cartController.renderCart);

module.exports = router;
