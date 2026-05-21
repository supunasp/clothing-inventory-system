import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

const SideMenu = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const isAdmin = user?.role === "admin";

    const menuItems = isAdmin
        ? [
            { label: "Dashboard", path: "/dashboard" },
            { label: "Category Management", path: "/admin/categories" },
            { label: "Brand Management", path: "/admin/brands" },
            { label: "User Management", path: "/admin/users" },
        ]
        : [
            { label: "Dashboard", path: "/dashboard" },
            { label: "Product Management", path: "/dashboard" },
            { label: "Inventory Management", path: "/inventory/add" },
        ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200">
            <div className="px-4 py-8">
                <img
                    src={logo}
                    alt="Clothing Inventory System"
                    className="w-40"
                />
            </div>

            <nav className="mt-4 space-y-1 px-3 text-sm">
                {menuItems.map((item, index) => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => navigate(item.path)}
                        className={`w-full rounded-md px-3 py-3 text-left ${
                            index === 0
                                ? "bg-gray-100 font-medium text-gray-900"
                                : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default SideMenu;