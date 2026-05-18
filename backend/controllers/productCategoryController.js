const ProductCategory = require('../models/ProductCategory');

// Create a new product category
const createCategory = async (req, res) => {
    try {
        const {categoryId, categoryName} = req.body;

        if (!categoryId || !categoryName) {
            return res.status(400).json({
                message: 'categoryId and categoryName are required',
            });
        }

        const existingCategory = await ProductCategory.findOne({categoryId});

        if (existingCategory) {
            return res.status(409).json({
                message: 'ProductCategory with this categoryId already exists',
            });
        }

        const category = await ProductCategory.create({
            categoryId,
            categoryName,
        });

        return res.status(201).json({
            message: 'ProductCategory created successfully',
            category,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error creating category',
            error: error.message,
        });
    }
};

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await ProductCategory.find().sort({createdAt: -1});

        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching categories',
            error: error.message,
        });
    }
};

// Get a single category by categoryId
const getCategoryById = async (req, res) => {
    try {
        const {categoryId} = req.params;

        const category = await ProductCategory.findOne({categoryId});

        if (!category) {
            return res.status(404).json({
                message: 'ProductCategory not found',
            });
        }

        return res.status(200).json(convertToResponse(category));
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching category',
            error: error.message,
        });
    }
};

// Update category by categoryId
const updateCategory = async (req, res) => {
    try {
        const {categoryId} = req.params;
        const {categoryName} = req.body;

        if (!categoryName) {
            return res.status(400).json({
                message: 'categoryName is required',
            });
        }

        const updatedCategory = await ProductCategory.findOneAndUpdate(
            {categoryId},
            {categoryName},
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                message: 'ProductCategory not found',
            });
        }

        return res.status(200).json({
            message: 'ProductCategory updated successfully',
            category: convertToResponse(updatedCategory),
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating category',
            error: error.message,
        });
    }
};

// Delete category by categoryId
const deleteCategory = async (req, res) => {
    try {
        const {categoryId} = req.params;

        const deletedCategory = await ProductCategory.findOneAndDelete({categoryId});

        if (!deletedCategory) {
            return res.status(404).json({
                message: 'ProductCategory not found',
            });
        }

        return res.status(200).json({
            message: 'ProductCategory deleted successfully',
            category: convertToResponse(deletedCategory),
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error deleting category',
            error: error.message,
        });
    }
};

function convertToResponse(category) {
    return {
        id: category.id,
        categoryId: category.categoryId,
        name: category.name,
    };
}

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};