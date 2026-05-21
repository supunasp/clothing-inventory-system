import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/products/AdminDashboard";
import ProductDashboard from "../components/products/ProductDashboard";

const LandingPage = () => {
    const { user } = useAuth();

    if (user?.role === "admin") {
        return <AdminDashboard />;
    }

    return <ProductDashboard />;
};

export default LandingPage;