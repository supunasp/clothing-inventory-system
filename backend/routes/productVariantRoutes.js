const express = require('express');
const {protect} = require("../middleware/authMiddleware");
const {
    createProductVariant,
    getProductVariants,
    getProductVariantById,
    updateProductVariant,
    adjustInventory,
    deleteProductVariant,
} = require('../controllers/productVariantController');

const router = express.Router();

router.post('/', protect, createProductVariant);
router.get('/', protect, getProductVariants);
router.get('/:sku', protect, getProductVariantById);
router.put('/:sku', protect, updateProductVariant);
router.post('/:sku/inventory', protect, adjustInventory);
router.delete('/:sku', protect, deleteProductVariant);

module.exports = router;