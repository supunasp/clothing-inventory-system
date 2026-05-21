import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
    const { user, logout } = useAuth();

    const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Staff User";

    const roleLabel = user?.role === "admin" ? "Admin" : "Staff";

    return (
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-8">
            <div className="flex items-center gap-5 text-sm">
                <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center text-base font-medium text-gray-900">
                    {fullName.charAt(0).toUpperCase()}
                </div>

                <span className="h-8 w-px bg-gray-200" />

                <span className="text-base font-medium text-gray-900">
                    {roleLabel}
                </span>

                <span className="h-8 w-px bg-gray-200" />

                <button
                    type="button"
                    onClick={logout}
                    className="flex h-9 w-9 items-center justify-center text-gray-900 transition hover:text-red-600"
                    title="Logout"
                    aria-label="Logout"
                >
                    <LogOut size={26} strokeWidth={1.8} />
                </button>
            </div>
        </header>
    );
};

export default Header;