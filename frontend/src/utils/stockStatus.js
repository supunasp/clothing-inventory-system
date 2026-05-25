const FALLBACK_LOW_STOCK_THRESHOLD = 5;

const parsePositiveInt = (raw, fallback) => {
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const LOW_STOCK_THRESHOLD = parsePositiveInt(
    process.env.REACT_APP_LOW_STOCK_THRESHOLD,
    FALLBACK_LOW_STOCK_THRESHOLD
);

export const STOCK_STATUS = {
    OUT_OF_STOCK: {
        label: 'Out of Stock',
        className: 'bg-red-50 text-red-700',
    },
    LOW_STOCK: {
        label: 'Low Stock',
        className: 'bg-amber-50 text-amber-700',
    },
    IN_STOCK: {
        label: 'In Stock',
        className: 'bg-emerald-50 text-emerald-700',
    },
};

export const getStockStatus = (stockAmount) => {
    const stock = Number(stockAmount) || 0;
    if (stock <= 0) return STOCK_STATUS.OUT_OF_STOCK;
    if (stock <= LOW_STOCK_THRESHOLD) return STOCK_STATUS.LOW_STOCK;
    return STOCK_STATUS.IN_STOCK;
};
