import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import PageHeader from "../components/common/PageHeader";

const Profile = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });
    const [role, setRole] = useState("");
    const [active, setActive] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setErrorMessage("");
            try {
                const response = await axiosInstance.get("/api/auth/profile");
                setFormData({
                    firstName: response.data.firstName || "",
                    lastName: response.data.lastName || "",
                    email: response.data.email || "",
                });
                setRole(response.data.role || "");
                setActive(response.data.active);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message || "Unable to load profile."
                );
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchProfile();
    }, [user]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await axiosInstance.put("/api/auth/profile", formData);
            login(response.data);
            setSuccessMessage("Profile updated successfully.");
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Unable to update profile."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const roleLabel = role === "admin" ? "Admin" : "Staff";

    return (
        <>
            <PageHeader title="My Profile" onBack={() => navigate("/dashboard")} />

            {errorMessage && (
                <div className="mb-4 max-w-2xl rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 max-w-2xl rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                    {successMessage}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="max-w-2xl rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
                {isLoading ? (
                    <p className="py-8 text-center text-xs text-gray-500">
                        Loading profile...
                    </p>
                ) : (
                    <>
                        <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-5">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-2xl font-medium text-gray-900">
                                {(formData.firstName || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-base font-semibold text-gray-900">
                                    {formData.firstName} {formData.lastName}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                            role === "admin"
                                                ? "bg-blue-50 text-blue-700"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {roleLabel}
                                    </span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                            active
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-red-50 text-red-700"
                                        }`}
                                    >
                                        {active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-16 gap-y-5 md:grid-cols-2">
                            <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[110px_1fr] md:items-center">
                                First Name
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    required
                                    className="h-10 rounded-md border border-gray-300 px-3 text-xs outline-none focus:border-blue-500"
                                />
                            </label>

                            <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[110px_1fr] md:items-center">
                                Last Name
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    required
                                    className="h-10 rounded-md border border-gray-300 px-3 text-xs outline-none focus:border-blue-500"
                                />
                            </label>

                            <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:col-span-2 md:grid-cols-[110px_1fr] md:items-center">
                                Email
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    required
                                    className="h-10 rounded-md border border-gray-300 px-3 text-xs outline-none focus:border-blue-500"
                                />
                            </label>

                            <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[110px_1fr] md:items-center">
                                Role
                                <input
                                    type="text"
                                    value={roleLabel}
                                    disabled
                                    className="h-10 rounded-md border border-gray-200 bg-gray-50 px-3 text-xs text-gray-500"
                                />
                            </label>

                            <label className="grid grid-cols-1 gap-2 text-xs font-medium text-gray-700 md:grid-cols-[110px_1fr] md:items-center">
                                Status
                                <input
                                    type="text"
                                    value={active ? "Active" : "Inactive"}
                                    disabled
                                    className="h-10 rounded-md border border-gray-200 bg-gray-50 px-3 text-xs text-gray-500"
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
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
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </>
    );
};

export default Profile;
