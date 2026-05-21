import logo from "../../assets/logo.png";

const SideMenu = () => {
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
                <button className="w-full rounded-md bg-gray-100 px-3 py-3 text-left font-medium text-gray-900">
                    Dashboard
                </button>

                <button className="w-full rounded-md px-3 py-3 text-left text-gray-700 hover:bg-gray-100">
                    Product Management
                </button>

                <button className="w-full rounded-md px-3 py-3 text-left text-gray-700 hover:bg-gray-100">
                    Inventory Management
                </button>
            </nav>
        </aside>
    );
};

export default SideMenu;