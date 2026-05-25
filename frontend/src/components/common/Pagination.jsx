const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination) return null;

    return (
        <div className="flex items-center justify-center gap-5 px-5 py-4 text-xs text-gray-600">
            <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => onPageChange(pagination.page - 1)}
                className="rounded-md border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                ← Previous
            </button>
            <span>
                Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => onPageChange(pagination.page + 1)}
                className="rounded-md border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Next →
            </button>
        </div>
    );
};

export default Pagination;
