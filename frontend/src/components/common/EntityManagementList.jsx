import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import ConfirmationModal from "./ConfirmationModal";
import Pagination from "./Pagination";
import RowMenu from "./RowMenu";

const CONFIG = {
    category: {
        label: "Category",
        title: "Categories",
        endpoint: "/api/categories",
        idField: "categoryId",
        nameField: "categoryName",
        nameKey: "categoryName",
    },
    brand: {
        label: "Brand",
        title: "Brands",
        endpoint: "/api/brands",
        idField: "brandId",
        nameField: "brandName",
        nameKey: "brandName",
    },
};

const EntityManagementList = ({
    type,
    reloadKey = 0,
    pageSize = 5,
    addLabel,
    onAddClick,
    onChange,
}) => {
    const config = CONFIG[type];

    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [menuOpenId, setMenuOpenId] = useState(null);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isMutating, setIsMutating] = useState(false);

    const loadItems = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await axiosInstance.get(config.endpoint, {
                params: { page, limit: pageSize },
            });

            setItems(response.data.data || []);
            setPagination(response.data.pagination || null);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || `Unable to load ${config.title.toLowerCase()}.`
            );
        } finally {
            setIsLoading(false);
        }
    }, [config.endpoint, config.title, page, pageSize]);

    useEffect(() => {
        loadItems();
    }, [loadItems, reloadKey]);

    const handleStartEdit = (id, name) => {
        setEditing({ id, name });
        setMenuOpenId(null);
    };

    const handleSaveEdit = async () => {
        if (!editing) return;

        const trimmed = (editing.name || "").trim();
        if (!trimmed) {
            setErrorMessage("Name cannot be empty.");
            return;
        }

        setIsMutating(true);
        setErrorMessage("");

        try {
            await axiosInstance.put(
                `${config.endpoint}/${encodeURIComponent(editing.id)}`,
                { [config.nameKey]: trimmed }
            );
            setEditing(null);
            await loadItems();
            if (onChange) onChange();
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || `Unable to update ${config.label.toLowerCase()}.`
            );
        } finally {
            setIsMutating(false);
        }
    };

    const handleAskDelete = (id, name) => {
        setDeleteTarget({ id, name });
        setMenuOpenId(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setIsMutating(true);
        setErrorMessage("");

        try {
            await axiosInstance.delete(
                `${config.endpoint}/${encodeURIComponent(deleteTarget.id)}`
            );
            setDeleteTarget(null);
            await loadItems();
            if (onChange) onChange();
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || `Unable to delete ${config.label.toLowerCase()}.`
            );
        } finally {
            setIsMutating(false);
        }
    };

    return (
        <section className="mt-6 rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-sm font-medium text-gray-900">{config.title}</h2>
                {addLabel && onAddClick && (
                    <button
                        type="button"
                        onClick={onAddClick}
                        className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                        {addLabel}
                    </button>
                )}
            </div>

            {errorMessage && (
                <div className="mx-5 mb-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                    {errorMessage}
                </div>
            )}

            <table className="w-full text-left text-xs">
                <thead className="border-y border-gray-100 text-gray-500">
                    <tr>
                        <th className="px-5 py-3 font-medium">ID</th>
                        <th className="px-5 py-3 font-medium">Name</th>
                        <th className="px-5 py-3 font-medium"></th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="3" className="px-5 py-8 text-center text-gray-500">
                                Loading...
                            </td>
                        </tr>
                    ) : items.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="px-5 py-8 text-center text-gray-500">
                                No {config.title.toLowerCase()} found.
                            </td>
                        </tr>
                    ) : (
                        items.map((item) => {
                            const id = item[config.idField];
                            const name = item[config.nameField];
                            const isEditing = editing?.id === id;

                            return (
                                <tr key={id} className="border-b border-gray-100">
                                    <td className="px-5 py-4 font-medium text-gray-900">{id}</td>
                                    <td className="px-5 py-4 text-gray-600">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editing.name}
                                                onChange={(event) =>
                                                    setEditing((current) => ({
                                                        ...current,
                                                        name: event.target.value,
                                                    }))
                                                }
                                                autoFocus
                                                disabled={isMutating}
                                                className="h-8 w-full max-w-xs rounded-md border border-gray-300 px-2 text-xs outline-none focus:border-blue-500"
                                            />
                                        ) : (
                                            name
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        {isEditing ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditing(null)}
                                                    disabled={isMutating}
                                                    className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSaveEdit}
                                                    disabled={isMutating}
                                                    className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isMutating ? "Saving..." : "Save"}
                                                </button>
                                            </div>
                                        ) : (
                                            <RowMenu
                                                isOpen={menuOpenId === id}
                                                onToggle={(open) => setMenuOpenId(open ? id : null)}
                                                onEdit={() => handleStartEdit(id, name)}
                                                onDelete={() => handleAskDelete(id, name)}
                                            />
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            <Pagination pagination={pagination} onPageChange={setPage} />

            <ConfirmationModal
                isOpen={!!deleteTarget}
                title={`Delete ${config.label}`}
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
                confirmText="Delete"
                isLoading={isMutating}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </section>
    );
};

export default EntityManagementList;
