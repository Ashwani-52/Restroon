// src/pages/auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { CartoonButton } from '../../components/ui/CartoonButton';
import api from '../../services/api';

export default function Register() {
    const [params] = useSearchParams();
    const defaultRole = params.get('role') || 'customer';

    const [step, setStep] = useState(1);
    const [role, setRole] = useState(defaultRole);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // ─── Delivery partner invite flow state ──
    const [inviteCode, setInviteCode] = useState('');
    const [inviteVerified, setInviteVerified] = useState(false);
    const [inviteData, setInviteData] = useState(null); // { email, cafeId, cafeName }
    const [verifying, setVerifying] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    // ─── Reset form when role changes ──────────
    const handleRoleSelect = (newRole) => {
        setRole(newRole);
        setForm({ name: '', email: '', password: '', phone: '' });
        setError('');
        setInviteCode('');
        setInviteVerified(false);
        setInviteData(null);
    };

    // ─── Verify invite code ────────────────────
    const handleVerifyInvite = async () => {
        if (!inviteCode.trim()) return setError('Please enter your invite code');
        setError('');
        setVerifying(true);
        try {
            const res = await api.post('/api/auth/verify-invite', { code: inviteCode.trim() });
            if (res.data.valid) {
                setInviteVerified(true);
                setInviteData({
                    email: res.data.email,
                    cafeId: res.data.cafeId,
                    cafeName: res.data.cafeName
                });
                // Pre-fill email if invite had one
                if (res.data.email) {
                    setForm(f => ({ ...f, email: res.data.email }));
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired invite code');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = { ...form, role };
            // Attach invite code for delivery partner
            if (role === 'delivery_partner') {
                payload.inviteCode = inviteCode.trim();
            }
            const user = await register(payload);
            if (user.role === 'owner') navigate('/dashboard/owner/setup');
            else if (user.role === 'delivery_partner') navigate('/delivery/dashboard');
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

    // Helper for role display
    const roleDisplay = {
        customer: { icon: '🍽️', label: 'CUSTOMER' },
        owner: { icon: '🏪', label: 'CAFE OWNER' },
        delivery_partner: { icon: '🛵', label: 'DELIVERY PARTNER' }
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

                                {/* Role Cards — 3 tiles */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {[
                                        { value: 'customer', icon: '🍽️', label: 'Customer', desc: 'Order food' },
                                        { value: 'owner', icon: '🏪', label: 'Cafe Owner', desc: 'List my cafe' },
                                        { value: 'delivery_partner', icon: '🛵', label: 'Delivery', desc: 'Deliver orders' }
                                    ].map(({ value, icon, label, desc }) => (
                                        <button
                                            key={value}
                                            onClick={() => handleRoleSelect(value)}
                                            className={`
                        p-4 rounded-2xl border-3 transition-all duration-150 text-center
                        ${role === value
                                                    ? 'bg-yellow border-ink shadow-[4px_4px_0_#1A1A1A] -translate-y-1'
                                                    : 'bg-white border-ink/30 hover:border-ink hover:bg-yellow/20'
                                                }
                      `}
                                        >
                                            <div className="text-3xl mb-1">{icon}</div>
                                            <div className="font-bangers text-sm text-ink leading-tight">{label}</div>
                                            <div className="font-grotesk text-[10px] text-ink/60 mt-1">{desc}</div>
                                        </button>
                                    ))}
                                </div>

                                {/* Google Sign Up — not for delivery partners */}
                                {role !== 'delivery_partner' && (
                                    <>
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
                                    </>
                                )}

                                <CartoonButton
                                    label={role === 'delivery_partner' ? `Enter Invite Code →` : `Continue with Email →`}
                                    color="bg-yellow"
                                    size="lg"
                                    onClick={() => setStep(2)}
                                />
                            </motion.div>
                        )}

                        {/* ── Step 2 — Fill Details (or Invite Code for delivery) ── */}
                        {step === 2 && (
                            <motion.div
                                key={`step2-${role}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <button
                                    onClick={() => { setStep(1); setError(''); setInviteVerified(false); }}
                                    className="font-grotesk text-sm text-ink/60 hover:text-ink mb-4 flex items-center gap-1"
                                >
                                    ← Back
                                </button>

                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-3xl">{roleDisplay[role]?.icon}</span>
                                    <h1 className="font-bangers text-3xl text-ink">
                                        {roleDisplay[role]?.label}
                                    </h1>
                                </div>

                                {/* ── DELIVERY PARTNER: Invite Code Flow ── */}
                                {role === 'delivery_partner' && !inviteVerified && (
                                    <>
                                        <p className="font-grotesk text-ink/70 mb-6">
                                            🔐 You need an invite to join as a Delivery Partner.
                                        </p>

                                        {error && (
                                            <div className="bg-red/10 border-2 border-red rounded-xl p-3 mb-4">
                                                <p className="font-grotesk text-sm text-red">{error}</p>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔑</span>
                                                <input
                                                    type="text"
                                                    placeholder="Enter invite code (e.g. AB12CD34)"
                                                    value={inviteCode}
                                                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                                                    maxLength={8}
                                                    className="w-full pl-12 pr-4 py-3 bg-white border-3 border-ink rounded-xl font-mono text-lg tracking-widest text-center focus:outline-none focus:border-orange shadow-[2px_2px_0_#1A1A1A] transition-all uppercase"
                                                />
                                            </div>

                                            <CartoonButton
                                                label={verifying ? '⏳ Verifying...' : '🔍 Verify Invite Code'}
                                                color="bg-yellow"
                                                size="lg"
                                                onClick={handleVerifyInvite}
                                                disabled={verifying || !inviteCode.trim()}
                                            />
                                        </div>

                                        <p className="font-grotesk text-center text-xs text-ink/40 mt-4">
                                            Ask your cafe owner for the invite code
                                        </p>
                                    </>
                                )}

                                {/* ── DELIVERY PARTNER: Invite Verified → Show Form ── */}
                                {role === 'delivery_partner' && inviteVerified && (
                                    <>
                                        {/* Success banner */}
                                        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-3 mb-4 flex items-center gap-2">
                                            <span className="text-xl">✅</span>
                                            <div>
                                                <p className="font-grotesk text-sm font-semibold text-green-800">
                                                    Invite verified!
                                                </p>
                                                <p className="font-grotesk text-xs text-green-700">
                                                    Joining <strong>{inviteData?.cafeName}</strong> as delivery partner
                                                </p>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="bg-red/10 border-2 border-red rounded-xl p-3 mb-4">
                                                <p className="font-grotesk text-sm text-red">{error}</p>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {[
                                                { name: 'name', type: 'text', placeholder: 'Full Name', icon: '👤', readOnly: false },
                                                { name: 'email', type: 'email', placeholder: 'Email Address', icon: '📧', readOnly: !!inviteData?.email },
                                                { name: 'phone', type: 'tel', placeholder: 'Phone Number', icon: '📱', readOnly: false },
                                                { name: 'password', type: 'password', placeholder: 'Password (8+ chars)', icon: '🔒', readOnly: false }
                                            ].map(({ name, type, placeholder, icon, readOnly }) => (
                                                <div key={`dp-${name}`} className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">{icon}</span>
                                                    <input
                                                        type={type}
                                                        placeholder={placeholder}
                                                        value={form[name]}
                                                        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                                                        required={name !== 'phone'}
                                                        readOnly={readOnly}
                                                        minLength={name === 'password' ? 8 : undefined}
                                                        autoComplete="new-password"
                                                        className={`w-full pl-12 pr-4 py-3 bg-white border-3 border-ink rounded-xl font-grotesk focus:outline-none focus:border-orange shadow-[2px_2px_0_#1A1A1A] transition-all ${readOnly ? 'bg-gray-100 text-ink/60' : ''}`}
                                                    />
                                                </div>
                                            ))}

                                            <CartoonButton
                                                type="submit"
                                                label={loading ? '⏳ Creating...' : '🛵 Join as Delivery Partner'}
                                                color="bg-yellow"
                                                size="lg"
                                                disabled={loading}
                                            />
                                        </form>
                                    </>
                                )}

                                {/* ── CUSTOMER / OWNER: Normal form ── */}
                                {role !== 'delivery_partner' && (
                                    <>
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
                                    </>
                                )}
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
