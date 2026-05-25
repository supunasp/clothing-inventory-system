import {useState} from "react";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import ConfirmationModal from "../common/ConfirmationModal";
import EntityManagementList from "../common/EntityManagementList";
import PageHeader from "../common/PageHeader";

const AddBrand = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        brandId: "",
        brandName: "",
    });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [listReloadKey, setListReloadKey] = useState(0);

    const handleChange = (event) => {
        const {name, value} = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        if (!formData.brandId || !formData.brandName) {
            setErrorMessage("Please complete all brand fields.");
            return;
        }

        setIsConfirmOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await axiosInstance.post("/api/brands", formData);

            setSuccessMessage("Brand saved successfully.");
            setFormData({
                brandId: "",
                brandName: "",
            });
            setIsConfirmOpen(false);
            setListReloadKey((current) => current + 1);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Unable to create brand."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <PageHeader title="Add Brand" onBack={() => navigate("/dashboard")} />

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
                    <div
                        className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                        {successMessage}
                    </div>
                )}

                <div className="space-y-5">
                    <label
                        className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[90px_1fr] md:items-center">
                        Id
                        <input
                            type="text"
                            name="brandId"
                            value={formData.brandId}
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
                            name="brandName"
                            value={formData.brandName}
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
                        className="rounded-md bg-emerald-600 px-8 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>

            <EntityManagementList type="brand" reloadKey={listReloadKey} />

            <ConfirmationModal
                isOpen={isConfirmOpen}
                title="Create Brand"
                message={`Are you sure you want to create brand "${formData.brandName || "this brand"}"?`}
                confirmText="Create Brand"
                isLoading={isSubmitting}
                onConfirm={handleConfirmSubmit}
                onCancel={() => setIsConfirmOpen(false)}
            />
        </>
    );
};

export default AddBrand;