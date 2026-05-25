const express = require('express');
const {protect, adminOnly} = require("../middleware/authMiddleware");
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require('../controllers/productCategoryController');

const router = express.Router();

router.post('/', protect, adminOnly, createCategory);
router.get('/', protect, getCategories);
router.get('/:categoryId', protect, getCategoryById);
router.put('/:categoryId', protect, adminOnly, updateCategory);
router.delete('/:categoryId', protect, adminOnly, deleteCategory);

module.exports = router;