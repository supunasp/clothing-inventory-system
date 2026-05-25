import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import ConfirmationModal from "../components/common/ConfirmationModal";
import Pagination from "../components/common/Pagination";
import ProductFilters from "../components/common/ProductFilters";
import StockBadge from "../components/common/StockBadge";
import useReferenceData from "../hooks/useReferenceData";
import { PAGE_SIZE } from "../constants";

const ProductDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const { categories, brands } = useReferenceData();
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [productsError, setProductsError] = useState("");

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);
    const [variantsError, setVariantsError] = useState("");

    const [inventoryInputs, setInventoryInputs] = useState({});
    const [inventoryAction, setInventoryAction] = useState(null);
    const [isUpdatingInventory, setIsUpdatingInventory] = useState(false);
    const [inventoryError, setInventoryError] = useState("");

    const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Staff User";

    const loadProducts = useCallback(async () => {
        setIsLoadingProducts(true);
        setProductsError("");

        try {
            const response = await axiosInstance.get("/api/products", {
                params: {
                    page,
                    limit: PAGE_SIZE,
                    category: selectedCategory || undefined,
                    brand: selectedBrand || undefined,
                    active: true,
                },
            });

            setProducts(response.data.data || []);
            setPagination(response.data.pagination || null);
        } catch (error) {
            setProductsError(
                error.response?.data?.message || "Unable to load products."
            );
        } finally {
            setIsLoadingProducts(false);
        }
    }, [page, selectedCategory, selectedBrand]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const loadVariants = useCallback(async (productId) => {
        setIsLoadingVariants(true);
        setVariantsError("");

        try {
            const response = await axiosInstance.get("/api/products/variants", {
                params: { productId },
            });

            setVariants(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setVariantsError(
                error.response?.data?.message || "Unable to load product variants."
            );
            setVariants([]);
        } finally {
            setIsLoadingVariants(false);
        }
    }, []);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setInventoryError("");
        setInventoryInputs({});
        loadVariants(product.productId);
    };

    const handleClearSelection = () => {
        setSelectedProduct(null);
        setVariants([]);
        setInventoryInputs({});
        setInventoryError("");
    };

    const handleInventoryInputChange = (sku, field, value) => {
        setInventoryInputs((currentInputs) => ({
            ...currentInputs,
            [sku]: {
                ...currentInputs[sku],
                [field]: value,
            },
        }));
    };

    const handleOpenInventoryConfirmation = (type, variant) => {
        setInventoryError("");

        const rowInputs = inventoryInputs[variant.sku] || {};
        const amount = Number(rowInputs.amount);
        const reference = rowInputs.reference?.trim();

        if (!amount || amount <= 0) {
            setInventoryError("Please enter a valid inventory amount.");
            return;
        }

        if (!reference) {
            setInventoryError("Please enter a reference before updating inventory.");
            return;
        }

        if (type === "decrease" && amount > variant.stockAmount) {
            setInventoryError("You cannot remove more inventory than currently available.");
            return;
        }

        setInventoryAction({ type, variant, amount, reference });
    };

    const handleConfirmInventoryUpdate = async () => {
        if (!inventoryAction || !selectedProduct) {
            return;
        }

        setIsUpdatingInventory(true);
        setInventoryError("");

        try {
            const { type, variant, amount, reference } = inventoryAction;

            await axiosInstance.post(
                `/api/products/variants/${encodeURIComponent(variant.sku)}/inventory`,
                { type, amount, reference }
            );

            setInventoryInputs((currentInputs) => ({
                ...currentInputs,
                [variant.sku]: { amount: "", reference: "" },
            }));

            setInventoryAction(null);

            await Promise.all([
                loadVariants(selectedProduct.productId),
                loadProducts(),
            ]);
        } catch (error) {
            setInventoryError(
                error.response?.data?.message || "Unable to update inventory."
            );
        } finally {
            setIsUpdatingInventory(false);
        }
    };

    const handleCategoryFilterChange = (event) => {
        setSelectedCategory(event.target.value);
        setPage(1);
        handleClearSelection();
    };

    const handleBrandFilterChange = (event) => {
        setSelectedBrand(event.target.value);
        setPage(1);
        handleClearSelection();
    };

    return (
        <>
            <p className="mb-5 text-xl text-[#333333]">
                Welcome back, <span className="font-semibold">{fullName}.</span>
            </p>

            {productsError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    {productsError}
                </div>
            )}

            <div className="rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div className="flex flex-wrap gap-6">
                        <ProductFilters
                            categories={categories}
                            brands={brands}
                            selectedCategory={selectedCategory}
                            selectedBrand={selectedBrand}
                            onCategoryChange={handleCategoryFilterChange}
                            onBrandChange={handleBrandFilterChange}
                        />
                    </div>

                    <button
                        onClick={() => navigate("/products/create")}
                        className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                        + Add Product
                    </button>
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
                            {isLoadingProducts ? (
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
                                    <tr
                                        key={product.productId}
                                        className={`border-b border-gray-100 ${
                                            selectedProduct?.productId === product.productId
                                                ? "bg-blue-50"
                                                : ""
                                        }`}
                                    >
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
                                                onClick={() => handleSelectProduct(product)}
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

                <Pagination pagination={pagination} onPageChange={setPage} />
            </div>

            {selectedProduct && (
                <section className="mt-8">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Product Details
                            </h2>
                            <p className="mt-2 text-xs text-gray-500">
                                {selectedProduct.category?.categoryName || "Category"} ›{" "}
                                {selectedProduct.brand?.brandName || "Brand"} ›{" "}
                                {selectedProduct.name}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/inventory/add", { state: { product: selectedProduct } })
                                }
                                className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                            >
                                Update Inventory
                            </button>
                            <button
                                onClick={handleClearSelection}
                                className="rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:bg-white"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>

                    {variantsError && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                            {variantsError}
                        </div>
                    )}

                    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-gray-100 text-gray-500">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Color</th>
                                    <th className="px-5 py-3 font-medium">Size</th>
                                    <th className="px-5 py-3 font-medium">Inventory</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium"></th>
                                    <th className="px-5 py-3 font-medium"></th>
                                    <th className="px-5 py-3 font-medium"></th>
                                    <th className="px-5 py-3 font-medium"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoadingVariants ? (
                                    <tr>
                                        <td colSpan="8" className="px-5 py-8 text-center text-gray-500">
                                            Loading variants...
                                        </td>
                                    </tr>
                                ) : variants.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-5 py-8 text-center text-gray-500">
                                            No variants found for this product.
                                        </td>
                                    </tr>
                                ) : (
                                    variants.map((variant) => (
                                        <tr key={variant.sku} className="border-b border-gray-100">
                                            <td className="px-5 py-4 text-gray-700">{variant.color}</td>
                                            <td className="px-5 py-4 text-gray-700">{variant.size}</td>
                                            <td className="px-5 py-4 text-gray-700">{variant.stockAmount}</td>
                                            <td className="px-5 py-4">
                                                <StockBadge stockAmount={variant.stockAmount} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <input
                                                    type="number"
                                                    placeholder="Enter Amount"
                                                    min="1"
                                                    value={inventoryInputs[variant.sku]?.amount || ""}
                                                    onChange={(event) =>
                                                        handleInventoryInputChange(
                                                            variant.sku,
                                                            "amount",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="h-8 w-28 rounded-md border border-gray-200 px-2 text-xs outline-none focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-5 py-4">
                                                <input
                                                    type="text"
                                                    placeholder="Enter Reference"
                                                    value={inventoryInputs[variant.sku]?.reference || ""}
                                                    onChange={(event) =>
                                                        handleInventoryInputChange(
                                                            variant.sku,
                                                            "reference",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="h-8 w-32 rounded-md border border-gray-200 px-2 text-xs outline-none focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() =>
                                                        handleOpenInventoryConfirmation("decrease", variant)
                                                    }
                                                    className="rounded-md bg-red-500 px-4 py-1.5 text-white hover:bg-red-600"
                                                >
                                                    −
                                                </button>
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() =>
                                                        handleOpenInventoryConfirmation("increase", variant)
                                                    }
                                                    className="rounded-md bg-emerald-600 px-8 py-1.5 text-white hover:bg-emerald-700"
                                                >
                                                    +
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {inventoryError && (
                        <div className="mt-4 rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-800">{inventoryError}</div>
                        </div>
                    )}
                </section>
            )}

            <ConfirmationModal
                isOpen={!!inventoryAction}
                onCancel={() => setInventoryAction(null)}
                onConfirm={handleConfirmInventoryUpdate}
                isLoading={isUpdatingInventory}
            >
                Are you sure you want to{" "}
                {inventoryAction?.type === "increase" ? "add" : "remove"}{" "}
                {inventoryAction?.amount} units{" "}
                {inventoryAction?.type === "increase" ? "to" : "from"}{" "}
                {inventoryAction?.variant?.color} {inventoryAction?.variant?.size} variant?
            </ConfirmationModal>
        </>
    );
};

export default ProductDashboard;
