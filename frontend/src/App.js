import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import CreateProduct from './components/products/CreateProduct';
import AddInventory from './components/products/AddInventory';
import AddCategory from './components/products/AddCategory';
import AddBrand from './components/products/AddBrand';
import AppLayout from './components/layout/AppLayout';
import {useAuth} from './context/AuthContext';

const ProtectedRoute = ({children}) => {
    const {user} = useAuth();

    if (!user) {
        return <Navigate to="/login" replace/>;
    }

    return children;
};

const ProtectedLayout = ({children}) => {
    return (
        <ProtectedRoute>
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
                        <ProtectedLayout>
                            <AddCategory/>
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/admin/brands"
                    element={
                        <ProtectedLayout>
                            <AddBrand/>
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
