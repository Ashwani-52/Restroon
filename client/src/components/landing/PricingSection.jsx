import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const plans = [
    {
        id: 'trial',
        label: '🎯 1 DAY TRIAL',
        badge: 'TRY FREE',
        badgeColor: '#16a34a',
        price: { amount: 0, display: 'FREE', period: '1 day' },
        originalPrice: null,
        savings: null,
        highlight: false,
        color: '#2d2d2d',
        features: [
            'Full access for 24 hours',
            '1 Cafe setup',
            'Unlimited orders (trial)',
            'All features unlocked',
            'No credit card needed',
        ],
        btnText: 'START FREE TRIAL',
        btnBg: '#FFD700',
        btnColor: '#000',
        razorpayAmount: null,
    },
    {
        id: 'monthly',
        label: '1 MONTH',
        badge: null,
        price: { amount: 1500, display: '₹1,500', period: '/mo' },
        originalPrice: null,
        savings: null,
        highlight: false,
        color: '#1a1a1a',
        features: [
            '1 Cafe',
            'Unlimited Orders',
            'Advanced Menu + Photos',
            'Revenue Analytics',
            'Priority Support',
        ],
        btnText: 'GET STARTED',
        btnBg: '#FFD700',
        btnColor: '#000',
        razorpayAmount: 150000,
    },
    {
        id: 'quarterly',
        label: '3 MONTHS',
        badge: '⭐ POPULAR',
        badgeColor: '#FF6B00',
        price: { amount: 3999, display: '₹3,999', period: '/3 mo' },
        originalPrice: '₹4,500',
        savings: 'Save ₹501',
        effectivePrice: '₹1,333/mo',
        highlight: true,
        color: '#E8621A',
        features: [
            '1 Cafe',
            'Unlimited Orders',
            'Advanced Menu + Photos',
            'Revenue Analytics',
            'Priority Support',
        ],
        btnText: 'GET 3 MONTHS',
        btnBg: '#fff',
        btnColor: '#E8621A',
        razorpayAmount: 399900,
    },
    {
        id: 'biannual',
        label: '6 MONTHS',
        badge: '🔥 BEST VALUE',
        badgeColor: '#dc2626',
        price: { amount: 7499, display: '₹7,499', period: '/6 mo' },
        originalPrice: '₹9,000',
        savings: 'Save ₹1,501',
        effectivePrice: '₹1,249/mo',
        highlight: false,
        color: '#1a1a1a',
        features: [
            '2 Cafes',
            'Unlimited Orders',
            'Advanced Menu + Photos',
            'Revenue Analytics',
            'Priority Support',
            'Custom Domain',
        ],
        btnText: 'GET 6 MONTHS',
        btnBg: '#FFD700',
        btnColor: '#000',
        razorpayAmount: 749900,
    },
    {
        id: 'annual',
        label: '12 MONTHS',
        badge: '👑 MAX SAVINGS',
        badgeColor: '#7c3aed',
        price: { amount: 13999, display: '₹13,999', period: '/yr' },
        originalPrice: '₹18,000',
        savings: 'Save ₹4,001',
        effectivePrice: '₹1,166/mo',
        highlight: false,
        color: '#1a1a1a',
        features: [
            '3 Cafes',
            'Unlimited Orders',
            'Everything in 6-month plan',
            'Custom Domain',
            'Dedicated Support',
            'Early access to new features',
        ],
        btnText: 'GO ANNUAL',
        btnBg: '#7c3aed',
        btnColor: '#fff',
        razorpayAmount: 1399900,
    },
];

export default function PricingSection() {
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState(null);

    const handleSelectPlan = async (plan) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login?redirect=pricing');
            return;
        }

        // ── Free Trial ──────────────────────────────
        if (plan.id === 'trial') {
            setLoadingPlan('trial');
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/subscription/start-trial`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await res.json();
                if (data.success) {
                    alert('🎉 Trial activated! You have 24 hours of full access.');
                    navigate('/dashboard/owner');
                } else {
                    alert(data.message || 'Failed to start trial');
                }
            } catch {
                alert('Something went wrong. Please try again.');
            } finally {
                setLoadingPlan(null);
            }
            return;
        }

        // ── Paid Plan → Razorpay ─────────────────────
        setLoadingPlan(plan.id);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/subscription/create-order`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ planId: plan.id }),
                }
            );
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY,
                amount: data.amount,
                currency: 'INR',
                name: 'Restroon',
                description: `${plan.label} Subscription`,
                order_id: data.orderId,
                handler: async (response) => {
                    try {
                        const verifyRes = await fetch(
                            `${import.meta.env.VITE_API_URL}/api/subscription/verify`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ ...response, planId: plan.id }),
                            }
                        );
                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            alert(`✅ ${plan.label} subscription activated!`);
                            navigate('/dashboard/owner');
                        } else {
                            alert('Payment verification failed. Please contact support.');
                        }
                    } catch {
                        alert('Verification error. Please contact support.');
                    }
                },
                prefill: {},
                theme: { color: '#FFD700' },
                modal: { ondismiss: () => setLoadingPlan(null) },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            alert('❌ ' + err.message);
            setLoadingPlan(null);
        }
    };

    return (
        <section
            id="pricing"
            style={{
                background: '#111',
                padding: '80px 20px',
                minHeight: '100vh',
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h2
                    style={{
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: 'clamp(32px, 5vw, 52px)',
                        margin: '0 0 12px',
                        letterSpacing: '-0.02em',
                    }}
                >
                    SIMPLE <span style={{ color: '#FFD700' }}>PRICING</span> 💰
                </h2>
                <p style={{ color: '#888', fontSize: 16, margin: 0 }}>
                    No hidden fees. Cancel anytime. Start with a free trial.
                </p>
            </div>

            {/* Trial Banner */}
            <div
                style={{
                    maxWidth: 680,
                    margin: '24px auto 48px',
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    borderRadius: 16,
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <div>
                    <div style={{ fontWeight: 900, color: '#fff', fontSize: 18 }}>
                        🎯 Start with 1 Day FREE Trial
                    </div>
                    <div
                        style={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: 13,
                            marginTop: 4,
                        }}
                    >
                        Full access for 24 hours · No credit card needed · Cancel anytime
                    </div>
                </div>
                <button
                    onClick={() => handleSelectPlan(plans[0])}
                    disabled={loadingPlan === 'trial'}
                    style={{
                        padding: '11px 24px',
                        borderRadius: 10,
                        background: '#FFD700',
                        border: 'none',
                        fontWeight: 900,
                        fontSize: 14,
                        cursor: loadingPlan === 'trial' ? 'not-allowed' : 'pointer',
                        color: '#000',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        opacity: loadingPlan === 'trial' ? 0.7 : 1,
                    }}
                >
                    {loadingPlan === 'trial' ? '⏳ Starting...' : '🚀 Try Free for 1 Day'}
                </button>
            </div>

            {/* Plan Grid — paid plans only (slice off trial) */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 20,
                    maxWidth: 1100,
                    margin: '0 auto',
                }}
            >
                {plans.slice(1).map((plan) => (
                    <div
                        key={plan.id}
                        style={{
                            background: plan.color,
                            borderRadius: 20,
                            padding: 28,
                            position: 'relative',
                            border: plan.highlight
                                ? '2px solid rgba(255,255,255,0.3)'
                                : '1px solid rgba(255,255,255,0.08)',
                            transform: plan.highlight ? 'scale(1.03)' : 'scale(1)',
                            transition: 'transform 0.2s',
                        }}
                    >
                        {/* Badge */}
                        {plan.badge && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: -14,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: plan.badgeColor,
                                    color: '#fff',
                                    fontWeight: 900,
                                    fontSize: 11,
                                    padding: '5px 14px',
                                    borderRadius: 20,
                                    whiteSpace: 'nowrap',
                                    letterSpacing: '0.06em',
                                }}
                            >
                                {plan.badge}
                            </div>
                        )}

                        {/* Plan name */}
                        <div
                            style={{
                                fontWeight: 900,
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.6)',
                                letterSpacing: '0.12em',
                                marginBottom: 8,
                            }}
                        >
                            {plan.label}
                        </div>

                        {/* Price */}
                        <div style={{ marginBottom: 4 }}>
                            <span
                                style={{
                                    fontWeight: 900,
                                    fontSize: 38,
                                    color: '#FFD700',
                                    lineHeight: 1,
                                }}
                            >
                                {plan.price.display}
                            </span>
                            <span
                                style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: 14,
                                    marginLeft: 4,
                                }}
                            >
                                {plan.price.period}
                            </span>
                        </div>

                        {/* Effective price + original */}
                        {plan.effectivePrice && (
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 8,
                                    alignItems: 'center',
                                    marginBottom: 4,
                                }}
                            >
                                <span
                                    style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}
                                >
                                    {plan.effectivePrice}
                                </span>
                                {plan.originalPrice && (
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: 'rgba(255,255,255,0.35)',
                                            textDecoration: 'line-through',
                                        }}
                                    >
                                        {plan.originalPrice}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Savings pill */}
                        {plan.savings ? (
                            <div
                                style={{
                                    display: 'inline-block',
                                    background: 'rgba(34,197,94,0.2)',
                                    color: '#4ade80',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    padding: '3px 10px',
                                    borderRadius: 20,
                                    marginBottom: 16,
                                    border: '1px solid rgba(34,197,94,0.3)',
                                }}
                            >
                                ✓ {plan.savings}
                            </div>
                        ) : (
                            <div style={{ marginBottom: 16 }} />
                        )}

                        {/* Divider */}
                        <div
                            style={{
                                height: 1,
                                background: 'rgba(255,255,255,0.1)',
                                marginBottom: 16,
                            }}
                        />

                        {/* Features */}
                        <div style={{ marginBottom: 24 }}>
                            {plan.features.map((feat, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 8,
                                        marginBottom: 9,
                                    }}
                                >
                                    <span
                                        style={{
                                            color: '#4ade80',
                                            fontSize: 14,
                                            flexShrink: 0,
                                            marginTop: 1,
                                        }}
                                    >
                                        ✓
                                    </span>
                                    <span
                                        style={{
                                            color: 'rgba(255,255,255,0.85)',
                                            fontSize: 14,
                                        }}
                                    >
                                        {feat}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={() => handleSelectPlan(plan)}
                            disabled={loadingPlan === plan.id}
                            style={{
                                width: '100%',
                                padding: '13px',
                                background: loadingPlan === plan.id ? '#555' : plan.btnBg,
                                color: loadingPlan === plan.id ? '#999' : plan.btnColor,
                                border: 'none',
                                borderRadius: 12,
                                fontWeight: 900,
                                fontSize: 14,
                                cursor: loadingPlan === plan.id ? 'not-allowed' : 'pointer',
                                letterSpacing: '0.05em',
                                transition: 'opacity 0.15s',
                            }}
                        >
                            {loadingPlan === plan.id ? '⏳ Processing...' : plan.btnText}
                        </button>
                    </div>
                ))}
            </div>

            {/* Comparison Table */}
            <div
                style={{
                    maxWidth: 700,
                    margin: '60px auto 0',
                    overflowX: 'auto',
                }}
            >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Plan', 'Duration', 'Total Price', '₹/Month', 'Savings'].map(
                                (h, i) => (
                                    <th
                                        key={i}
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: i === 0 ? 'left' : 'center',
                                            color: '#888',
                                            fontWeight: 700,
                                            fontSize: 12,
                                            letterSpacing: '0.08em',
                                            borderBottom: '1px solid #333',
                                        }}
                                    >
                                        {h}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['1 Day Trial', '1 day',   'FREE',      '—',        '—'],
                            ['1 Month',    '30 days',  '₹1,500',   '₹1,500',   '—'],
                            ['3 Months',   '90 days',  '₹3,999',   '₹1,333',   '₹501'],
                            ['6 Months',   '180 days', '₹7,499',   '₹1,249',   '₹1,501'],
                            ['12 Months',  '365 days', '₹13,999',  '₹1,166',   '₹4,001'],
                        ].map((row, ri) => (
                            <tr
                                key={ri}
                                style={{
                                    background:
                                        ri % 2 === 0
                                            ? 'rgba(255,255,255,0.02)'
                                            : 'transparent',
                                }}
                            >
                                {row.map((cell, ci) => (
                                    <td
                                        key={ci}
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: ci === 0 ? 'left' : 'center',
                                            color:
                                                ci === 4 && cell !== '—'
                                                    ? '#4ade80'
                                                    : '#ccc',
                                            fontSize: 14,
                                            fontWeight: ci === 0 ? 700 : 400,
                                            borderBottom: '1px solid #222',
                                        }}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}