const ProductCategory = require('../models/ProductCategory');

const createCategory = async ({categoryId, categoryName}) => {
    if (!categoryId || !categoryName) {
        const error = new Error('categoryId and categoryName are required');
        error.statusCode = 400;
        throw error;
    }

    const existingCategory = await ProductCategory.findOne({categoryId});

    if (existingCategory) {
        const error = new Error('ProductCategory with this categoryId already exists');
        error.statusCode = 409;
        throw error;
    }

    return await ProductCategory.create({
        categoryId,
        categoryName,
    });
};

const getCategories = async () => {
    return ProductCategory.find().sort({createdAt: -1});
};

const getCategoriesPaginated = async ({limit, skip, search}) => {
    const filter = {};

    if (search) {
        filter.$or = [
            {categoryId: {$regex: search, $options: 'i'}},
            {categoryName: {$regex: search, $options: 'i'}},
        ];
    }

    const [categories, totalItems] = await Promise.all([
        ProductCategory.find(filter)
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit),
        ProductCategory.countDocuments(filter),
    ]);

    return {
        categories,
        totalItems,
    };
};

const getCategoryById = async (categoryId) => {
    const category = await ProductCategory.findOne({categoryId});

    if (!category) {
        const error = new Error('ProductCategory not found');
        error.statusCode = 404;
        throw error;
    }

    return category;
};

const updateCategory = async (categoryId, {categoryName}) => {
    if (!categoryName) {
        const error = new Error('categoryName is required');
        error.statusCode = 400;
        throw error;
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
        const error = new Error('ProductCategory not found');
        error.statusCode = 404;
        throw error;
    }

    return updatedCategory;
};

const deleteCategory = async (categoryId) => {
    const deletedCategory = await ProductCategory.findOneAndDelete({categoryId});

    if (!deletedCategory) {
        const error = new Error('ProductCategory not found');
        error.statusCode = 404;
        throw error;
    }

    return deletedCategory;
};

const findCategoryDocumentByCategoryId = async (categoryId) => {
    const category = await ProductCategory.findOne({categoryId});

    if (!category) {
        const error = new Error('Product category not found');
        error.statusCode = 404;
        throw error;
    }

    return category;
};

module.exports = {
    createCategory,
    getCategories,
    getCategoriesPaginated,
    getCategoryById,
    updateCategory,
    deleteCategory,
    findCategoryDocumentByCategoryId,
};