const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/', productController.renderAllProducts);
router.get('/product/:id', productController.renderProduct);

/**
 * @openapi
 * /products:
 *   get:
 *     summary: List all products
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/products', productController.retriveAllProducts);
/**
 * @openapi
 * /products/{productId}:
 *   get:
 *     summary: Get a product by id
 *     responses:
 *       200:
 *         description: Product
 */
router.get('/products/:id', productController.retriveProduct);

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Create a product (admin)
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/products', isAuthenticated, productController.createProduct);

/**
 * @openapi
 * /products/{productId}:
 *   put:
 *     summary: Update a product (admin)
 *     responses:
 *       200:
 *         description: Updated product
 */
router.put('/products/:id', isAuthenticated, productController.updateProduct);

/**
 * @openapi
 * /products/{productId}:
 *   delete:
 *     summary: Delete a product (admin)
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete('/products/:id', isAuthenticated, productController.deleteProduct);

module.exports = router;