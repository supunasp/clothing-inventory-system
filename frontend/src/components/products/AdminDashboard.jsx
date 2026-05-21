import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const products = [
    {
        id: 1,
        name: "Office Shirt",
        description: "Plain color shirt long sleeves",
        category: "Shirt",
        brand: "UniQlo",
        inventory: 10,
    },
    {
        id: 2,
        name: "Hiking TShirt",
        description: "Cooling Edition",
        category: "T Shirt",
        brand: "Nike",
        inventory: 0,
    },
    {
        id: 3,
        name: "Denim",
        description: "For Hard Work",
        category: "Trouser",
        brand: "CK",
        inventory: 12,
    },
];

const categories = [
    { id: "CAT1", name: "Shirt" },
    { id: "CAT2", name: "T Shirt" },
    { id: "CAT3", name: "Trouser" },
];

const brands = [
    { id: "B1", name: "Nike" },
    { id: "B2", name: "UniQlo" },
    { id: "B3", name: "CK" },
];

const StatCard = ({ icon, title, value }) => {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg">
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500">{title}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin User";

    return (
        <>
            <p className="mb-4 text-xl text-[#333333]">
                Welcome back, <span className="font-semibold">{fullName}.</span>
            </p>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <StatCard icon="▦" title="Total Products" value="1,199" />
                <StatCard icon="⊕" title="Total Categories" value="12" />
                <StatCard icon="Label" title="Total Brands" value="5" />
                <StatCard icon="♙" title="Total Users" value="2" />
            </div>

            <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-wrap gap-8 px-5 py-4">
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
                            <option>Nike</option>
                            <option>UniQlo</option>
                            <option>CK</option>
                        </select>
                    </label>
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
                        {products.map((product) => (
                            <tr key={product.id} className="border-b border-gray-100">
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
                                    <button className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">
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
            </section>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4">
                        <h2 className="text-sm font-medium text-gray-900">Category</h2>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/categories")}
                            className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                            + Add Category
                        </button>
                    </div>

                    <table className="w-full text-left text-xs">
                        <thead className="border-y border-gray-100 text-gray-500">
                        <tr>
                            <th className="px-5 py-3 font-medium">ID</th>
                            <th className="px-5 py-3 font-medium">Name</th>
                            <th className="px-5 py-3 font-medium"></th>
                        </tr>
                        </thead>

                        <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="border-b border-gray-100">
                                <td className="px-5 py-4 font-medium text-gray-900">
                                    {category.id}
                                </td>
                                <td className="px-5 py-4 text-gray-600">
                                    {category.name}
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <button className="rounded-full px-3 py-1 text-gray-500 hover:bg-gray-100">
                                        ⋯
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="flex items-center justify-center gap-5 px-5 py-4 text-xs text-gray-600">
                        <button className="rounded-md border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
                            ← Previous
                        </button>
                        <span>Page 1 of 10</span>
                    </div>
                </section>

                <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4">
                        <h2 className="text-sm font-medium text-gray-900">Brand</h2>
                        <button className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700">
                            + Add Brand
                        </button>
                    </div>

                    <table className="w-full text-left text-xs">
                        <thead className="border-y border-gray-100 text-gray-500">
                        <tr>
                            <th className="px-5 py-3 font-medium">ID</th>
                            <th className="px-5 py-3 font-medium">Name</th>
                            <th className="px-5 py-3 font-medium"></th>
                        </tr>
                        </thead>

                        <tbody>
                        {brands.map((brand) => (
                            <tr key={brand.id} className="border-b border-gray-100">
                                <td className="px-5 py-4 font-medium text-gray-900">
                                    {brand.id}
                                </td>
                                <td className="px-5 py-4 text-gray-600">
                                    {brand.name}
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <button className="rounded-full px-3 py-1 text-gray-500 hover:bg-gray-100">
                                        ⋯
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="flex items-center justify-center gap-5 px-5 py-4 text-xs text-gray-600">
                        <button className="rounded-md border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
                            ← Previous
                        </button>
                        <span>Page 1 of 10</span>
                    </div>
                </section>
            </div>
        </>
    );
};

export default AdminDashboard;