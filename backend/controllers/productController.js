const productService = require('../services/productService');
const {convertToCategoryResponse} = require('./productCategoryController');
const {convertToBrandResponse} = require('./productBrandController');
const {getPaginationParams, buildPaginationResponse} = require("../utils/pagination");
const logger = require("../utils/logger");

const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);

        return res.status(201).json({
            message: 'Product created successfully',
            product: convertToProductResponse(product),
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error creating product');
    }
};

const parseActiveQuery = (raw) => {
    if (raw === undefined || raw === '') return undefined;
    if (raw === 'true' || raw === true) return true;
    if (raw === 'false' || raw === false) return false;
    return undefined;
};

const getProducts = async (req, res) => {
    try {
        const activeFilter = parseActiveQuery(req.query.active);

        if (
            req.query.page ||
            req.query.limit ||
            req.query.search ||
            req.query.category ||
            req.query.brand ||
            activeFilter !== undefined
        ) {
            const {page, limit, skip} = getPaginationParams(req.query);

            const result = await productService.getProductsPaginated({
                limit,
                skip,
                category: req.query.category,
                brand: req.query.brand,
                search: req.query.search,
                active: activeFilter,
            });

            return res.status(200).json(
                buildPaginationResponse({
                    data: result.data.map(({product, inventory}) =>
                        convertToProductResponse(product, inventory)
                    ),
                    page,
                    limit,
                    totalItems: result.totalItems,
                })
            );
        } else {

            const products = await productService.getProducts();

            return res.status(200)
                .json(
                    products.map((product) => convertToProductResponse(product)));
        }
    } catch (error) {
        return handleControllerError(res, error, 'Error fetching products');
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.productId);

        return res.status(200).json(convertToProductResponse(product));
    } catch (error) {
        return handleControllerError(res, error, 'Error fetching product');
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(
            req.params.productId,
            req.body
        );

        return res.status(200).json({
            message: 'Product updated successfully',
            product: convertToProductResponse(product),
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error updating product');
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await productService.deleteProduct(req.params.productId);

        return res.status(200).json({
            message: 'Product deleted successfully',
            product: convertToProductResponse(product),
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error deleting product');
    }
};

const updateProductStatus = async (req, res) => {
    try {
        const product = await productService.setProductActive(
            req.params.productId,
            req.body.active
        );

        return res.status(200).json({
            message: product.active
                ? 'Product activated successfully'
                : 'Product deactivated successfully',
            product: convertToProductResponse(product),
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error updating product status');
    }
};

const convertToProductResponse = (product, inventory = undefined) => ({
    productId: product.productId,
    name: product.name,
    description: product.description,
    category: product.category ? convertToCategoryResponse(product.category) : null,
    brand: product.brand ? convertToBrandResponse(product.brand) : null,
    active: product.active,
    ...(inventory !== undefined ? {inventory} : {}),
});

const handleControllerError = (res, error, fallbackMessage) => {
    logger.error(fallbackMessage, error);
    return res.status(error.statusCode || 500).json({
        message: error.statusCode ? error.message : fallbackMessage,
        error: error.message,
    });
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    convertToProductResponse,
};