import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import axiosInstance from "../../axiosConfig";

const StatCard = ({icon, title, value}) => {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg">
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500">{title}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

const Pagination = ({pagination, onPageChange}) => {
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

const AdminDashboard = () => {
    const {user} = useAuth();
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalBrands: 0,
        totalUsers: 0,
    });

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [productPagination, setProductPagination] = useState(null);
    const [categoryPagination, setCategoryPagination] = useState(null);
    const [brandPagination, setBrandPagination] = useState(null);

    const [productPage, setProductPage] = useState(1);
    const [categoryPage, setCategoryPage] = useState(1);
    const [brandPage, setBrandPage] = useState(1);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin User";

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const response = await axiosInstance.get("/api/admin/analytics");
                setAnalytics(response.data);
            } catch (error) {
                setErrorMessage("Unable to load dashboard analytics.");
            }
        };

        loadAnalytics();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const response = await axiosInstance.get("/api/products", {
                    params: {
                        page: productPage,
                        limit: 10,
                        category: selectedCategory || undefined,
                        brand: selectedBrand || undefined,
                    },
                });

                setProducts(response.data.data || []);
                setProductPagination(response.data.pagination || null);
            } catch (error) {
                setErrorMessage("Unable to load products.");
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, [productPage, selectedCategory, selectedBrand]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await axiosInstance.get("/api/categories", {
                    params: {
                        page: categoryPage,
                        limit: 5,
                    },
                });

                setCategories(response.data.data || []);
                setCategoryPagination(response.data.pagination || null);
            } catch (error) {
                setErrorMessage("Unable to load categories.");
            }
        };

        loadCategories();
    }, [categoryPage]);

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const response = await axiosInstance.get("/api/brands", {
                    params: {
                        page: brandPage,
                        limit: 5,
                    },
                });

                setBrands(response.data.data || []);
                setBrandPagination(response.data.pagination || null);
            } catch (error) {
                console.error("Error loading brands:", error);
                setErrorMessage("Unable to load brands.");
            }
        };

        loadBrands();
    }, [brandPage]);

    const handleCategoryFilterChange = (event) => {
        setSelectedCategory(event.target.value);
        setProductPage(1);
    };

    const handleBrandFilterChange = (event) => {
        setSelectedBrand(event.target.value);
        setProductPage(1);
    };

    return (
        <>
            <p className="mb-4 text-xl text-[#333333]">
                Welcome back, <span className="font-semibold">{fullName}.</span>
            </p>

            {errorMessage && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    {errorMessage}
                </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <StatCard icon="▦" title="Total Products" value={analytics.totalProducts}/>
                <StatCard icon="⊕" title="Total Categories" value={analytics.totalCategories}/>
                <StatCard icon="Label" title="Total Brands" value={analytics.totalBrands}/>
                <StatCard icon="♙" title="Total Users" value={analytics.totalUsers}/>
            </div>

            <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-wrap gap-8 px-5 py-4">
                    <label className="flex items-center gap-3 text-xs text-gray-600">
                        Category
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryFilterChange}
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
                            onChange={handleBrandFilterChange}
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
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-y border-gray-100 text-gray-500">
                        <tr>
                            <th className="px-5 py-3 font-medium">Product Name</th>
                            <th className="px-5 py-3 font-medium">Description</th>
                            <th className="px-5 py-3 font-medium">Category</th>
                            <th className="px-5 py-3 font-medium">Brand</th>
                            <th className="px-5 py-3 font-medium">Inventory</th>
                            <th className="px-5 py-3 font-medium"></th>
                        </tr>
                        </thead>

                        <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="px-5 py-8 text-center text-gray-500">
                                    Loading products...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-5 py-8 text-center text-gray-500">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.productId} className="border-b border-gray-100">
                                    <td className="px-5 py-4 font-medium text-gray-900">
                                        {product.name}
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">
                                        {product.description || "-"}
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">
                                        {product.category?.categoryName || "-"}
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">
                                        {product.brand?.brandName || "-"}
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">
                                        {product.inventory ?? 0}
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => navigate("/inventory/add", {state: {product}})}
                                            className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <Pagination pagination={productPagination} onPageChange={setProductPage}/>
            </section>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4">
                        <h2 className="text-sm font-medium text-gray-900">Category</h2>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/categories")}
                            className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                            + Add Category
                        </button>
                    </div>

                    <table className="w-full text-left text-xs">
                        <thead className="border-y border-gray-100 text-gray-500">
                        <tr>
                            <th className="px-5 py-3 font-medium">ID</th>
                            <th className="px-5 py-3 font-medium">Name</th>
                            <th className="px-5 py-3 font-medium"></th>
                        </tr>
                        </thead>

                        <tbody>
                        {categories.map((category) => (
                            <tr key={category.categoryId} className="border-b border-gray-100">
                                <td className="px-5 py-4 font-medium text-gray-900">
                                    {category.categoryId}
                                </td>
                                <td className="px-5 py-4 text-gray-600">
                                    {category.categoryName}
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <button className="rounded-full px-3 py-1 text-gray-500 hover:bg-gray-100">
                                        ⋯
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <Pagination pagination={categoryPagination} onPageChange={setCategoryPage}/>
                </section>

                <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4">
                        <h2 className="text-sm font-medium text-gray-900">Brand</h2>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/brands")}
                            className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                            + Add Brand
                        </button>
                    </div>

                    <table className="w-full text-left text-xs">
                        <thead className="border-y border-gray-100 text-gray-500">
                        <tr>
                            <th className="px-5 py-3 font-medium">ID</th>
                            <th className="px-5 py-3 font-medium">Name</th>
                            <th className="px-5 py-3 font-medium"></th>
                        </tr>
                        </thead>

                        <tbody>
                        {brands.map((brand) => (
                            <tr key={brand.brandId} className="border-b border-gray-100">
                                <td className="px-5 py-4 font-medium text-gray-900">
                                    {brand.brandId}
                                </td>
                                <td className="px-5 py-4 text-gray-600">
                                    {brand.brandName}
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <button className="rounded-full px-3 py-1 text-gray-500 hover:bg-gray-100">
                                        ⋯
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <Pagination pagination={brandPagination} onPageChange={setBrandPage}/>
                </section>
            </div>
        </>
    );
};

export default AdminDashboard;