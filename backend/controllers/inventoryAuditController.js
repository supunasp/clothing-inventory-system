const inventoryAuditService = require('../services/inventoryAuditService');
const productVariantService = require('../services/productVariantService');
const {getPaginationParams, buildPaginationResponse} = require('../utils/pagination');
const logger = require('../utils/logger');

const getAudits = async (req, res) => {
    try {
        const {page, limit, skip} = getPaginationParams(req.query);

        let variantIds;
        if (req.query.productId) {
            variantIds = await productVariantService.findVariantIdsByProductId(
                req.query.productId
            );
        }

        const {audits, totalItems} = await inventoryAuditService.getAuditsPaginated({
            limit,
            skip,
            variantIds,
        });

        return res.status(200).json(
            buildPaginationResponse({
                data: audits.map(convertToAuditResponse),
                page,
                limit,
                totalItems,
            })
        );
    } catch (error) {
        return handleControllerError(res, error, 'Error fetching inventory audits');
    }
};

const convertToAuditResponse = (audit) => {
    const variant = audit.productVariant;
    const product = variant && variant.product ? variant.product : null;
    const user = audit.updatedBy;

    return {
        auditId: audit._id,
        sku: audit.sku,
        color: variant ? variant.color : null,
        size: variant ? variant.size : null,
        product: product
            ? {productId: product.productId, name: product.name}
            : null,
        type: audit.type,
        amount: audit.amount,
        quantityBefore: audit.quantityBefore,
        quantityAfter: audit.quantityAfter,
        reference: audit.reference,
        updatedBy: user
            ? {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            }
            : null,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt,
    };
};

const handleControllerError = (res, error, fallbackMessage) => {
    logger.error(fallbackMessage, error);
    return res.status(error.statusCode || 500).json({
        message: error.statusCode ? error.message : fallbackMessage,
        error: error.message,
    });
};

module.exports = {
    getAudits,
};
