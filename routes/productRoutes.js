const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/', productController.renderAllProducts);
router.get('/product/:id', productController.renderProduct);

router.get('/products', productController.retriveAllProducts);
router.get('/products/:id', productController.retriveProduct);

router.post('/products', isAuthenticated, productController.createProduct);

router.put('/products/:id', isAuthenticated, productController.updateProduct);

router.delete('/products/:id', isAuthenticated, productController.deleteProduct);

module.exports = router;