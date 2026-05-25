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
        reference: {
            type: String,
            required: [true, 'Reference is required'],
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('InventoryAudit', inventoryAuditSchema);
