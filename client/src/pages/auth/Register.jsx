// src/pages/auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { CartoonButton } from '../../components/ui/CartoonButton';

export default function Register() {
    const [params] = useSearchParams();
    const defaultRole = params.get('role') || 'customer';

    const [step, setStep] = useState(1);
    const [role, setRole] = useState(defaultRole);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    // ─── Reset form when role changes ──────────
    const handleRoleSelect = (newRole) => {
        setRole(newRole);
        setForm({ name: '', email: '', password: '', phone: '' });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await register({ ...form, role });
            if (user.role === 'owner') navigate('/dashboard/owner/setup');
            else navigate('/cafes');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Pass role as state param so backend callback can assign the correct role
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google?role=${role}`;
    };

    return (
        <div className="min-h-screen retro-grid flex items-center justify-center px-4 py-12">
            <div className="fixed top-0 left-0 right-0 h-3 stripe-bg z-50" />

            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Link to="/" className="flex items-center justify-center gap-3 mb-8">
                    <span className="text-4xl">🛵</span>
                    <span className="font-bangers text-4xl tracking-wider text-ink">RESTROON</span>
                </Link>

                <div className="bg-cream border-4 border-ink rounded-3xl p-8 shadow-[10px_10px_0_#1A1A1A]">
                    <AnimatePresence mode="wait">

                        {/* ── Step 1 — Choose Role ── */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h1 className="font-bangers text-4xl text-ink text-center mb-2">JOIN RESTROON</h1>
                                <p className="font-grotesk text-center text-ink/70 mb-8">Who are you?</p>

                                {/* Role Cards */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {[
                                        { value: 'customer', icon: '🍽️', label: 'Customer', desc: 'Order food' },
                                        { value: 'owner', icon: '🏪', label: 'Cafe Owner', desc: 'List my cafe' }
                                    ].map(({ value, icon, label, desc }) => (
                                        <button
                                            key={value}
                                            onClick={() => handleRoleSelect(value)}
                                            className={`
                        p-6 rounded-2xl border-3 transition-all duration-150 text-center
                        ${role === value
                                                    ? 'bg-yellow border-ink shadow-[4px_4px_0_#1A1A1A] -translate-y-1'
                                                    : 'bg-white border-ink/30 hover:border-ink hover:bg-yellow/20'
                                                }
                      `}
                                        >
                                            <div className="text-4xl mb-2">{icon}</div>
                                            <div className="font-bangers text-xl text-ink">{label}</div>
                                            <div className="font-grotesk text-xs text-ink/60 mt-1">{desc}</div>
                                        </button>
                                    ))}
                                </div>

                                {/* Google Sign Up */}
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-3 border-ink rounded-2xl shadow-[4px_4px_0_#1A1A1A] hover:-translate-y-1 hover:shadow-[6px_6px_0_#1A1A1A] transition-all duration-150 mb-4"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 64 64">
                                        <g fillRule="evenodd" fill="none" transform="translate(3,2)">
                                            <path fill="#4285F4" d="M57.8,30.1c0-2.4-0.2-4.2-0.6-6H29.5v10.9h16.3c-0.3,2.7-2.1,6.8-6,9.6l-0.1,0.4l8.8,6.8l0.6,0.1C54.6,46.7,57.8,39.1,57.8,30.1z" />
                                            <path fill="#34A853" d="M29.5,59c7.9,0,14.6-2.6,19.5-7.1L39.7,44.6c-2.5,1.7-5.8,2.9-10.2,2.9c-7.8,0-14.4-5.1-16.8-12.2l-0.4,0l-9.1,7l-0.1,0.3C7.9,52.4,17.9,59,29.5,59z" />
                                            <path fill="#FBBC05" d="M12.7,35.3c-0.6-1.8-1-3.8-1-5.8s0.4-4,1-5.8l0-0.3L3.4,16.1l-0.3,0.1C1.1,20.3,0,24.7,0,29.5s1.1,9.2,3.1,13.2L12.7,35.3z" />
                                            <path fill="#EB4335" d="M29.5,11.4c5.5,0,9.3,2.4,11.4,4.4l8.3-8.1C44.1,2.9,37.5,0,29.5,0C17.9,0,7.9,6.6,3.1,16.3l9.6,7.4C15.1,16.6,21.7,11.4,29.5,11.4z" />
                                        </g>
                                    </svg>
                                    <span className="font-grotesk font-semibold text-ink">
                                        Sign up as {role === 'owner' ? 'Cafe Owner' : 'Customer'} with Google
                                    </span>
                                </button>

                                {/* Divider */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 h-0.5 bg-ink/20" />
                                    <span className="font-mono text-xs text-ink/50">OR WITH EMAIL</span>
                                    <div className="flex-1 h-0.5 bg-ink/20" />
                                </div>

                                <CartoonButton
                                    label={`Continue with Email →`}
                                    color="bg-yellow"
                                    size="lg"
                                    onClick={() => setStep(2)}
                                />
                            </motion.div>
                        )}

                        {/* ── Step 2 — Fill Details ── */}
                        {step === 2 && (
                            <motion.div
                                key={`step2-${role}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <button
                                    onClick={() => { setStep(1); setError(''); }}
                                    className="font-grotesk text-sm text-ink/60 hover:text-ink mb-4 flex items-center gap-1"
                                >
                                    ← Back
                                </button>

                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-3xl">{role === 'owner' ? '🏪' : '🍽️'}</span>
                                    <h1 className="font-bangers text-4xl text-ink">
                                        {role === 'owner' ? 'CAFE OWNER' : 'CUSTOMER'}
                                    </h1>
                                </div>
                                <p className="font-grotesk text-ink/70 mb-6">Create your account</p>

                                {error && (
                                    <div className="bg-red/10 border-2 border-red rounded-xl p-3 mb-4">
                                        <p className="font-grotesk text-sm text-red">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {[
                                        { name: 'name', type: 'text', placeholder: 'Full Name', icon: '👤' },
                                        { name: 'email', type: 'email', placeholder: 'Email Address', icon: '📧' },
                                        { name: 'phone', type: 'tel', placeholder: 'Phone (optional)', icon: '📱' },
                                        { name: 'password', type: 'password', placeholder: 'Password (8+ chars)', icon: '🔒' }
                                    ].map(({ name, type, placeholder, icon }) => (
                                        <div key={`${role}-${name}`} className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">{icon}</span>
                                            <input
                                                type={type}
                                                placeholder={placeholder}
                                                value={form[name]}
                                                onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                                                required={name !== 'phone'}
                                                minLength={name === 'password' ? 8 : undefined}
                                                autoComplete="new-password"
                                                className="w-full pl-12 pr-4 py-3 bg-white border-3 border-ink rounded-xl font-grotesk focus:outline-none focus:border-orange shadow-[2px_2px_0_#1A1A1A] transition-all"
                                            />
                                        </div>
                                    ))}

                                    <CartoonButton
                                        type="submit"
                                        label={loading ? '⏳ Creating...' : '🚀 Create Account'}
                                        color="bg-yellow"
                                        size="lg"
                                        disabled={loading}
                                    />
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p className="font-grotesk text-center text-sm text-ink/60 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-orange hover:underline">Login</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
