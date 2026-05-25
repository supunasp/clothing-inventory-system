import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import Pagination from "../components/common/Pagination";

const PAGE_SIZE = 10;

const formatDate = (iso) => {
    if (!iso) return "-";
    try {
        const date = new Date(iso);
        return date.toLocaleString();
    } catch (error) {
        return iso;
    }
};

const formatUser = (user) => {
    if (!user) return "-";
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return name || user.email || "-";
};

const InventoryAuditList = () => {
    const [audits, setAudits] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const loadAudits = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await axiosInstance.get("/api/inventory-audits", {
                params: { page, limit: PAGE_SIZE },
            });

            setAudits(response.data.data || []);
            setPagination(response.data.pagination || null);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Unable to load inventory audits."
            );
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadAudits();
    }, [loadAudits]);

    return (
        <>
            <h1 className="mb-5 text-lg font-semibold text-gray-900">
                Inventory Management
            </h1>

            {errorMessage && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    {errorMessage}
                </div>
            )}

            <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-y border-gray-100 text-gray-500">
                            <tr>
                                <th className="px-5 py-3 font-medium">Date</th>
                                <th className="px-5 py-3 font-medium">Product</th>
                                <th className="px-5 py-3 font-medium">Color</th>
                                <th className="px-5 py-3 font-medium">Size</th>
                                <th className="px-5 py-3 font-medium">Type</th>
                                <th className="px-5 py-3 font-medium">Before</th>
                                <th className="px-5 py-3 font-medium">After</th>
                                <th className="px-5 py-3 font-medium">Amount</th>
                                <th className="px-5 py-3 font-medium">Reference</th>
                                <th className="px-5 py-3 font-medium">Updated By</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="10" className="px-5 py-8 text-center text-gray-500">
                                        Loading audits...
                                    </td>
                                </tr>
                            ) : audits.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-5 py-8 text-center text-gray-500">
                                        No inventory audits yet.
                                    </td>
                                </tr>
                            ) : (
                                audits.map((audit) => (
                                    <tr key={audit.auditId} className="border-b border-gray-100">
                                        <td className="px-5 py-4 text-gray-600">
                                            {formatDate(audit.createdAt)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-900">
                                            {audit.product ? (
                                                <span>
                                                    <span className="font-medium">{audit.product.name}</span>
                                                    <span className="ml-1 text-gray-400">({audit.product.productId})</span>
                                                </span>
                                            ) : (
                                                audit.sku
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">{audit.color || "-"}</td>
                                        <td className="px-5 py-4 text-gray-600">{audit.size || "-"}</td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                    audit.type === "increase"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-red-50 text-red-700"
                                                }`}
                                            >
                                                {audit.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">{audit.quantityBefore}</td>
                                        <td className="px-5 py-4 text-gray-600">{audit.quantityAfter}</td>
                                        <td className="px-5 py-4 text-gray-600">{audit.amount}</td>
                                        <td className="px-5 py-4 text-gray-600">{audit.reference}</td>
                                        <td className="px-5 py-4 text-gray-600">
                                            {formatUser(audit.updatedBy)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination pagination={pagination} onPageChange={setPage} />
            </section>
        </>
    );
};

export default InventoryAuditList;
