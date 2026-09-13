const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/products', productController.retriveAllProducts);
router.get('/products/:id', productController.retriveProduct);

router.post('/products', productController.createProduct);

router.put('/products/:id', productController.updateProduct);

module.exports = router;