const InventoryAudit = require('../models/InventoryAudit');
require('../models/ProductVariant');
require('../models/Product');
require('../models/User');

const createAudit = async ({
    productVariant,
    sku,
    type,
    amount,
    quantityBefore,
    quantityAfter,
    reference,
    updatedBy,
}) => {
    return InventoryAudit.create({
        productVariant,
        sku,
        type,
        amount,
        quantityBefore,
        quantityAfter,
        reference,
        updatedBy,
    });
};

const getAuditsPaginated = async ({limit, skip, variantIds, search}) => {
    const filter = {};

    if (variantIds !== undefined) {
        filter.productVariant = {$in: variantIds};
    }

    if (search && search.trim()) {
        const trimmed = search.trim();
        filter.$or = [
            {sku: {$regex: trimmed, $options: 'i'}},
            {reference: {$regex: trimmed, $options: 'i'}},
        ];
    }

    const [audits, totalItems] = await Promise.all([
        InventoryAudit.find(filter)
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .populate({path: 'productVariant', populate: {path: 'product'}})
            .populate('updatedBy', 'firstName lastName email'),
        InventoryAudit.countDocuments(filter),
    ]);

    return {audits, totalItems};
};

module.exports = {
    createAudit,
    getAuditsPaginated,
};
