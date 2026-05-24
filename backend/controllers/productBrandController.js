const productBrandService = require('../services/productBrandService');
const {buildPaginationResponse, getPaginationParams} = require("../utils/pagination");
const logger = require("../utils/logger");

const createBrand = async (req, res) => {
    try {
        const brand = await productBrandService.createBrand(req.body);

        return res.status(201).json({
            message: 'ProductBrand created successfully',
            brand: convertToBrandResponse(brand),
        });
    } catch (error) {

        return handleControllerError(res, error, 'Error creating brand');
    }
};

const getBrands = async (req, res) => {
    try {
        if (req.query.page || req.query.limit || req.query.search) {
            const {page, limit, skip} = getPaginationParams(req.query);

            const {brands, totalItems} =
                await productBrandService.getBrandsPaginated({
                    limit,
                    skip,
                    search: req.query.search,
                });

            return res.status(200).json(
                buildPaginationResponse({
                    data: brands.map(convertToBrandResponse),
                    page,
                    limit,
                    totalItems,
                })
            );
        }

        const brands = await productBrandService.getBrands();

        return res.status(200).json(brands.map(convertToBrandResponse));
    } catch (error) {
        return handleControllerError(res, error, 'Error fetching brands');
    }
};

const getBrandById = async (req, res) => {
    try {
        const brand = await productBrandService.getBrandById(req.params.brandId);

        return res.status(200).json(convertToBrandResponse(brand));
    } catch (error) {
        return handleControllerError(res, error, 'Error fetching brand');
    }
};

const updateBrand = async (req, res) => {
    try {
        const brand = await productBrandService.updateBrand(
            req.params.brandId,
            req.body
        );

        return res.status(200).json({
            message: 'ProductBrand updated successfully',
            brand: convertToBrandResponse(brand),
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error updating brand');
    }
};

const deleteBrand = async (req, res) => {
    try {
        const brand = await productBrandService.deleteBrand(req.params.brandId);

        return res.status(200).json({
            message: 'ProductBrand deleted successfully',
            brand: convertToBrandResponse(brand),
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error deleting brand');
    }
};

const convertToBrandResponse = (brand) => ({
    brandId: brand.brandId,
    brandName: brand.brandName,
});

const handleControllerError = (res, error, fallbackMessage) => {
    logger.error(fallbackMessage, error);
    return res.status(error.statusCode || 500).json({
        message: error.statusCode ? error.message : fallbackMessage,
        error: error.message,
    });
};

module.exports = {
    createBrand,
    getBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    convertToBrandResponse,
};