const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const ProductBrand = require('../models/ProductBrand');
const ProductVariant = require('../models/ProductVariant');
const User = require('../models/User');
const logger = require("../utils/logger");

const getAdminAnalytics = async (req, res) => {
    try {
        const [
            totalProducts,
            totalCategories,
            totalBrands,
            totalUsers,
            stockSummary,
            outOfStockProducts,
            lowStockVariants,
        ] = await Promise.all([
            Product.countDocuments(),
            ProductCategory.countDocuments(),
            ProductBrand.countDocuments(),
            User.countDocuments(),
            ProductVariant.aggregate([
                {
                    $group: {
                        _id: null,
                        totalStock: { $sum: '$stockAmount' },
                    },
                },
            ]),
            ProductVariant.countDocuments({ stockAmount: 0 }),
            ProductVariant.countDocuments({
                stockAmount: {
                    $gt: 0,
                    $lte: 5,
                },
            }),
        ]);

        return res.status(200).json({
            totalProducts,
            totalCategories,
            totalBrands,
            totalUsers,
            totalStock: stockSummary[0]?.totalStock || 0,
            outOfStockProducts,
            lowStockVariants,
        });
    } catch (error) {
        logger.error('Error loading admin analytics:', error);
        return res.status(500).json({
            message: 'Error loading admin analytics',
            error: error.message,
        });
    }
};

module.exports = {
    getAdminAnalytics,
};