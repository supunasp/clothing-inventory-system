import Header from "./Header";
import SideMenu from "./SideMenu";

const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[var(--app-background)] text-[var(--app-text-primary)]">
            <SideMenu />

            <main className="ml-60 min-h-screen">
                <Header />

                <div className="px-8 py-5">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AppLayout;