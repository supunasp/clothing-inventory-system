const getPaginationParams = (query) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
    };
};

const buildPaginationResponse = ({ data, page, limit, totalItems }) => {
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
        data,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
        },
    };
};

module.exports = {
    getPaginationParams,
    buildPaginationResponse,
};