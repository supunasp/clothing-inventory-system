const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const ProductBrand = require('../models/ProductBrand');
const ProductVariant = require('../models/ProductVariant');
const User = require('../models/User');
const {getPaginationParams, buildPaginationResponse} = require('../utils/pagination');
const {ROLE_ADMIN, ROLE_STAFF} = require('../constants');

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
                        totalStock: {$sum: '$stockAmount'},
                    },
                },
            ]),
            ProductVariant.countDocuments({stockAmount: 0}),
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

const getUsers = async (req, res) => {
    try {
        const {page, limit, skip} = getPaginationParams(req.query);
        const {search, role, active} = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                {firstName: {$regex: search, $options: 'i'}},
                {lastName: {$regex: search, $options: 'i'}},
                {email: {$regex: search, $options: 'i'}},
            ];
        }

        if (role) {
            filter.role = role;
        }

        if (active !== undefined && active !== '') {
            filter.active = active === 'true';
        }

        const [users, totalItems] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({firstName: 1, lastName: 1})
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        return res.status(200).json(
            buildPaginationResponse({
                data: users.map(convertToAdminUserResponse),
                page,
                limit,
                totalItems,
            })
        );
    } catch (error) {
        logger.error('Error fetching users', error);
        return res.status(500).json({
            message: 'Error fetching users',
            error: error.message,
        });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const {active} = req.body;

        if (typeof active !== 'boolean') {
            return res.status(400).json({
                message: 'active must be a boolean value',
            });
        }

        if (req.user?.id === req.params.id && active === false) {
            return res.status(400).json({
                message: 'You cannot deactivate your own account',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {active},
            {
                new: true,
                runValidators: true,
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        return res.status(200).json({
            message: active ? 'User activated successfully' : 'User deactivated successfully',
            user: convertToAdminUserResponse(user),
        });
    } catch (error) {
        logger.error('Error updating user status', error);
        return res.status(500).json({
            message: 'Error updating user status',
            error: error.message,
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const {role} = req.body;

        if (![ROLE_ADMIN, ROLE_STAFF].includes(role)) {
            return res.status(400).json({
                message: 'Invalid user role',
            });
        }

        if (req.user?.id === req.params.id && role !== ROLE_ADMIN) {
            return res.status(400).json({
                message: 'You cannot remove your own admin role',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {role},
            {
                new: true,
                runValidators: true,
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        return res.status(200).json({
            message: 'User role updated successfully',
            user: convertToAdminUserResponse(user),
        });
    } catch (error) {
        logger.error('Error updating user role', error);
        return res.status(500).json({
            message: 'Error updating user role',
            error: error.message,
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (req.user?.id === req.params.id) {
            return res.status(400).json({
                message: 'You cannot delete your own account',
            });
        }

        const user = await User.findByIdAndDelete(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        return res.status(200).json({
            message: 'User deleted successfully',
            user: convertToAdminUserResponse(user),
        });
    } catch (error) {
        logger.error('Error deleting user', error);
        return res.status(500).json({
            message: 'Error deleting user',
            error: error.message,
        });
    }
};

const convertToAdminUserResponse = (user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    active: user.active,
    role: user.role,
});

module.exports = {
    getAdminAnalytics,
    getUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
};