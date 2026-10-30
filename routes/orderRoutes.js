const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/orders', isAuthenticated, orderController.getOrders);

module.exports = router;
