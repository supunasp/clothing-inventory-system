import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Award, LayoutGrid, PieChart, Star, Tag, Users} from "lucide-react";
import {useAuth} from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import EntityManagementList from "../components/common/EntityManagementList";
import Pagination from "../components/common/Pagination";
import ProductFilters from "../components/common/ProductFilters";
import useReferenceData from "../hooks/useReferenceData";
import { PAGE_SIZE } from "../constants";

const formatDate = (iso) => {
    if (!iso) return "-";
    try {
        return new Date(iso).toLocaleString();
    } catch (error) {
        return iso;
    }
};

const formatUser = (user) => {
    if (!user) return "-";
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return name || user.email || "-";
};

const StatCard = ({icon, iconBg = "bg-emerald-50", title, value}) => {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} text-lg`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500">{title}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            </div>
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
        totalStock: 0,
        lowStockThreshold: 5,
    });

    const [products, setProducts] = useState([]);
    const [productPagination, setProductPagination] = useState(null);
    const [productPage, setProductPage] = useState(1);
    const [statusTogglingId, setStatusTogglingId] = useState(null);

    const [lowStock, setLowStock] = useState([]);
    const [recentAudits, setRecentAudits] = useState([]);

    const {categories: filterCategories, brands: filterBrands, reload: reloadReferenceData} = useReferenceData();

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin User";

    const loadAnalytics = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/api/admin/analytics");
            setAnalytics(response.data);
        } catch (error) {
            setErrorMessage("Unable to load dashboard analytics.");
        }
    }, []);

    const loadLowStock = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/api/admin/low-stock");
            setLowStock(response.data.data || []);
        } catch (error) {
            // Non-critical — leave empty
        }
    }, []);

    const loadRecentAudits = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/api/inventory-audits", {
                params: { page: 1, limit: 5 },
            });
            setRecentAudits(response.data.data || []);
        } catch (error) {
            // Non-critical
        }
    }, []);

    useEffect(() => {
        loadAnalytics();
        loadLowStock();
        loadRecentAudits();
    }, [loadAnalytics, loadLowStock, loadRecentAudits]);

    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await axiosInstance.get("/api/products", {
                params: {
                    page: productPage,
                    limit: PAGE_SIZE,
                    category: selectedCategory || undefined,
                    brand: selectedBrand || undefined,
                    search: searchTerm || undefined,
                },
            });

            setProducts(response.data.data || []);
            setProductPagination(response.data.pagination || null);
        } catch (error) {
            setErrorMessage("Unable to load products.");
        } finally {
            setIsLoading(false);
        }
    }, [productPage, selectedCategory, selectedBrand, searchTerm]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput);
            setProductPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleToggleStatus = async (product) => {
        setStatusTogglingId(product.productId);
        setErrorMessage("");

        try {
            await axiosInstance.patch(
                `/api/products/${encodeURIComponent(product.productId)}/status`,
                { active: !product.active }
            );
            await Promise.all([loadProducts(), loadAnalytics(), loadLowStock(), loadRecentAudits()]);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Unable to update product status."
            );
        } finally {
            setStatusTogglingId(null);
        }
    };

    const handleEntityChange = useCallback(() => {
        reloadReferenceData();
        loadAnalytics();
        loadProducts();
        loadLowStock();
        loadRecentAudits();
    }, [reloadReferenceData, loadAnalytics, loadProducts, loadLowStock, loadRecentAudits]);

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

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard
                    icon={<LayoutGrid size={20} className="text-gray-900" fill="currentColor"/>}
                    iconBg="bg-emerald-50"
                    title="Total Products"
                    value={analytics.totalProducts}
                />
                <StatCard
                    icon={<PieChart size={20} className="text-gray-900"/>}
                    iconBg="bg-emerald-50"
                    title="Total Inventory"
                    value={analytics.totalStock}
                />
                <StatCard
                    icon={<Star size={20} className="text-gray-900"/>}
                    iconBg="bg-amber-50"
                    title="Low Stock Variants"
                    value={analytics.lowStockVariants ?? 0}
                />
                <StatCard
                    icon={<Award size={20} className="text-gray-900"/>}
                    iconBg="bg-amber-50"
                    title="Total Categories"
                    value={analytics.totalCategories}
                />
                <StatCard
                    icon={<Tag size={20} className="text-rose-500"/>}
                    iconBg="bg-rose-50"
                    title="Total Brands"
                    value={analytics.totalBrands}
                />
                <StatCard
                    icon={<Users size={20} className="text-emerald-600"/>}
                    iconBg="bg-emerald-50"
                    title="Total Users"
                    value={analytics.totalUsers}
                />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-medium text-gray-900">
                            Low Stock Products
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Variants at or below threshold of {analytics.lowStockThreshold ?? 5}
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-gray-100 text-gray-500">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Product</th>
                                    <th className="px-5 py-3 font-medium">Color</th>
                                    <th className="px-5 py-3 font-medium">Size</th>
                                    <th className="px-5 py-3 font-medium">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-6 text-center text-xs text-gray-500">
                                            No low-stock items.
                                        </td>
                                    </tr>
                                ) : (
                                    lowStock.slice(0, 10).map((item) => (
                                        <tr key={item.sku} className="border-b border-gray-100">
                                            <td className="px-5 py-3 font-medium text-gray-900">
                                                {item.product?.name || item.sku}
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">{item.color}</td>
                                            <td className="px-5 py-3 text-gray-600">{item.size}</td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                        item.stockAmount === 0
                                                            ? "bg-red-50 text-red-700"
                                                            : "bg-amber-50 text-amber-700"
                                                    }`}
                                                >
                                                    {item.stockAmount}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-medium text-gray-900">
                            Recently Updated Products
                        </h2>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/inventory")}
                            className="text-xs font-medium text-blue-600 hover:underline"
                        >
                            View all →
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-gray-100 text-gray-500">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Date</th>
                                    <th className="px-5 py-3 font-medium">Product</th>
                                    <th className="px-5 py-3 font-medium">Change</th>
                                    <th className="px-5 py-3 font-medium">By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAudits.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-6 text-center text-xs text-gray-500">
                                            No recent inventory updates.
                                        </td>
                                    </tr>
                                ) : (
                                    recentAudits.map((audit) => (
                                        <tr key={audit.auditId} className="border-b border-gray-100">
                                            <td className="px-5 py-3 text-gray-600">
                                                {formatDate(audit.createdAt)}
                                            </td>
                                            <td className="px-5 py-3 text-gray-900">
                                                {audit.product?.name || audit.sku}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                        audit.type === "increase"
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-700"
                                                    }`}
                                                >
                                                    {audit.type === "increase" ? "+" : "-"}
                                                    {audit.amount}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">
                                                {formatUser(audit.updatedBy)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-wrap gap-8 px-5 py-4">
                    <ProductFilters
                        categories={filterCategories}
                        brands={filterBrands}
                        selectedCategory={selectedCategory}
                        selectedBrand={selectedBrand}
                        onCategoryChange={handleCategoryFilterChange}
                        onBrandChange={handleBrandFilterChange}
                        searchInput={searchInput}
                        onSearchChange={(e) => setSearchInput(e.target.value)}
                    />
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
                            <th className="px-5 py-3 font-medium">Status</th>
                            <th className="px-5 py-3 font-medium text-right">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="px-5 py-8 text-center text-gray-500">
                                    Loading products...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-5 py-8 text-center text-gray-500">
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
                                    <td className="px-5 py-4 text-gray-700">
                                        {product.active ? "Active" : "Inactive"}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(product)}
                                                disabled={statusTogglingId === product.productId}
                                                className={`rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                                                    product.active
                                                        ? "bg-red-500 hover:bg-red-600"
                                                        : "bg-emerald-600 hover:bg-emerald-700"
                                                }`}
                                            >
                                                {statusTogglingId === product.productId
                                                    ? "..."
                                                    : product.active
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/admin/products/${encodeURIComponent(product.productId)}`, {state: {product}})}
                                                className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
                                            >
                                                Details
                                            </button>
                                        </div>
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
                <EntityManagementList
                    type="category"
                    addLabel="+ Add Category"
                    onAddClick={() => navigate("/admin/categories")}
                    onChange={handleEntityChange}
                />
                <EntityManagementList
                    type="brand"
                    addLabel="+ Add Brand"
                    onAddClick={() => navigate("/admin/brands")}
                    onChange={handleEntityChange}
                />
            </div>
        </>
    );
};

export default AdminDashboard;
