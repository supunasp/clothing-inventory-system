import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ConfirmationModal from "../common/ConfirmationModal";

const products = [
    {
        id: 1,
        name: "Office Shirt",
        description: "Plain pure slim long sleeves.",
        category: "Shirt",
        brand: "Mio",
        inventory: 10,
        variants: [
            { id: 1, color: "Blue", size: "L", inventory: 10 },
            { id: 2, color: "White", size: "XS", inventory: 8 },
            { id: 3, color: "White", size: "M", inventory: 12 },
        ],
    },
    {
        id: 2,
        name: "Hiking Tshirt",
        description: "Cooling edition",
        category: "T Shirt",
        brand: "Mio",
        inventory: 15,
        variants: [
            { id: 1, color: "Black", size: "M", inventory: 6 },
            { id: 2, color: "Gray", size: "L", inventory: 9 },
        ],
    },
    {
        id: 3,
        name: "Denim",
        description: "For Hard Work",
        category: "Trouser",
        brand: "CK",
        inventory: 12,
        variants: [
            { id: 1, color: "Blue", size: "32", inventory: 4 },
            { id: 2, color: "Black", size: "34", inventory: 8 },
        ],
    },
];

const ProductDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [productList, setProductList] = useState(products);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [inventoryInputs, setInventoryInputs] = useState({});
    const [inventoryAction, setInventoryAction] = useState(null);
    const [isUpdatingInventory, setIsUpdatingInventory] = useState(false);
    const [inventoryError, setInventoryError] = useState("");

    const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Staff User";

    const handleInventoryInputChange = (variantId, field, value) => {
        setInventoryInputs((currentInputs) => ({
            ...currentInputs,
            [variantId]: {
                ...currentInputs[variantId],
                [field]: value,
            },
        }));
    };

    const handleOpenInventoryConfirmation = (type, variant) => {
        setInventoryError("");

        const rowInputs = inventoryInputs[variant.id] || {};
        const amount = Number(rowInputs.amount);
        const reference = rowInputs.reference?.trim();

        if (!amount || amount <= 0) {
            setInventoryError("Please enter a valid inventory amount.");
            return;
        }

        if (!reference) {
            setInventoryError("Please enter a reference before updating inventory.");
            return;
        }

        if (type === "decrease" && amount > variant.inventory) {
            setInventoryError("You cannot remove more inventory than currently available.");
            return;
        }

        setInventoryAction({
            type,
            variant,
            amount,
            reference,
        });
    };

    const handleConfirmInventoryUpdate = async () => {
        if (!inventoryAction || !selectedProduct) {
            return;
        }

        setIsUpdatingInventory(true);

        try {
            const { type, variant, amount } = inventoryAction;
            const multiplier = type === "increase" ? 1 : -1;

            const updatedProduct = {
                ...selectedProduct,
                variants: selectedProduct.variants.map((currentVariant) =>
                    currentVariant.id === variant.id
                        ? {
                            ...currentVariant,
                            inventory: currentVariant.inventory + amount * multiplier,
                        }
                        : currentVariant
                ),
            };

            updatedProduct.inventory = updatedProduct.variants.reduce(
                (total, currentVariant) => total + currentVariant.inventory,
                0
            );

            setSelectedProduct(updatedProduct);

            setProductList((currentProducts) =>
                currentProducts.map((product) =>
                    product.id === updatedProduct.id ? updatedProduct : product
                )
            );

            setInventoryInputs((currentInputs) => ({
                ...currentInputs,
                [variant.id]: {
                    amount: "",
                    reference: "",
                },
            }));

            setInventoryAction(null);
        } finally {
            setIsUpdatingInventory(false);
        }
    };

    return (
        <>
            <p className="mb-5 text-xl text-[#333333]">
                Welcome back, <span className="font-semibold">{fullName}.</span>
            </p>

            <div className="rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-3 text-xs text-gray-600">
                            Category
                            <select className="h-9 w-40 rounded-md border border-gray-300 bg-white px-3 text-xs outline-none focus:border-blue-500">
                                <option>All</option>
                                <option>Shirt</option>
                                <option>T Shirt</option>
                                <option>Trouser</option>
                            </select>
                        </label>

                        <label className="flex items-center gap-3 text-xs text-gray-600">
                            Brand
                            <select className="h-9 w-40 rounded-md border border-gray-300 bg-white px-3 text-xs outline-none focus:border-blue-500">
                                <option>All</option>
                                <option>Mio</option>
                                <option>CK</option>
                            </select>
                        </label>
                    </div>

                    <button
                        onClick={() => navigate("/products/create")}
                        className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                        + Add Product
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-y border-gray-100 text-gray-500">
                        <tr>
                            <th className="px-5 py-3 font-medium">Product Name</th>
                            <th className="px-5 py-3 font-medium">Description</th>
                            <th className="px-5 py-3 font-medium">Category</th>
                            <th className="px-5 py-3 font-medium">Brand</th>
                            <th className="px-5 py-3 font-medium">Inventory</th>
                            <th className="px-5 py-3 font-medium"></th>
                        </tr>
                        </thead>

                        <tbody>
                        {productList.map((product) => (
                            <tr
                                key={product.id}
                                className={`border-b border-gray-100 ${
                                    selectedProduct?.id === product.id ? "bg-blue-50" : ""
                                }`}
                            >
                                <td className="px-5 py-4 font-medium text-gray-900">
                                    {product.name}
                                </td>
                                <td className="px-5 py-4 text-gray-600">
                                    {product.description}
                                </td>
                                <td className="px-5 py-4 text-gray-600">
                                    {product.category}
                                </td>
                                <td className="px-5 py-4 text-gray-600">
                                    {product.brand}
                                </td>
                                <td className="px-5 py-4 text-gray-600">
                                    {product.inventory}
                                </td>
                                <td className="px-5 py-4">
                                    <button
                                        onClick={() => setSelectedProduct(product)}
                                        className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
                                    >
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-center gap-5 px-5 py-4 text-xs text-gray-600">
                    <button className="rounded-md border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
                        ← Previous
                    </button>
                    <span>Page 1 of 10</span>
                    <button className="rounded-md border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
                        Next →
                    </button>
                </div>
            </div>

            {selectedProduct && (
                <section className="mt-8">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Product Details
                            </h2>
                            <p className="mt-2 text-xs text-gray-500">
                                {selectedProduct.category} / {selectedProduct.brand} /{" "}
                                {selectedProduct.name}
                            </p>
                        </div>

                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:bg-white"
                        >
                            Clear Selection
                        </button>
                    </div>

                    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-gray-100 text-gray-500">
                            <tr>
                                <th className="px-5 py-3 font-medium">Color</th>
                                <th className="px-5 py-3 font-medium">Size</th>
                                <th className="px-5 py-3 font-medium">Inventory</th>
                                <th className="px-5 py-3 font-medium"></th>
                                <th className="px-5 py-3 font-medium"></th>
                                <th className="px-5 py-3 font-medium"></th>
                                <th className="px-5 py-3 font-medium"></th>
                            </tr>
                            </thead>

                            <tbody>
                            {selectedProduct.variants.map((variant) => (
                                <tr key={variant.id} className="border-b border-gray-100">
                                    <td className="px-5 py-4 text-gray-700">
                                        {variant.color}
                                    </td>
                                    <td className="px-5 py-4 text-gray-700">
                                        {variant.size}
                                    </td>
                                    <td className="px-5 py-4 text-gray-700">
                                        {variant.inventory}
                                    </td>
                                    <td className="px-5 py-4">
                                        <input
                                            type="number"
                                            placeholder="Enter Amount"
                                            min="1"
                                            value={inventoryInputs[variant.id]?.amount || ""}
                                            onChange={(event) =>
                                                handleInventoryInputChange(
                                                    variant.id,
                                                    "amount",
                                                    event.target.value
                                                )
                                            }
                                            className="h-8 w-28 rounded-md border border-gray-200 px-2 text-xs outline-none focus:border-blue-500"
                                        />
                                    </td>
                                    <td className="px-5 py-4">
                                        <input
                                            type="text"
                                            placeholder="Enter Reference"
                                            value={inventoryInputs[variant.id]?.reference || ""}
                                            onChange={(event) =>
                                                handleInventoryInputChange(
                                                    variant.id,
                                                    "reference",
                                                    event.target.value
                                                )
                                            }
                                            className="h-8 w-32 rounded-md border border-gray-200 px-2 text-xs outline-none focus:border-blue-500"
                                        />
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() =>
                                                handleOpenInventoryConfirmation("decrease", variant)
                                            }
                                            className="rounded-md bg-red-500 px-4 py-1.5 text-white hover:bg-red-600"
                                        >
                                            −
                                        </button>
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() =>
                                                handleOpenInventoryConfirmation("increase", variant)
                                            }
                                            className="rounded-md bg-emerald-600 px-8 py-1.5 text-white hover:bg-emerald-700"
                                        >
                                            +
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {inventoryError && (
                        <div className="mt-4 rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-800">{inventoryError}</div>
                        </div>
                    )}
                </section>
            )}
            <ConfirmationModal
                isOpen={!!inventoryAction}
                onCancel={() => setInventoryAction(null)}
                onConfirm={handleConfirmInventoryUpdate}
                isLoading={isUpdatingInventory}
            >
                Are you sure you want to{" "}
                {inventoryAction?.type === "increase" ? "add" : "remove"}{" "}
                {inventoryAction?.amount} units from {inventoryAction?.variant.color}{" "}
                {inventoryAction?.variant.size} variant?
            </ConfirmationModal>
        </>
    );
};

export default ProductDashboard;