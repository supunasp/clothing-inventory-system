const express = require('express');
const {protect, adminOnly} = require('../middleware/authMiddleware');
const {
    createBrand,
    getBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
} = require('../controllers/productBrandController');

const router = express.Router();

router.post('/', protect, adminOnly, createBrand);
router.get('/', protect, getBrands);
router.get('/:brandId', protect, getBrandById);
router.put('/:brandId', protect, adminOnly, updateBrand);
router.delete('/:brandId', protect, adminOnly, deleteBrand);

module.exports = router;