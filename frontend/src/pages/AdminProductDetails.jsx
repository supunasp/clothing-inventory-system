import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import PageHeader from "../components/common/PageHeader";
import Pagination from "../components/common/Pagination";
import StockBadge from "../components/common/StockBadge";
import { PAGE_SIZE } from "../constants";

const formatDate = (iso) => {
    if (!iso) return "-";
    try {
        return new Date(iso).toLocaleString();
    } catch (error) {
        return iso;
    }
};

const formatUser = (user) => {
    if (!user) return "-";
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return name || user.email || "-";
};

const AdminProductDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { productId } = useParams();

    const [product, setProduct] = useState(location.state?.product || null);
    const [isLoadingProduct, setIsLoadingProduct] = useState(!location.state?.product);

    const [variants, setVariants] = useState([]);
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);

    const [audits, setAudits] = useState([]);
    const [auditPagination, setAuditPagination] = useState(null);
    const [auditPage, setAuditPage] = useState(1);
    const [isLoadingAudits, setIsLoadingAudits] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (product) return;

        const loadProduct = async () => {
            setIsLoadingProduct(true);
            try {
                const response = await axiosInstance.get(
                    `/api/products/${encodeURIComponent(productId)}`
                );
                setProduct(response.data);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message || "Unable to load product."
                );
            } finally {
                setIsLoadingProduct(false);
            }
        };

        loadProduct();
    }, [productId, product]);

    useEffect(() => {
        if (!productId) return;

        const loadVariants = async () => {
            setIsLoadingVariants(true);
            try {
                const response = await axiosInstance.get("/api/products/variants", {
                    params: { productId },
                });
                setVariants(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message || "Unable to load variants."
                );
            } finally {
                setIsLoadingVariants(false);
            }
        };

        loadVariants();
    }, [productId]);

    const loadAudits = useCallback(async () => {
        if (!productId) return;

        setIsLoadingAudits(true);
        try {
            const response = await axiosInstance.get("/api/inventory-audits", {
                params: { page: auditPage, limit: PAGE_SIZE, productId },
            });
            setAudits(response.data.data || []);
            setAuditPagination(response.data.pagination || null);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Unable to load audit history."
            );
        } finally {
            setIsLoadingAudits(false);
        }
    }, [productId, auditPage]);

    useEffect(() => {
        loadAudits();
    }, [loadAudits]);

    const totalInventory = variants.reduce(
        (sum, variant) => sum + (variant.stockAmount || 0),
        0
    );

    return (
        <>
            <PageHeader
                title="Product Details"
                onBack={() => navigate("/dashboard")}
            />

            {errorMessage && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    {errorMessage}
                </div>
            )}

            <section className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                {isLoadingProduct ? (
                    <p className="py-4 text-center text-xs text-gray-500">
                        Loading product...
                    </p>
                ) : product ? (
                    <>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {product.name}
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    {product.category?.categoryName || "Category"} ›{" "}
                                    {product.brand?.brandName || "Brand"} ›{" "}
                                    {product.productId}
                                </p>
                                {product.description && (
                                    <p className="mt-2 text-sm text-gray-700">
                                        {product.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                        product.active
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-red-50 text-red-700"
                                    }`}
                                >
                                    {product.active ? "Active" : "Inactive"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/inventory/add", { state: { product } })
                                    }
                                    className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                                >
                                    Add Variant
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            Total inventory:{" "}
                            <span className="font-semibold text-gray-900">
                                {totalInventory}
                            </span>
                        </div>
                    </>
                ) : (
                    <p className="py-4 text-center text-xs text-gray-500">
                        Product not found.
                    </p>
                )}
            </section>

            <section className="mb-6 rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="text-sm font-medium text-gray-900">Variants</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-gray-100 text-gray-500">
                            <tr>
                                <th className="px-5 py-3 font-medium">SKU</th>
                                <th className="px-5 py-3 font-medium">Color</th>
                                <th className="px-5 py-3 font-medium">Size</th>
                                <th className="px-5 py-3 font-medium">Stock</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingVariants ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                                        Loading variants...
                                    </td>
                                </tr>
                            ) : variants.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                                        No variants yet for this product.
                                    </td>
                                </tr>
                            ) : (
                                variants.map((variant) => (
                                    <tr key={variant.sku} className="border-b border-gray-100">
                                        <td className="px-5 py-4 text-gray-700">{variant.sku}</td>
                                        <td className="px-5 py-4 text-gray-700">{variant.color}</td>
                                        <td className="px-5 py-4 text-gray-700">{variant.size}</td>
                                        <td className="px-5 py-4 text-gray-700">
                                            {variant.stockAmount}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StockBadge stockAmount={variant.stockAmount} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="text-sm font-medium text-gray-900">Inventory Audit History</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-gray-100 text-gray-500">
                            <tr>
                                <th className="px-5 py-3 font-medium">Date</th>
                                <th className="px-5 py-3 font-medium">SKU</th>
                                <th className="px-5 py-3 font-medium">Type</th>
                                <th className="px-5 py-3 font-medium">Before</th>
                                <th className="px-5 py-3 font-medium">After</th>
                                <th className="px-5 py-3 font-medium">Amount</th>
                                <th className="px-5 py-3 font-medium">Reference</th>
                                <th className="px-5 py-3 font-medium">Updated By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingAudits ? (
                                <tr>
                                    <td colSpan="8" className="px-5 py-8 text-center text-gray-500">
                                        Loading audits...
                                    </td>
                                </tr>
                            ) : audits.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-5 py-8 text-center text-gray-500">
                                        No audit history for this product.
                                    </td>
                                </tr>
                            ) : (
                                audits.map((audit) => (
                                    <tr key={audit.auditId} className="border-b border-gray-100">
                                        <td className="px-5 py-4 text-gray-600">
                                            {formatDate(audit.createdAt)}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">{audit.sku}</td>
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
                                        <td className="px-5 py-4 text-gray-600">
                                            {audit.quantityBefore}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">
                                            {audit.quantityAfter}
                                        </td>
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

                <Pagination pagination={auditPagination} onPageChange={setAuditPage} />
            </section>
        </>
    );
};

export default AdminProductDetails;
