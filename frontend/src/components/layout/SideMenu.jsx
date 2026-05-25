import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

const SideMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const isAdmin = user?.role === "admin";

    const menuItems = isAdmin
        ? [
            { label: "Dashboard", path: "/dashboard", activePaths: ["/dashboard"] },
            { label: "Category Management", path: "/admin/categories", activePaths: ["/admin/categories"] },
            { label: "Brand Management", path: "/admin/brands", activePaths: ["/admin/brands"] },
            { label: "Inventory Management", path: "/admin/inventory", activePaths: ["/admin/inventory"] },
            { label: "User Management", path: "/admin/users", activePaths: ["/admin/users"] },
        ]
        : [
            { label: "Dashboard", path: "/dashboard", activePaths: ["/dashboard"] },
            { label: "Product Management", path: "/products/create", activePaths: ["/products/create"] },
            { label: "Inventory Management", path: "/inventory/add", activePaths: ["/inventory/add"] },
        ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-60 bg-[var(--app-surface)] border-r border-[var(--app-border)]">
            <div className="flex h-28 items-center px-6">
                <img
                    src={logo}
                    alt="Clothing Inventory System"
                    className="w-40"
                />
            </div>

            <nav className="border-t border-[var(--app-border)] text-sm">
                {menuItems.map((item) => {
                    const isActive = item.activePaths.some((path) =>
                        location.pathname === path || location.pathname.startsWith(`${path}/`)
                    );

                    return (
                        <button
                            key={item.label}
                            type="button"
                            onClick={() => navigate(item.path)}
                            className={`block h-16 w-full px-6 text-left text-base transition ${
                                isActive
                                    ? "bg-[var(--app-background)] font-semibold text-[var(--app-text-primary)]"
                                    : "bg-[var(--app-surface)] font-medium text-[var(--app-text-secondary)] hover:bg-[var(--app-background)] hover:text-[var(--app-text-primary)]"
                            }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default SideMenu;