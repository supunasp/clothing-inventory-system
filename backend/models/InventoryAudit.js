const mongoose = require('mongoose');

const inventoryAuditSchema = new mongoose.Schema(
    {
        productVariant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductVariant',
            required: [true, 'Product variant is required'],
        },
        sku: {
            type: String,
            required: [true, 'SKU is required'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['increase', 'decrease'],
            required: [true, 'Audit type is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [1, 'Amount must be at least 1'],
        },
        quantityBefore: {
            type: Number,
            required: [true, 'quantityBefore is required'],
            min: [0, 'quantityBefore must be at least 0'],
        },
        quantityAfter: {
            type: Number,
            required: [true, 'quantityAfter is required'],
            min: [0, 'quantityAfter must be at least 0'],
        },
        reference: {
            type: String,
            required: [true, 'Reference is required'],
            trim: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('InventoryAudit', inventoryAuditSchema);
