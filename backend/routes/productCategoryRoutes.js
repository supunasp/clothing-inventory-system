const express = require('express');

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require('../controllers/productCategoryController');

const router = express.Router();

router.post('/', createCategory);
router.get('/', getCategories);
router.get('/:categoryId', getCategoryById);
router.put('/:categoryId', updateCategory);
router.delete('/:categoryId', deleteCategory);

module.exports = router;