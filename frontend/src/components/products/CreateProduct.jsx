import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import ConfirmationModal from "../common/ConfirmationModal";

const CreateProduct = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [createdProduct, setCreatedProduct] = useState(null);
    const [formData, setFormData] = useState({
        productId: "",
        name: "",
        description: "",
        category: "",
        brand: "",
    });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchFormOptions = async () => {
            try {
                const [categoriesResponse, brandsResponse] = await Promise.all([
                    axiosInstance.get("/api/categories"),
                    axiosInstance.get("/api/brands"),
                ]);

                setCategories(categoriesResponse.data.categories || categoriesResponse.data || []);
                setBrands(brandsResponse.data.brands || brandsResponse.data || []);
            } catch (error) {
                setErrorMessage("Unable to load product categories or brands.");
            }
        };

        fetchFormOptions();
    }, []);

    const handleChange = (event) => {
        const {name, value} = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        setIsConfirmOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const response = await axiosInstance.post("/api/products", formData);
            setCreatedProduct(response.data.product);
            setSuccessMessage("New Product Saved!");
            setFormData({
                productId: "",
                name: "",
                description: "",
                category: "",
                brand: "",
            });
            setIsConfirmOpen(false);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Unable to create product."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="mb-5 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="text-xl text-gray-700 hover:text-gray-900"
                    aria-label="Back to dashboard"
                >
                    ←
                </button>

                <h1 className="text-lg font-semibold text-gray-900">
                    Add Product
                </h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
                {errorMessage && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                        {errorMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-x-16 gap-y-7 md:grid-cols-2">
                    <label
                        className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[90px_1fr] md:items-center">
                        Category
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none focus:border-blue-500"
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option
                                    key={category.categoryId}
                                    value={category.categoryId}
                                >
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label
                        className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[90px_1fr] md:items-center">
                        Brand
                        <select
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            required
                            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none focus:border-blue-500"
                        >
                            <option value="">Select a brand</option>
                            {brands.map((brand) => (
                                <option
                                    key={brand.brandId}
                                    value={brand.brandId}
                                >
                                    {brand.brandName}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label
                        className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[90px_1fr] md:items-center">
                        Id
                        <input
                            type="text"
                            name="productId"
                            value={formData.productId}
                            onChange={handleChange}
                            placeholder="Enter Id"
                            required
                            className="h-10 rounded-md border border-gray-300 px-3 text-xs outline-none focus:border-blue-500"
                        />
                    </label>

                    <label
                        className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[90px_1fr] md:items-center">
                        Name
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter Name"
                            required
                            className="h-10 rounded-md border border-gray-300 px-3 text-xs outline-none focus:border-blue-500"
                        />
                    </label>

                    <label
                        className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:col-span-2 md:grid-cols-[90px_1fr]">
                        Description
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter Description"
                            rows="5"
                            className="resize-none rounded-md border border-gray-300 px-3 py-3 text-xs outline-none focus:border-blue-500"
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
                        disabled={isSubmitting}
                        className="rounded-md bg-emerald-600 px-8 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                        {isSubmitting ? "Saving..." : "Submit"}
                    </button>
                </div>
            </form>

            {successMessage && (
                <div
                    className="mt-7 grid grid-cols-1 items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 text-xs shadow-sm md:grid-cols-[1fr_1fr_260px]">
                    <p className="font-medium text-gray-900">{successMessage}</p>
                    <p className="text-gray-500">Product Description</p>
                    <button
                        type="button"
                        onClick={() => navigate("/inventory/add", {state: {product: createdProduct}})}
                        disabled={!createdProduct}
                        className="rounded-md bg-emerald-600 px-8 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                        Update Inventory
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={isConfirmOpen}
                title="Create Product"
                message={`Are you sure you want to create product "${formData.name || "this product"}"?`}
                confirmText="Create Product"
                isLoading={isSubmitting}
                onConfirm={handleConfirmSubmit}
                onCancel={() => setIsConfirmOpen(false)}
            />
        </>
    );
};

export default CreateProduct;