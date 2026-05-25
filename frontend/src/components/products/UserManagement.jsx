import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import ConfirmationModal from "../common/ConfirmationModal";
import PageHeader from "../common/PageHeader";

const ROLE_ADMIN = "admin";
const ROLE_STAFF = "staff";

const Pagination = ({ pagination, onPageChange }) => {
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

const UserManagement = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState(null);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [active, setActive] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: "",
        message: "",
        confirmText: "",
        action: null,
    });

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await axiosInstance.get("/api/admin/users", {
                params: {
                    page,
                    limit: 10,
                    search: search || undefined,
                    role: role || undefined,
                    active: active || undefined,
                },
            });

            setUsers(response.data.data || []);
            setPagination(response.data.pagination || null);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Unable to load users."
            );
        } finally {
            setIsLoading(false);
        }
    }, [page, role, active, search]);

    useEffect(() => {
        loadUsers();
    }, [page, role, active, loadUsers]);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setPage(1);
        loadUsers();
    };

    const openConfirm = ({ title, message, confirmText, action }) => {
        setConfirmState({
            isOpen: true,
            title,
            message,
            confirmText,
            action,
        });
    };

    const closeConfirm = () => {
        setConfirmState({
            isOpen: false,
            title: "",
            message: "",
            confirmText: "",
            action: null,
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmState.action) return;

        setIsActionLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            await confirmState.action();
            closeConfirm();
            await loadUsers();
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Unable to complete user operation."
            );
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleStatusToggle = (targetUser) => {
        const nextActive = !targetUser.active;

        openConfirm({
            title: nextActive ? "Activate User" : "Deactivate User",
            message: `Are you sure you want to ${nextActive ? "activate" : "deactivate"} ${targetUser.firstName} ${targetUser.lastName}?`,
            confirmText: nextActive ? "Activate" : "Deactivate",
            action: async () => {
                const response = await axiosInstance.patch(
                    `/api/admin/users/${targetUser.id}/status`,
                    { active: nextActive }
                );
                setSuccessMessage(response.data.message || "User status updated.");
            },
        });
    };

    const handleRoleChange = (targetUser, nextRole) => {
        if (targetUser.role === nextRole) return;

        openConfirm({
            title: "Update User Role",
            message: `Are you sure you want to change ${targetUser.firstName} ${targetUser.lastName}'s role to ${nextRole}?`,
            confirmText: "Update Role",
            action: async () => {
                const response = await axiosInstance.patch(
                    `/api/admin/users/${targetUser.id}/role`,
                    { role: nextRole }
                );
                setSuccessMessage(response.data.message || "User role updated.");
            },
        });
    };

    const handleDeleteUser = (targetUser) => {
        openConfirm({
            title: "Delete User",
            message: `Are you sure you want to permanently delete ${targetUser.firstName} ${targetUser.lastName}?`,
            confirmText: "Delete User",
            action: async () => {
                const response = await axiosInstance.delete(
                    `/api/admin/users/${targetUser.id}`
                );
                setSuccessMessage(response.data.message || "User deleted.");
            },
        });
    };

    const handleRoleFilterChange = (event) => {
        setRole(event.target.value);
        setPage(1);
    };

    const handleActiveFilterChange = (event) => {
        setActive(event.target.value);
        setPage(1);
    };

    const isCurrentUser = (targetUser) => currentUser?.id === targetUser.id;

    return (
        <>
            <PageHeader title="User Management" onBack={() => navigate("/dashboard")} />

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

            <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">


                    <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3">
                        <div className="flex h-9 w-64 items-center rounded-md border border-gray-300 bg-white px-3 focus-within:border-blue-500">
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search name or email"
                                className="h-full flex-1 text-xs outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            aria-label="Search users"
                            className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500 text-white hover:bg-blue-600"
                        >
                            <Search size={16} />
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-3">
                        <select
                            value={role}
                            onChange={handleRoleFilterChange}
                            className="h-9 w-36 rounded-md border border-gray-300 bg-white px-3 text-xs outline-none focus:border-blue-500"
                        >
                            <option value="">All Roles</option>
                            <option value={ROLE_ADMIN}>Admin</option>
                            <option value={ROLE_STAFF}>Staff</option>
                        </select>

                        <select
                            value={active}
                            onChange={handleActiveFilterChange}
                            className="h-9 w-36 rounded-md border border-gray-300 bg-white px-3 text-xs outline-none focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-y border-gray-100 text-gray-500">
                        <tr>
                            <th className="px-5 py-3 font-medium">Name</th>
                            <th className="px-5 py-3 font-medium">Email</th>
                            <th className="px-5 py-3 font-medium">Role</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                            <th className="px-5 py-3 font-medium text-right">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((targetUser) => (
                                <tr key={targetUser.id} className="border-b border-gray-100">
                                    <td className="px-5 py-4 font-medium text-gray-900">
                                        {targetUser.firstName} {targetUser.lastName}
                                        {isCurrentUser(targetUser) && (
                                            <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">
                                                You
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-gray-600">
                                        {targetUser.email}
                                    </td>

                                    <td className="px-5 py-4 text-gray-600">
                                        <select
                                            value={targetUser.role}
                                            disabled={isCurrentUser(targetUser)}
                                            onChange={(event) =>
                                                handleRoleChange(targetUser, event.target.value)
                                            }
                                            className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                                        >
                                            <option value={ROLE_ADMIN}>Admin</option>
                                            <option value={ROLE_STAFF}>Staff</option>
                                        </select>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                                                targetUser.active
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-red-50 text-red-700"
                                            }`}
                                        >
                                            {targetUser.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                disabled={isCurrentUser(targetUser)}
                                                onClick={() => handleStatusToggle(targetUser)}
                                                className={`rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                                                    targetUser.active
                                                        ? "bg-amber-500 hover:bg-amber-600"
                                                        : "bg-emerald-600 hover:bg-emerald-700"
                                                }`}
                                            >
                                                {targetUser.active ? "Deactivate" : "Activate"}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isCurrentUser(targetUser)}
                                                onClick={() => handleDeleteUser(targetUser)}
                                                className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <Pagination pagination={pagination} onPageChange={setPage} />
            </section>

            <ConfirmationModal
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                isLoading={isActionLoading}
                onConfirm={handleConfirmAction}
                onCancel={closeConfirm}
            />
        </>
    );
};

export default UserManagement;