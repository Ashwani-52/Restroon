// src/pages/dashboard/owner/SubscriptionPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import { CartoonButton } from '../../../components/ui/CartoonButton';

const PLANS = [
    {
        key: 'starter',
        name: 'Starter',
        price: 0,
        color: 'bg-yellow',
        icon: '🌱',
        features: ['1 Cafe listing', '50 Orders/month', 'Basic Menu builder', 'Email Support'],
        isPopular: false
    },
    {
        key: 'growth',
        name: 'Growth',
        price: 999,
        color: 'bg-orange',
        icon: '🚀',
        features: ['1 Cafe listing', 'Unlimited Orders', 'Menu + Photos', 'Revenue Analytics', 'Priority Support'],
        isPopular: true
    },
    {
        key: 'pro',
        name: 'Pro',
        price: 2499,
        color: 'bg-red',
        icon: '👑',
        features: ['3 Cafe listings', 'Everything in Growth', 'Custom Domain', 'Dedicated Support'],
        isPopular: false
    }
];

export default function SubscriptionPage() {
    const [current, setCurrent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paying, setPaying] = useState(null); // which plan is being paid
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/subscription').then(r => setCurrent(r.data.subscription));
    }, []);

    const loadRazorpay = () => new Promise(resolve => {
        if (window.Razorpay) { resolve(true); return; }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

    const handleSelect = async (plan) => {
        setPaying(plan.key);
        try {
            const res = await api.post('/api/subscription/create', { plan: plan.key });

            if (res.data.free) {
                setCurrent({ plan: 'starter', status: 'active' });
                alert('✅ Starter plan activated!');
                navigate('/dashboard/owner');
                return;
            }

            // ─── Load Razorpay ──────────────────────
            const loaded = await loadRazorpay();
            if (!loaded) { alert('Failed to load payment. Check internet.'); return; }

            const options = {
                key: res.data.keyId,
                amount: res.data.amount,
                currency: 'INR',
                name: 'Restroon',
                description: `${plan.name} Plan — Monthly Subscription`,
                order_id: res.data.razorpayOrderId,
                theme: { color: '#FFD23F' },
                modal: { ondismiss: () => setPaying(null) },
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post('/api/subscription/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: plan.key
                        });
                        setCurrent(verifyRes.data.subscription);
                        alert(`✅ ${plan.name} plan activated!`);
                        navigate('/dashboard/owner');
                    } catch {
                        alert('Payment done but activation failed. Contact support.');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                alert('Payment failed. Please try again.');
                setPaying(null);
            });
            rzp.open();

        } catch (err) {
            alert(err.response?.data?.message || 'Something went wrong');
        } finally {
            setPaying(null);
        }
    };

    return (
        <div className="min-h-screen retro-grid py-16 px-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="font-bangers text-6xl text-ink mb-3">
                        CHOOSE YOUR <span className="text-orange">PLAN</span> 💰
                    </h1>
                    <p className="font-grotesk text-xl text-ink/70">
                        Subscription payment goes directly to Restroon platform.
                    </p>

                    {/* Current plan badge */}
                    {current && (
                        <div className="inline-flex items-center gap-2 bg-green-100 border-2 border-green-500 rounded-full px-4 py-2 mt-4">
                            <span className="text-green-600 font-bangers">✅ Current: {current.plan?.toUpperCase()} — {current.status?.toUpperCase()}</span>
                        </div>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.key}
                            className={`
                                ${plan.color} border-4 border-ink rounded-3xl p-8 relative flex flex-col
                                shadow-[8px_8px_0_#1A1A1A]
                                ${plan.isPopular ? 'md:scale-105 z-10 shadow-[10px_10px_0_#1A1A1A]' : 'z-0'}
                                ${current?.plan === plan.key ? 'ring-4 ring-green-400' : ''}
                            `}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            {/* Popular Badge */}
                            {plan.isPopular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-ink text-yellow border-3 border-ink rounded-full px-4 py-1 z-20">
                                    <span className="font-bangers text-lg">⭐ POPULAR</span>
                                </div>
                            )}

                            {/* Current badge */}
                            {current?.plan === plan.key && (
                                <div className="absolute -top-5 right-4 bg-green-400 text-ink border-2 border-ink rounded-full px-3 py-1 z-20">
                                    <span className="font-bangers text-sm">✅ ACTIVE</span>
                                </div>
                            )}

                            <div className="text-5xl mb-3">{plan.icon}</div>
                            <h3 className="font-bangers text-3xl text-ink mb-1">{plan.name}</h3>

                            <div className="font-bangers text-5xl text-ink mb-1">
                                {plan.price === 0 ? 'FREE' : `₹${plan.price}`}
                            </div>
                            {plan.price > 0 && (
                                <p className="font-mono text-sm text-ink/60 mb-4">/month</p>
                            )}

                            <div className="border-t-2 border-ink/20 my-4" />

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map(f => (
                                    <li key={f} className="flex items-start gap-3 font-grotesk text-sm text-ink font-medium">
                                        <span className="w-5 h-5 bg-ink text-cream rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto flex justify-center w-full">
                                {current?.plan === plan.key && current?.status === 'active' ? (
                                    <div className="w-full py-3 bg-green-400 border-3 border-ink rounded-2xl text-center font-bangers text-ink text-lg">
                                        ✅ Current Plan
                                    </div>
                                ) : (
                                    <CartoonButton
                                        label={paying === plan.key ? '⏳ Processing...' : plan.price === 0 ? '🌱 Start Free' : `💳 Get ${plan.name}`}
                                        color="bg-cream"
                                        size="md"
                                        disabled={paying !== null}
                                        onClick={() => handleSelect(plan)}
                                    />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Security note */}
                <div className="mt-8 bg-ink border-3 border-ink rounded-2xl p-4 flex gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                        <p className="font-bangers text-yellow text-lg">SECURE PAYMENT</p>
                        <p className="font-grotesk text-cream/70 text-sm">
                            Subscription payments are processed by Razorpay and go directly to the Restroon platform account.
                            Your cafe will be activated immediately after payment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}