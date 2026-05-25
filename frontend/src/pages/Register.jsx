import {useState} from 'react';
import { Check, Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import {useAuth} from '../context/AuthContext';
import logo from '../assets/logo.png';

const PASSWORD_RULES_MESSAGE =
    'Password must be at least 8 characters and include at least one letter and one digit.';

const isPasswordValid = (pwd) =>
    typeof pwd === 'string' && pwd.length >= 8 && /[A-Za-z]/.test(pwd) && /\d/.test(pwd);

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
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

        if (!isPasswordValid(formData.password)) {
            setError(PASSWORD_RULES_MESSAGE);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
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
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-4">
            <img src={logo} alt="Clothing Inventory System" className="w-56 mb-4"/>

            <div
                className="w-full max-w-4xl bg-white border border-gray-300 rounded shadow-sm flex justify-center items-start py-6">
                <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                    <h1 className="text-2xl font-bold text-gray-900">Register Account</h1>
                    <p className="text-xs text-gray-500 mb-5">Join Clothing Inventory System</p>

                    {error && (
                        <div className="mb-4 rounded bg-red-100 border border-red-300 text-red-700 px-4 py-2 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
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
                                className="w-full rounded-xl bg-gray-50 border border-gray-100 py-3 pl-14 pr-5 text-sm outline-none focus:border-blue-500"
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
                                className="w-full rounded-xl bg-gray-50 border border-gray-100 py-3 pl-14 pr-5 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mb-3 relative">
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
                            className="w-full rounded-xl bg-gray-50 border border-gray-100 py-3 pl-14 pr-5 text-sm outline-none focus:border-blue-500"
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
                            minLength={8}
                            className="w-full rounded-xl bg-gray-50 border border-gray-100 py-3 pl-14 pr-16 text-sm outline-none focus:border-blue-500"
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

                    <div className="mb-2 relative">
                        <LockKeyhole
                            size={18}
                            strokeWidth={1.8}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                            aria-hidden="true"
                        />

                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={8}
                            className="w-full rounded-xl bg-gray-50 border border-gray-100 py-3 pl-14 pr-16 text-sm outline-none focus:border-blue-500"
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

                    <p className="mb-4 text-[11px] text-gray-400">
                        {PASSWORD_RULES_MESSAGE}
                    </p>

                    <label className="flex items-center gap-2 text-xs text-gray-500 mb-5 cursor-pointer">
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
                            <Link
                                to="/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 font-semibold hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Terms &amp; Privacy Policy
                            </Link>
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gray-100 hover:bg-blue-700 hover:text-white transition py-3 font-semibold text-sm disabled:opacity-60"
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>

                    <div className="flex items-center gap-4 my-5">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <p className="text-center text-sm text-gray-500">
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
