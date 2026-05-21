import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";

const AddCategory = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        categoryId: "",
        categoryName: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            await axiosInstance.post("/api/categories", formData);

            setSuccessMessage("Category saved successfully.");
            setFormData({
                categoryId: "",
                categoryName: "",
            });
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Unable to create category."
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
                    Add Category
                </h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="max-w-xl rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
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

                <div className="space-y-5">
                    <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[90px_1fr] md:items-center">
                        Id
                        <input
                            type="text"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            placeholder="Enter Id"
                            required
                            className="h-10 rounded-md border border-gray-300 px-3 text-xs outline-none focus:border-blue-500"
                        />
                    </label>

                    <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[90px_1fr] md:items-center">
                        Name
                        <input
                            type="text"
                            name="categoryName"
                            value={formData.categoryName}
                            onChange={handleChange}
                            placeholder="Enter Name"
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
                        disabled={isSubmitting}
                        className="rounded-md bg-emerald-600 px-8 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                        {isSubmitting ? "Saving..." : "Submit"}
                    </button>
                </div>
            </form>
        </>
    );
};

export default AddCategory;