import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import ConfirmationModal from "../components/common/ConfirmationModal";
import PageHeader from "../components/common/PageHeader";
import useReferenceData from "../hooks/useReferenceData";

const PRODUCT_LOOKUP_LIMIT = 200;

const AddInventory = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const productFromState = location.state?.product;

    const { categories, brands } = useReferenceData();

    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");
    const [productOptions, setProductOptions] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [productLookupError, setProductLookupError] = useState("");

    const [formData, setFormData] = useState({
        color: "",
        size: "",
        stockAmount: "",
        reference: "",
    });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadProductOptions = useCallback(async () => {
        if (!selectedCategoryId || !selectedBrandId) {
            setProductOptions([]);
            return;
        }

        setIsLoadingProducts(true);
        setProductLookupError("");

        try {
            const response = await axiosInstance.get("/api/products", {
                params: {
                    page: 1,
                    limit: PRODUCT_LOOKUP_LIMIT,
                    category: selectedCategoryId,
                    brand: selectedBrandId,
                },
            });

            setProductOptions(
                (response.data.data || []).map((item) => item.product || item)
            );
        } catch (error) {
            setProductLookupError(
                error.response?.data?.message || "Unable to load products."
            );
            setProductOptions([]);
        } finally {
            setIsLoadingProducts(false);
        }
    }, [selectedCategoryId, selectedBrandId]);

    useEffect(() => {
        loadProductOptions();
        setSelectedProductId("");
    }, [loadProductOptions]);

    const handleCategoryChange = (event) => {
        setSelectedCategoryId(event.target.value);
        setSelectedBrandId("");
        setSelectedProductId("");
    };

    const handleBrandChange = (event) => {
        setSelectedBrandId(event.target.value);
        setSelectedProductId("");
    };

    const handleProductChange = (event) => {
        setSelectedProductId(event.target.value);
    };

    const lookedUpProduct = productOptions.find(
        (option) => option.productId === selectedProductId
    );

    const product = productFromState || lookedUpProduct || null;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        if (!formData.color || !formData.size || !formData.stockAmount || !formData.reference) {
            setErrorMessage("Please complete all inventory fields.");
            return;
        }

        setIsConfirmOpen(true);
    };

    const handleConfirmUpdate = async () => {
        setIsUpdating(true);
        setErrorMessage("");

        try {
            await axiosInstance.post("/api/products/variants", {
                productId: product.productId,
                color: formData.color,
                size: formData.size,
                stockAmount: Number(formData.stockAmount),
                reference: formData.reference,
            });

            setSuccessMessage("Inventory saved successfully.");
            setFormData({
                color: "",
                size: "",
                stockAmount: "",
                reference: "",
            });
            setIsConfirmOpen(false);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Unable to update inventory."
            );
            setIsConfirmOpen(false);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <div className="mb-3">
                <PageHeader title="Add Inventory" onBack={() => navigate(-1)} className="" />

                {product && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                        <span>{product?.category?.categoryName || "Category"}</span>
                        <span>›</span>
                        <span>{product?.brand?.brandName || "Brand"}</span>
                        <span>›</span>
                        <span>{product?.name || "Product"}</span>
                    </div>
                )}
            </div>

            {!product && (
                <div className="mb-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="mb-4 text-xs font-medium text-gray-700">
                        Select a product to manage its inventory
                    </p>

                    {productLookupError && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                            {productLookupError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700">
                            Category
                            <select
                                value={selectedCategoryId}
                                onChange={handleCategoryChange}
                                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none focus:border-blue-500"
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700">
                            Brand
                            <select
                                value={selectedBrandId}
                                onChange={handleBrandChange}
                                disabled={!selectedCategoryId}
                                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                            >
                                <option value="">Select a brand</option>
                                {brands.map((brand) => (
                                    <option key={brand.brandId} value={brand.brandId}>
                                        {brand.brandName}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700">
                            Product
                            <select
                                value={selectedProductId}
                                onChange={handleProductChange}
                                disabled={!selectedCategoryId || !selectedBrandId || isLoadingProducts}
                                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                            >
                                <option value="">
                                    {isLoadingProducts
                                        ? "Loading..."
                                        : selectedCategoryId && selectedBrandId
                                        ? productOptions.length === 0
                                            ? "No products available"
                                            : "Select a product"
                                        : "Select a product"}
                                </option>
                                {productOptions.map((option) => (
                                    <option key={option.productId} value={option.productId}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
            )}

            {product && (
                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                    {errorMessage && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                            {successMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-x-20 gap-y-16 md:grid-cols-2">
                        <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[90px_1fr] md:items-center">
                            Color
                            <select
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                required
                                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none focus:border-blue-500"
                            >
                                <option value="">Select a Color</option>
                                <option value="Blue">Blue</option>
                                <option value="White">White</option>
                                <option value="Grey">Grey</option>
                                <option value="Black">Black</option>
                            </select>
                        </label>

                        <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[90px_1fr] md:items-center">
                            Size
                            <select
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                required
                                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none focus:border-blue-500"
                            >
                                <option value="">Select Size</option>
                                <option value="XS">XS</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                            </select>
                        </label>

                        <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[90px_1fr] md:items-center">
                            Stock Amount
                            <input
                                type="number"
                                name="stockAmount"
                                value={formData.stockAmount}
                                onChange={handleChange}
                                placeholder="Enter Stock Amount"
                                min="1"
                                required
                                className="h-10 rounded-md border border-gray-300 px-3 text-xs outline-none focus:border-blue-500"
                            />
                        </label>

                        <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[90px_1fr] md:items-center">
                            Ref
                            <input
                                type="text"
                                name="reference"
                                value={formData.reference}
                                onChange={handleChange}
                                placeholder="Enter Reference"
                                required
                                className="h-10 rounded-md border border-gray-300 px-3 text-xs outline-none focus:border-blue-500"
                            />
                        </label>
                    </div>

                    <div className="mt-5 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="rounded-md border border-gray-200 px-8 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="rounded-md bg-emerald-600 px-8 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                            {isUpdating ? "Saving..." : "Submit"}
                        </button>
                    </div>
                </form>
            )}

            <ConfirmationModal
                isOpen={isConfirmOpen}
                title="Update Inventory"
                message={`Are you sure you want to add ${formData.stockAmount || 0} items to this inventory?`}
                confirmText="Update Inventory"
                isLoading={isUpdating}
                onConfirm={handleConfirmUpdate}
                onCancel={() => setIsConfirmOpen(false)}
            />
        </>
    );
};

export default AddInventory;
