const productVariantService = require('../services/productVariantService');
const logger = require("../utils/logger");

const createProductVariant = async (req, res) => {
    try {
        const productVariant = await productVariantService.createProductVariant({
            ...req.body,
            userId: req.user ? req.user._id : undefined,
        });

        return res.status(201).json({
            message: 'Product Variant created successfully',
            product: convertToProductVariantResponse(productVariant),
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error creating product variant');
    }
};

const getProductVariants = async (req, res) => {
    try {
        const productVariants = await productVariantService.getProductVariants({
            productId: req.query.productId,
        });

        return res.status(200).json(productVariants.map(convertToProductVariantResponse));
    } catch (error) {
        return handleControllerError(res, error, 'Error fetching product variants');
    }
};

const getProductVariantById = async (req, res) => {
    try {
        const productVariant = await productVariantService.getProductVariantsById(req.params.sku);

        return res.status(200).json(convertToProductVariantResponse(productVariant));
    } catch (error) {
        return handleControllerError(res, error, 'Error fetching product variant');
    }
};

const updateProductVariant = async (req, res) => {
    try {
        const productVariant = await productVariantService.updateProductVariantStocks(
            req.params.sku,
            req.body
        );

        return res.status(200).json({
            message: 'Product Variant Stocks updated successfully',
            product: convertToProductVariantResponse(productVariant),
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error updating product variant stocks');
    }
};

const adjustInventory = async (req, res) => {
    try {
        const productVariant = await productVariantService.adjustInventory(req.params.sku, {
            type: req.body.type,
            amount: req.body.amount,
            reference: req.body.reference,
            userId: req.user ? req.user._id : undefined,
        });

        return res.status(200).json({
            message: 'Inventory adjusted successfully',
            variant: convertToProductVariantResponse(productVariant),
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error adjusting inventory');
    }
};

const deleteProductVariant = async (req, res) => {
    try {
        const productVariant = await productVariantService.deleteProductVariant(req.params.sku);

        return res.status(200).json({
            message: 'Product Variant deleted successfully',
            product: convertToProductVariantResponse(productVariant),
        });
    } catch (error) {
        return handleControllerError(res, error, 'Error deleting product variant');
    }
};

const convertToProductVariantResponse = (productVariant) => ({
    sku: productVariant.sku,
    productId: productVariant.product ? productVariant.product.productId : null,
    color: productVariant.color,
    size: productVariant.size,
    stockAmount: productVariant.stockAmount
});

const handleControllerError = (res, error, fallbackMessage) => {
    logger.error(fallbackMessage, error);
    return res.status(error.statusCode || 500).json({
        message: error.statusCode ? error.message : fallbackMessage,
        error: error.message,
    });
};

module.exports = {
    createProductVariant,
    getProductVariants,
    getProductVariantById,
    updateProductVariant,
    adjustInventory,
    deleteProductVariant,
    convertToProductVariantResponse,
};