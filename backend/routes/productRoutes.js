const express = require('express');
const {protect, adminOnly} = require("../middleware/authMiddleware");
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateProductStatus,
} = require('../controllers/productController');

const router = express.Router();

router.post('/', protect, createProduct);
router.get('/', protect, getProducts);
router.get('/:productId', protect, getProductById);
router.put('/:productId', protect, updateProduct);
router.patch('/:productId/status', protect, adminOnly, updateProductStatus);
router.delete('/:productId', protect, deleteProduct);

module.exports = router;