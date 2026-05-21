import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import logo from '../assets/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-10">
      <img src={logo} alt="Clothing Inventory System" className="w-96 mb-8" />

      <div className="w-full max-w-4xl min-h-[560px] bg-white border
      border-gray-300 rounded shadow-sm flex justify-center items-start pt-24 pb-12">
        <form onSubmit={handleSubmit} className="w-full max-w-xl">
          <h1 className="text-3xl font-bold text-gray-900">Log In</h1>
          <p className="text-sm text-gray-500 mb-8">Welcome Back!</p>

          {error && (
            <div className="mb-4 rounded bg-red-100 border border-red-300 text-red-700 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4 relative">
            <Mail
              size={18}
              strokeWidth={1.8}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl bg-gray-50 border border-gray-100 py-4 pl-14 pr-5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-3 relative">
            <LockKeyhole
              size={18}
              strokeWidth={1.8}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />

            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl bg-gray-50 border border-gray-100 py-4 pl-14 pr-16 text-sm outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={1.8} />
              ) : (
                <Eye size={18} strokeWidth={1.8} />
              )}
            </button>
          </div>

          <div className="mb-8">
            <button type="button" className="text-xs text-gray-400 hover:text-blue-600">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gray-100 hover:bg-blue-700 hover:text-white transition py-4 font-semibold text-sm disabled:opacity-60"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="flex items-center gap-4 my-12">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-pink-600 font-semibold hover:underline">
              Register →
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
