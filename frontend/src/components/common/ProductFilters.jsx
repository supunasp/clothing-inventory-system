import { Search } from "lucide-react";

const ProductFilters = ({
    categories,
    brands,
    selectedCategory,
    selectedBrand,
    onCategoryChange,
    onBrandChange,
    searchInput,
    onSearchChange,
}) => (
    <>
        <label className="flex items-center gap-3 text-xs text-gray-600">
            Category
            <select
                value={selectedCategory}
                onChange={onCategoryChange}
                className="h-9 w-40 rounded-md border border-gray-300 bg-white px-3 text-xs outline-none focus:border-blue-500"
            >
                <option value="">All</option>
                {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                    </option>
                ))}
            </select>
        </label>

        <label className="flex items-center gap-3 text-xs text-gray-600">
            Brand
            <select
                value={selectedBrand}
                onChange={onBrandChange}
                className="h-9 w-40 rounded-md border border-gray-300 bg-white px-3 text-xs outline-none focus:border-blue-500"
            >
                <option value="">All</option>
                {brands.map((brand) => (
                    <option key={brand.brandId} value={brand.brandId}>
                        {brand.brandName}
                    </option>
                ))}
            </select>
        </label>

        {onSearchChange && (
            <div className="relative">
                <Search
                    size={14}
                    strokeWidth={1.8}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                />
                <input
                    type="search"
                    value={searchInput || ""}
                    onChange={onSearchChange}
                    placeholder="Search"
                    className="h-9 w-56 rounded-md border border-gray-300 bg-white pl-8 pr-3 text-xs outline-none focus:border-blue-500"
                />
            </div>
        )}
    </>
);

export default ProductFilters;
