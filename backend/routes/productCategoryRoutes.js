const express = require('express');
const {protect} = require("../middleware/authMiddleware");
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require('../controllers/productCategoryController');

const router = express.Router();

router.post('/', protect, createCategory);
router.get('/', protect, getCategories);
router.get('/:categoryId', protect, getCategoryById);
router.put('/:categoryId', protect, updateCategory);
router.delete('/:categoryId', protect, deleteCategory);

module.exports = router;