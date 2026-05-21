const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: [true, 'Product ID is required'],
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [false, 'Product description is not required'],
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductCategory',
            required: [true, 'Product category is required'],
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductBrand',
            required: [true, 'Product brand is required'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Product', productSchema);