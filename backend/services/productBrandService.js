const ProductBrand = require('../models/ProductBrand');
require("../models/ProductCategory");
const createBrand = async ({brandId, brandName}) => {
    if (!brandId || !brandName) {
        const error = new Error('brandId and brandName are required');
        error.statusCode = 400;
        throw error;
    }

    const existingBrand = await ProductBrand.findOne({brandId});

    if (existingBrand) {
        const error = new Error('ProductBrand with this brandId already exists');
        error.statusCode = 409;
        throw error;
    }

    return await ProductBrand.create({
        brandId,
        brandName,
    });
};

const getBrands = async () => {
    return ProductBrand.find().sort({createdAt: -1});
};

const getBrandsPaginated = async ({limit, skip, search}) => {
    const filter = {};

    if (search) {
        filter.$or = [
            {brandId: {$regex: search, $options: 'i'}},
            {brandName: {$regex: search, $options: 'i'}},
        ];
    }

    const [brands, totalItems] = await Promise.all([
        ProductBrand.find(filter)
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit),
        ProductBrand.countDocuments(filter),
    ]);

    return {
        brands,
        totalItems,
    };
};

const getBrandById = async (brandId) => {
    const brand = await ProductBrand.findOne({brandId});

    if (!brand) {
        const error = new Error('ProductBrand not found');
        error.statusCode = 404;
        throw error;
    }

    return brand;
};

const updateBrand = async (brandId, {brandName}) => {
    if (!brandName) {
        const error = new Error('brandName is required');
        error.statusCode = 400;
        throw error;
    }

    const updatedBrand = await ProductBrand.findOneAndUpdate(
        {brandId},
        {brandName},
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedBrand) {
        const error = new Error('ProductBrand not found');
        error.statusCode = 404;
        throw error;
    }

    return updatedBrand;
};

const deleteBrand = async (brandId) => {
    const deletedBrand = await ProductBrand.findOneAndDelete({brandId});

    if (!deletedBrand) {
        const error = new Error('ProductBrand not found');
        error.statusCode = 404;
        throw error;
    }

    return deletedBrand;
};

const findBrandDocumentByBrandId = async (brandId) => {
    const brand = await ProductBrand.findOne({brandId});

    if (!brand) {
        const error = new Error('Product Brand not found');
        error.statusCode = 404;
        throw error;
    }

    return brand;
};

module.exports = {
    createBrand,
    getBrands,
    getBrandsPaginated,
    getBrandById,
    updateBrand,
    deleteBrand,
    findBrandDocumentByBrandId,
};