import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import LandingPage from './pages/LandingPage';
import AppLayout from './components/layout/AppLayout';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <AppLayout>
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <LandingPage />
            </ProtectedLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedLayout>
              <Profile />
            </ProtectedLayout>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedLayout>
              <Tasks />
            </ProtectedLayout>
          }
        />

        <Route
          path="*"
          element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
