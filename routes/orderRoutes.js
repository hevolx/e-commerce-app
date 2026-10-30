const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const isAuthenticated = require('../middleware/isAuthenticated');

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: List the logged-in user's orders
 */
router.get('/orders', isAuthenticated, orderController.getOrders);
/**
 * @openapi
 * /orders/{orderId}:
 *   get:
 *     summary: Get order details
 */
router.get('/orders/:id', isAuthenticated, orderController.getOrder);
router.get('/order-history', isAuthenticated, orderController.renderOrderHistory);
router.get('/order-history/:id', isAuthenticated, orderController.renderOrderDetail);

module.exports = router;
