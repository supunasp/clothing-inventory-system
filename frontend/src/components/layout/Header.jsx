import { useAuth } from "../../context/AuthContext";

const Header = () => {
    const { user, logout } = useAuth();

    const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Staff User";

    return (
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-8">
            <div className="flex items-center gap-4 text-sm">
                <div className="h-7 w-7 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-semibold">
                    {fullName.charAt(0).toUpperCase()}
                </div>

                <span>Staff</span>

                <button
                    onClick={logout}
                    className="text-gray-500 hover:text-red-600"
                    title="Logout"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;