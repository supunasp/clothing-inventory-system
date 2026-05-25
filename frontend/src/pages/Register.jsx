import {useState} from 'react';
import { Check, Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import {useAuth} from '../context/AuthContext';
import logo from '../assets/logo.png';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const [agree, setAgree] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {login} = useAuth();
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

        if (!agree) {
            setError('Please agree to the Terms & Privacy Policy.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
            };

            const response = await axiosInstance.post('/api/auth/register', payload);
            login(response.data);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-10">
            <img src={logo} alt="Clothing Inventory System" className="w-72 mb-8"/>

            <div
                className="w-full max-w-4xl min-h-[560px] bg-white border border-gray-300 rounded shadow-sm flex justify-center items-start pt-14">
                <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                    <h1 className="text-3xl font-bold text-gray-900">Register Account</h1>
                    <p className="text-sm text-gray-500 mb-8">Join Clothing Inventory System</p>

                    {error && (
                        <div className="mb-4 rounded bg-red-100 border border-red-300 text-red-700 px-4 py-2 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                            <User
                                size={18}
                                strokeWidth={1.8}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                                aria-hidden="true"
                            />

                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl bg-gray-50 border border-gray-100 py-4 pl-14 pr-5 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="relative">
                            <User
                                size={18}
                                strokeWidth={1.8}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                                aria-hidden="true"
                            />

                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl bg-gray-50 border border-gray-100 py-4 pl-14 pr-5 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

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
                            placeholder="Your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl bg-gray-50 border border-gray-100 py-4 pl-14 pr-5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-5 relative">
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
                            minLength={6}
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

                    <label className="flex items-center gap-2 text-xs text-gray-500 mb-8 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                            className="sr-only"
                        />

                        <span
                            className={`flex h-4 w-4 items-center justify-center rounded border ${
                                agree
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-gray-300 bg-white text-transparent'
                            }`}
                        >
                            <Check size={12} strokeWidth={3} />
                        </span>

                        <span>
                            I agree to the{' '}
                            <span className="text-blue-700 font-semibold">
                                Terms &amp; Privacy Policy
                            </span>
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gray-100 hover:bg-blue-700 hover:text-white transition py-4 font-semibold text-sm disabled:opacity-60"
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-pink-600 font-semibold hover:underline">
                            Login →
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
