import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Terms from './pages/Terms';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import CreateProduct from './pages/CreateProduct';
import AddInventory from './pages/AddInventory';
import AddCategory from './pages/AddCategory';
import AddBrand from './pages/AddBrand';
import UserManagement from "./pages/UserManagement";
import InventoryAuditList from "./pages/InventoryAuditList";
import AdminProductDetails from "./pages/AdminProductDetails";
import AppLayout from './components/layout/AppLayout';
import {useAuth} from './context/AuthContext';
import {ROLE_ADMIN} from './constants';

const ProtectedRoute = ({children, adminOnly = false}) => {
    const {user} = useAuth();

    if (!user) {
        return <Navigate to="/login" replace/>;
    }

    if (adminOnly && user.role !== ROLE_ADMIN) {
        return <Navigate to="/dashboard" replace/>;
    }

    return children;
};

const ProtectedLayout = ({children, adminOnly = false}) => {
    return (
        <ProtectedRoute adminOnly={adminOnly}>
            <AppLayout>
                {children}
            </AppLayout>
        </ProtectedRoute>
    );
};

function App() {
    const {user} = useAuth();

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={user ? <Navigate to="/dashboard" replace/> : <Navigate to="/login" replace/>}
                />

                <Route
                    path="/login"
                    element={user ? <Navigate to="/dashboard" replace/> : <Login/>}
                />

                <Route
                    path="/register"
                    element={user ? <Navigate to="/dashboard" replace/> : <Register/>}
                />

                <Route path="/terms" element={<Terms/>}/>

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedLayout>
                            <LandingPage/>
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/products/create"
                    element={
                        <ProtectedLayout>
                            <CreateProduct/>
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/inventory/add"
                    element={
                        <ProtectedLayout>
                            <AddInventory/>
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/admin/categories"
                    element={
                        <ProtectedLayout adminOnly>
                            <AddCategory/>
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/admin/brands"
                    element={
                        <ProtectedLayout adminOnly>
                            <AddBrand/>
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedLayout adminOnly>
                            <UserManagement/>
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/admin/inventory"
                    element={
                        <ProtectedLayout adminOnly>
                            <InventoryAuditList/>
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/admin/products/:productId"
                    element={
                        <ProtectedLayout adminOnly>
                            <AdminProductDetails/>
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedLayout>
                            <Profile/>
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="*"
                    element={user ? <Navigate to="/dashboard" replace/> : <Navigate to="/login" replace/>}
                />
            </Routes>
        </Router>
    );
}

export default App;
