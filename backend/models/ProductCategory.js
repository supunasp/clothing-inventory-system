const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema(
    {
        categoryId: {
            type: String,
            required: [true, 'Category ID is required'],
            unique: true,
            trim: true,
        },
        categoryName: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ProductCategory', productCategorySchema);