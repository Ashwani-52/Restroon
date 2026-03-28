// src/pages/customer/CustomerProfile.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CartoonButton } from '../../components/ui/CartoonButton';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';

// ── Status timeline config ──────────────────────────────
const STATUS_STEPS = [
    { key: 'placed',          emoji: '📝', label: 'Order Placed'       },
    { key: 'accepted',        emoji: '✅', label: 'Accepted'            },
    { key: 'preparing',       emoji: '🍳', label: 'Preparing'           },
    { key: 'out_for_delivery',emoji: '🛵', label: 'Out for Delivery'    },
    { key: 'delivered',       emoji: '🎉', label: 'Delivered'           },
];

const STATUS_COLOR = {
    placed:           'bg-blue-100 text-blue-700',
    accepted:         'bg-yellow-100 text-yellow-700',
    preparing:        'bg-orange-100 text-orange-700',
    out_for_delivery: 'bg-purple-100 text-purple-700',
    delivered:        'bg-green-100 text-green-700',
    cancelled:        'bg-red-100 text-red-700',
};

// ── Inline order tracker ────────────────────────────────
function OrderTracker({ orderId, onClose }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(() => {
        api.get(`/api/order/${orderId}`)
            .then(r => { setOrder(r.data.order); setLoading(false); })
            .catch(() => setLoading(false));
    }, [orderId]);

    useEffect(() => {
        fetch();
        // Poll every 10 s for live updates
        const iv = setInterval(fetch, 10000);
        return () => clearInterval(iv);
    }, [fetch]);

    if (loading) return (
        <div className="mt-4 text-center py-6 font-bangers text-ink/50 animate-pulse">
            🔍 Loading order details...
        </div>
    );

    if (!order) return (
        <div className="mt-4 text-center py-4 text-red-500 font-grotesk text-sm">
            Couldn't load order. Try again.
        </div>
    );

    const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="mt-4 border-t-2 border-ink/10 pt-4 animate-fadeIn">
            {/* Status badge */}
            <div className="flex justify-between items-center mb-5">
                <p className="font-bangers text-lg text-ink/70">Tracking Order</p>
                <span className={`px-3 py-1 rounded-full font-grotesk text-xs font-bold uppercase ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status.replace(/_/g, ' ')}
                </span>
            </div>

            {/* Timeline */}
            {!isCancelled ? (
                <div className="flex items-start justify-between relative mb-6">
                    {/* connecting line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-ink/10 z-0" />
                    <div
                        className="absolute top-5 left-0 h-1 bg-orange transition-all duration-700 z-0"
                        style={{ width: currentIdx >= 0 ? `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                    />
                    {STATUS_STEPS.map((step, i) => {
                        const done = i <= currentIdx;
                        const active = i === currentIdx;
                        return (
                            <div key={step.key} className="flex flex-col items-center z-10 flex-1">
                                <div className={`w-10 h-10 rounded-full border-3 flex items-center justify-center text-lg transition-all duration-500
                                    ${done ? 'border-orange bg-orange shadow-[0_0_0_3px_rgba(255,120,0,0.2)]' : 'border-ink/20 bg-white'}
                                    ${active ? 'scale-110' : ''}
                                `}>
                                    {step.emoji}
                                </div>
                                <p className={`font-grotesk text-xs text-center mt-1.5 leading-tight max-w-[60px] ${done ? 'text-orange font-bold' : 'text-ink/40'}`}>
                                    {step.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4 text-center">
                    <p className="text-2xl mb-1">❌</p>
                    <p className="font-bangers text-red-600 text-xl">Order Cancelled</p>
                </div>
            )}

            {/* Items */}
            <div className="bg-white border-2 border-ink/10 rounded-xl p-4 mb-3">
                <p className="font-bangers text-lg mb-3">🧾 Items Ordered</p>
                <div className="space-y-2">
                    {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center font-grotesk text-sm">
                            <div className="flex items-center gap-2">
                                {item.menuItem?.image && (
                                    <img src={item.menuItem.image} alt="" className="w-8 h-8 rounded-lg object-cover border border-ink/10" />
                                )}
                                <span>{item.menuItem?.name || 'Item'}</span>
                                <span className="text-ink/40">× {item.quantity}</span>
                            </div>
                            <span className="font-bold text-orange">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-ink/10 font-bangers text-lg">
                        <span>Total</span>
                        <span className="text-orange">₹{order.totalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Cafe & time */}
            <div className="flex justify-between text-xs font-mono text-ink/50">
                <span>📍 {order.cafe?.name || 'Restaurant'}</span>
                <span>🕐 {new Date(order.createdAt).toLocaleString()}</span>
            </div>

            <button
                onClick={onClose}
                className="mt-4 w-full py-2 font-bangers text-sm text-ink/50 hover:text-ink border-2 border-ink/10 rounded-xl hover:border-ink/30 transition-all"
            >
                ▲ Collapse
            </button>
        </div>
    );
}

// ── Main Component ──────────────────────────────────────
export default function CustomerProfile() {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        api.get('/api/order/my-orders')
            .then(res => { if (res.data?.orders) setOrders(res.data.orders); })
            .catch(() => {});
    }, []);

    if (!user) return null;

    return (
        <div className="min-h-screen retro-grid">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
                {/* Profile header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-yellow border-4 border-ink rounded-full overflow-hidden shadow-[4px_4px_0_#1A1A1A]">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                                {user.name?.charAt(0)?.toUpperCase() || '👤'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="font-bangers text-4xl text-ink">{user.name}</h1>
                        <p className="font-mono text-ink/70">{user.email}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b-4 border-ink pb-4 mb-8 overflow-x-auto">
                    {['orders', 'support', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl font-bangers text-xl transition-all border-3 border-ink whitespace-nowrap
                                ${activeTab === tab
                                    ? 'bg-orange text-white shadow-[4px_4px_0_#1A1A1A] translate-y-[-2px]'
                                    : 'bg-white text-ink hover:bg-cream'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-cream border-4 border-ink rounded-3xl p-6 shadow-[8px_8px_0_#1A1A1A] min-h-[300px]">

                    {/* ── ORDERS ── */}
                    {activeTab === 'orders' && (
                        <div>
                            <h2 className="font-bangers text-3xl mb-6">Recent Orders</h2>
                            {orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🍽️</div>
                                    <p className="font-grotesk text-ink/60">No recent orders found.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.map(order => {
                                        const isOpen = expandedOrderId === order._id;
                                        const stepIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
                                        const step = STATUS_STEPS[stepIdx] || {};
                                        return (
                                            <div
                                                key={order._id}
                                                className={`bg-white border-2 rounded-2xl p-4 transition-all cursor-pointer hover:shadow-[4px_4px_0_rgba(0,0,0,0.12)] ${isOpen ? 'border-orange shadow-[4px_4px_0_rgba(255,120,0,0.2)]' : 'border-ink'}`}
                                                onClick={() => setExpandedOrderId(isOpen ? null : order._id)}
                                            >
                                                {/* Summary row */}
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bangers text-xl">Order #{order._id.slice(-6).toUpperCase()}</p>
                                                        <p className="font-mono text-xs text-ink/50">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <p className="font-bangers text-orange text-xl">₹{order.totalAmount}</p>
                                                            <p className="font-grotesk text-xs font-bold text-ink/60">{step.emoji} {order.status.replace(/_/g, ' ').toUpperCase()}</p>
                                                        </div>
                                                        <span className={`text-ink/40 text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                                                    </div>
                                                </div>

                                                {/* Expanded tracker */}
                                                {isOpen && (
                                                    <OrderTracker
                                                        orderId={order._id}
                                                        onClose={() => setExpandedOrderId(null)}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── SUPPORT ── */}
                    {activeTab === 'support' && (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">🎧</div>
                            <h2 className="font-bangers text-3xl mb-2">Customer Support</h2>
                            <p className="font-grotesk max-w-md mx-auto mb-6 text-ink/70">
                                Need help with an order? Our support team is available 24/7 to assist you.
                            </p>
                            <CartoonButton label="Contact Us" color="bg-yellow" size="lg" />
                        </div>
                    )}

                    {/* ── SETTINGS ── */}
                    {activeTab === 'settings' && (
                        <div>
                            <h2 className="font-bangers text-3xl mb-6">Account Settings</h2>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="font-bangers text-lg text-ink">Name</label>
                                    <input type="text" value={user.name} disabled className="w-full mt-1 px-4 py-3 bg-white border-2 border-ink/30 rounded-xl font-grotesk opacity-70" />
                                </div>
                                <div>
                                    <label className="font-bangers text-lg text-ink">Email</label>
                                    <input type="email" value={user.email} disabled className="w-full mt-1 px-4 py-3 bg-white border-2 border-ink/30 rounded-xl font-grotesk opacity-70" />
                                </div>
                                <div className="pt-4 border-t-2 border-ink/10 mt-6">
                                    <CartoonButton label="Logout" color="bg-red" size="md" onClick={logout} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
