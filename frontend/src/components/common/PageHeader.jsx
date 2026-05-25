const PageHeader = ({ title, onBack, className = "mb-5" }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <button
            type="button"
            onClick={onBack}
            className="text-xl text-gray-700 hover:text-gray-900"
            aria-label="Back"
        >
            ←
        </button>

        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
    </div>
);

export default PageHeader;
