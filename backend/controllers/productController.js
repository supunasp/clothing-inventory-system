const productService = require('../services/productService');
const {convertToCategoryResponse} = require('./productCategoryController');
const {convertToBrandResponse} = require('./productBrandController');

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

const getProducts = async (req, res) => {
    try {
        const products = await productService.getProducts();

        return res.status(200).json(products.map(convertToProductResponse));
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

const convertToProductResponse = (product) => ({
    productId: product.productId,
    name: product.name,
    description: product.description,
    category: product.category ? convertToCategoryResponse(product.category) : null,
    brand: product.brand ? convertToBrandResponse(product.brand) : null,
});

const handleControllerError = (res, error, fallbackMessage) => {
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
    convertToProductResponse,
};