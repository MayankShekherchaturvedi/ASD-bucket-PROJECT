const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { cacheMiddleware } = require('../middleware/cache');

router.get('/', cacheMiddleware, productController.getAllProducts);
router.get('/:id', cacheMiddleware, productController.getProductById);
router.post('/', cacheMiddleware, productController.createProduct);
router.put('/:id', cacheMiddleware, productController.updateProduct);
router.patch('/:id', cacheMiddleware, productController.patchProduct);
router.delete('/:id', cacheMiddleware, productController.deleteProduct);

module.exports = router;
