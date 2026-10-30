const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/orders', isAuthenticated, orderController.getOrders);
router.get('/orders/:id', isAuthenticated, orderController.getOrder);
router.get('/order-history', isAuthenticated, orderController.renderOrderHistory);
router.get('/order-history/:id', isAuthenticated, orderController.renderOrderDetail);

module.exports = router;
