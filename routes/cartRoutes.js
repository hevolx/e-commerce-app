const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const isAuthenticated = require('../middleware/isAuthenticated');

/**
 * @openapi
 * /cart:
 *   post:
 *     summary: Create a cart for the logged-in user
 */
router.post('/cart', isAuthenticated, cartController.createCart);
/**
 * @openapi
 * /cart/{cartId}:
 *   post:
 *     summary: Add a product to the cart
 */
router.post('/cart/:id', isAuthenticated, cartController.addProductToCart);

/**
 * @openapi
 * /cart/{cartId}/items/{itemId}:
 *   delete:
 *     summary: Remove a product from the cart
 */
router.delete('/cart/:cartId/items/:itemId', isAuthenticated, cartController.removeProductFromCart);

/**
 * @openapi
 * /cart/{cartId}:
 *   get:
 *     summary: Get cart contents with total
 */
router.get('/cart/:id', isAuthenticated, cartController.calculateTotal);

router.get('/carts/:id', isAuthenticated, cartController.renderCart);

router.post('/cart/:cartId/items/:itemId/delete', isAuthenticated, cartController.renderRemoveProductFromCartForm);
module.exports = router;
