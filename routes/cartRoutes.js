const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/cart', isAuthenticated, cartController.createCart);
router.post('/cart/:id', isAuthenticated, cartController.addProduct);

module.exports = router;
