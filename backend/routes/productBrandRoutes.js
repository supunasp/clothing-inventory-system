const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const {
    createBrand,
    getBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
} = require('../controllers/productBrandController');

const router = express.Router();

router.post('/', protect, createBrand);
router.get('/', protect, getBrands);
router.get('/:brandId', protect, getBrandById);
router.put('/:brandId', protect, updateBrand);
router.delete('/:brandId', protect, deleteBrand);

module.exports = router;