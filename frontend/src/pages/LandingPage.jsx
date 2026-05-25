import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import ProductDashboard from "./ProductDashboard";

const LandingPage = () => {
    const { user } = useAuth();

    if (user?.role === "admin") {
        return <AdminDashboard />;
    }

    return <ProductDashboard />;
};

export default LandingPage;