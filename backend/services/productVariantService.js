const ProductVariant = require('../models/ProductVariant');
const inventoryAuditService = require('./inventoryAuditService');
const productService = require('./productService');

const createProductVariant = async ({productId, color, size, stockAmount, reference, userId}) => {
    if (!productId || !color || !size || !stockAmount) {
        const error = new Error('productId, color, size and stockAmount are required');
        error.statusCode = 400;
        throw error;
    }

    if (!reference || !reference.trim()) {
        const error = new Error('reference is required');
        error.statusCode = 400;
        throw error;
    }

    const existingProduct = await productService.findProductDocumentByProductId(productId);

    if (!existingProduct) {
        const error = new Error('productId does not exist');
        error.statusCode = 400;
        throw error;

    }

    const existingProductVariant = await ProductVariant.findOne({
        product: existingProduct._id,
        color: color,
        size: size
    });
    if (existingProductVariant) {
        const error = new Error('Product Variant with this productId,color and size already exists');
        error.statusCode = 409;
        throw error;

    }

    const productVariant = await ProductVariant.create({
        sku: getSkuValue(productId, color, size),
        product: existingProduct._id,
        color: color,
        size: size,
        stockAmount: stockAmount,
    });

    await inventoryAuditService.createAudit({
        productVariant: productVariant._id,
        sku: productVariant.sku,
        type: 'increase',
        amount: stockAmount,
        quantityBefore: 0,
        quantityAfter: stockAmount,
        reference: reference.trim(),
        updatedBy: userId,
    });

    return ProductVariant.findById(productVariant._id).populate('product');
};

const getProductVariants = async ({productId} = {}) => {
    const filter = {};

    if (productId) {
        const existingProduct = await productService.findProductDocumentByProductId(productId);
        filter.product = existingProduct._id;
    }

    return ProductVariant.find(filter)
        .populate('product')
        .sort({createdAt: -1});
};

const getProductVariantsById = async (sku) => {


    const product = await ProductVariant.findOne({sku}).populate('product');

    if (!product) {
        const error = new Error('Product Variant not found');
        error.statusCode = 404;
        throw error;
    }

    return product;
};

const getProductVariantsByProductId = async (productId) => {

    const existingProduct = await productService.findProductDocumentByProductId(productId);

    if (!existingProduct) {
        const error = new Error('productId does not exist');
        error.statusCode = 400;
        throw error;

    }

    const products = await ProductVariant.find({product: existingProduct._id}).populate('product');

    if (!products) {
        const error = new Error('Product Variants not found');
        error.statusCode = 404;
        throw error;
    }

    return products;
};

const updateProductVariantStocks = async (sku, {stockAmount}) => {
    const updateData = {};

    if (stockAmount !== undefined) {
        updateData.stockAmount = stockAmount;
    }

    const updatedProductVariant = await ProductVariant.findOneAndUpdate(
        {sku},
        updateData,
        {
            new: true,
            runValidators: true,
        })
        .populate('product');

    if (!updatedProductVariant) {
        const error = new Error('Product Variant not found');
        error.statusCode = 404;
        throw error;
    }

    return updatedProductVariant;
};

const adjustInventory = async (sku, {type, amount, reference, userId}) => {
    if (!type || !['increase', 'decrease'].includes(type)) {
        const error = new Error('type must be "increase" or "decrease"');
        error.statusCode = 400;
        throw error;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        const error = new Error('amount must be a positive number');
        error.statusCode = 400;
        throw error;
    }

    if (!reference || !reference.trim()) {
        const error = new Error('reference is required');
        error.statusCode = 400;
        throw error;
    }

    const variant = await ProductVariant.findOne({sku});

    if (!variant) {
        const error = new Error('Product Variant not found');
        error.statusCode = 404;
        throw error;
    }

    if (type === 'decrease' && variant.stockAmount < numericAmount) {
        const error = new Error('Insufficient stock to decrease');
        error.statusCode = 400;
        throw error;
    }

    const delta = type === 'increase' ? numericAmount : -numericAmount;
    const quantityBefore = variant.stockAmount;

    const updatedVariant = await ProductVariant.findOneAndUpdate(
        {sku},
        {$inc: {stockAmount: delta}},
        {new: true, runValidators: true}
    ).populate('product');

    await inventoryAuditService.createAudit({
        productVariant: updatedVariant._id,
        sku: updatedVariant.sku,
        type,
        amount: numericAmount,
        quantityBefore,
        quantityAfter: updatedVariant.stockAmount,
        reference: reference.trim(),
        updatedBy: userId,
    });

    return updatedVariant;
};

const deleteProductVariant = async (sku) => {
    const deletedProductVariant = await ProductVariant
        .findOneAndDelete({sku})
        .populate('product');

    if (!deletedProductVariant) {
        const error = new Error('Product Variant not found');
        error.statusCode = 404;
        throw error;
    }

    return deletedProductVariant;
};

const findVariantIdsByProductId = async (productId) => {
    const product = await productService.findProductDocumentByProductId(productId);
    const variants = await ProductVariant.find({product: product._id}).select('_id');
    return variants.map((variant) => variant._id);
};

const aggregateInventoryByProductIds = async (productObjectIds) => {
    const summary = await ProductVariant.aggregate([
        {$match: {product: {$in: productObjectIds}}},
        {$group: {_id: '$product', inventory: {$sum: '$stockAmount'}}},
    ]);

    return summary.reduce((map, item) => {
        map[item._id.toString()] = item.inventory;
        return map;
    }, {});
};

function getSkuValue(productId, color, size) {
    return productId + "#" + color.trim() + "#" + size.trim();
}

Object.assign(module.exports, {
    createProductVariant,
    getProductVariants,
    getProductVariantsById,
    getProductVariantsByProductId,
    updateProductVariantStocks,
    adjustInventory,
    deleteProductVariant,
    aggregateInventoryByProductIds,
    findVariantIdsByProductId,
});
