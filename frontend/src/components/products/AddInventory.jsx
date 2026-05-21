import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ConfirmationModal from "../common/ConfirmationModal";

const AddInventory = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const product = location.state?.product;

    const [formData, setFormData] = useState({
        color: "",
        size: "",
        amount: "",
        reference: "",
    });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

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

        if (!formData.color || !formData.size || !formData.amount || !formData.reference) {
            setErrorMessage("Please complete all inventory fields.");
            return;
        }

        setIsConfirmOpen(true);
    };

    const handleConfirmUpdate = async () => {
        setIsUpdating(true);
        setErrorMessage("");

        try {
            // Add inventory API call here when backend endpoint is ready.
            // Example:
            // await axiosInstance.post("/api/inventory", formData);

            setSuccessMessage("Inventory saved successfully.");
            setFormData({
                color: "",
                size: "",
                amount: "",
                reference: "",
            });
            setIsConfirmOpen(false);
        } catch (error) {
            setErrorMessage("Unable to update inventory.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <div className="mb-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-xl text-gray-700 hover:text-gray-900"
                        aria-label="Back"
                    >
                        ←
                    </button>

                    <h1 className="text-lg font-semibold text-gray-900">
                        Add Inventory
                    </h1>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <span>{product?.categoryName || "Category"}</span>
                    <span>›</span>
                    <span>{product?.brand || "Brand"}</span>
                    <span>›</span>
                    <span>{product?.name || "Product"}</span>
                </div>
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
                        Amount
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="Enter Amount"
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
                        className="rounded-md bg-emerald-600 px-8 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                        Submit
                    </button>
                </div>
            </form>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                title="Update Inventory"
                message={`Are you sure you want to add ${formData.amount || 0} items to this inventory?`}
                confirmText="Update Inventory"
                isLoading={isUpdating}
                onConfirm={handleConfirmUpdate}
                onCancel={() => setIsConfirmOpen(false)}
            />
        </>
    );
};

export default AddInventory;