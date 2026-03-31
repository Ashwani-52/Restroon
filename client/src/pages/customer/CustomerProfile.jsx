// src/pages/customer/CustomerProfile.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CartoonButton } from '../../components/ui/CartoonButton';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';

// ── Status config ───────────────────────────────────────
const STATUS_STEPS = [
    { key: 'placed',           emoji: '📝', label: 'Placed'      },
    { key: 'accepted',         emoji: '✅', label: 'Accepted'     },
    { key: 'preparing',        emoji: '🍳', label: 'Preparing'    },
    { key: 'out_for_delivery', emoji: '🛵', label: 'On the way'   },
    { key: 'delivered',        emoji: '🎉', label: 'Delivered'    },
];

const STATUS_COLOR = {
    placed:           'bg-blue-100   text-blue-700',
    accepted:         'bg-amber-100  text-amber-700',
    preparing:        'bg-orange-100 text-orange-700',
    out_for_delivery: 'bg-purple-100 text-purple-700',
    delivered:        'bg-green-100  text-green-700',
    cancelled:        'bg-red-100    text-red-700',
};

const TABS = [
    { id: 'orders',    emoji: '📦', label: 'Orders'    },
    { id: 'addresses', emoji: '📍', label: 'Addresses' },
    { id: 'favs',      emoji: '❤️',  label: 'Favourites'},
    { id: 'settings',  emoji: '⚙️',  label: 'Settings' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Order Tracker (inline expand)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function OrderTracker({ orderId, onClose }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);

    const fetch = useCallback(() => {
        api.get(`/api/order/${orderId}`)
            .then(r  => { setOrder(r.data.order); setLoading(false); })
            .catch(() => setLoading(false));
    }, [orderId]);

    useEffect(() => {
        fetch();
        timerRef.current = setInterval(fetch, 10000);
        return () => clearInterval(timerRef.current);
    }, [fetch]);

    if (loading) return (
        <div className="mt-4 text-center py-6 font-bangers text-ink/50 animate-pulse text-lg">
            🔍 Loading order details…
        </div>
    );
    if (!order)   return (
        <div className="mt-4 text-center py-4 text-red-500 font-grotesk text-sm">
            Couldn't load order. Try again.
        </div>
    );

    const currentIdx  = STATUS_STEPS.findIndex(s => s.key === order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="mt-4 border-t-2 border-ink/10 pt-5 animate-fadeIn">
            {/* Status badge */}
            <div className="flex justify-between items-center mb-5">
                <p className="font-bangers text-lg text-ink/70">Live Tracking</p>
                <span className={`px-3 py-1 rounded-full font-grotesk text-xs font-bold uppercase ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status.replace(/_/g, ' ')}
                </span>
            </div>

            {/* Progress bar timeline */}
            {!isCancelled ? (
                <div className="relative flex items-start justify-between mb-6">
                    <div className="absolute top-5 left-0 right-0 h-1 bg-ink/10 z-0" />
                    <div
                        className="absolute top-5 left-0 h-1 bg-orange transition-all duration-700 z-0"
                        style={{ width: currentIdx >= 0 ? `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                    />
                    {STATUS_STEPS.map((step, i) => {
                        const done   = i <= currentIdx;
                        const active = i === currentIdx;
                        return (
                            <div key={step.key} className="flex flex-col items-center z-10 flex-1">
                                <div className={`w-10 h-10 rounded-full border-3 flex items-center justify-center text-lg transition-all duration-500
                                    ${done ? 'border-orange bg-orange shadow-[0_0_0_3px_rgba(255,120,0,0.20)]' : 'border-ink/20 bg-white'}
                                    ${active ? 'scale-110' : ''}`}>
                                    {step.emoji}
                                </div>
                                <p className={`font-grotesk text-xs text-center mt-1.5 leading-tight max-w-[54px] ${done ? 'text-orange font-bold' : 'text-ink/40'}`}>
                                    {step.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4 text-center">
                    <p className="text-3xl mb-1">❌</p>
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
                                <span>{item.menuItem?.name || item.name || 'Item'}</span>
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

            <div className="flex justify-between text-xs font-mono text-ink/50 mb-3">
                <span>📍 {order.cafe?.name || 'Restaurant'}</span>
                <span>🕐 {new Date(order.createdAt).toLocaleString()}</span>
            </div>

            <button
                onClick={onClose}
                className="w-full py-2 font-bangers text-sm text-ink/50 hover:text-ink border-2 border-ink/10 rounded-xl hover:border-ink/30 transition-all"
            >
                ▲ Collapse
            </button>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Orders Tab
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function OrdersTab() {
    const [orders, setOrders]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [expandedId, setExpanded] = useState(null);

    useEffect(() => {
        api.get('/api/order/my-orders')
            .then(res => { if (res.data?.orders) setOrders(res.data.orders); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="text-center py-16 animate-pulse font-bangers text-2xl text-ink/40">
            📦 Loading orders…
        </div>
    );

    if (orders.length === 0) return (
        <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="font-bangers text-2xl text-ink/50">No orders yet</p>
            <p className="font-grotesk text-ink/40 mt-1 mb-6">Place your first order from a cafe!</p>
            <Link to="/cafes">
                <CartoonButton label="🏪 Browse Cafes" color="bg-orange" size="md" />
            </Link>
        </div>
    );

    return (
        <div>
            <h2 className="font-bangers text-3xl mb-6">Recent Orders</h2>
            <div className="space-y-3">
                {orders.map(order => {
                    const isOpen  = expandedId === order._id;
                    const stepIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
                    const step    = STATUS_STEPS[stepIdx] || {};
                    return (
                        <div
                            key={order._id}
                            className={`bg-white border-2 rounded-2xl p-4 transition-all cursor-pointer hover:shadow-[4px_4px_0_rgba(0,0,0,.10)] ${isOpen ? 'border-orange shadow-[4px_4px_0_rgba(255,120,0,0.20)]' : 'border-ink/20'}`}
                            onClick={() => setExpanded(isOpen ? null : order._id)}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bangers text-xl">#{order._id.slice(-6).toUpperCase()}</p>
                                    <p className="font-mono text-xs text-ink/50 mt-0.5">
                                        {order.cafe?.name} · {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="font-bangers text-orange text-xl">₹{order.totalAmount}</p>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {step.emoji} {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <span className={`text-ink/40 text-lg transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                                </div>
                            </div>
                            {isOpen && (
                                <OrderTracker orderId={order._id} onClose={() => setExpanded(null)} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Addresses Tab
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const LABEL_ICONS = { Home: '🏠', Work: '💼', Other: '📍' };

function AddressesTab() {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm]   = useState(false);
    const [form, setForm]           = useState({ label: 'Home', street: '', city: '', pincode: '' });
    const [saving, setSaving]       = useState(false);
    const [msg, setMsg]             = useState('');

    useEffect(() => {
        api.get('/api/profile')
            .then(res => setAddresses(res.data.user?.addresses || []))
            .catch(() => {});
    }, []);

    const handleAdd = async e => {
        e.preventDefault();
        if (!form.street.trim() || !form.city.trim()) return;
        setSaving(true);
        try {
            const res = await api.post('/api/profile/address', form);
            setAddresses(res.data.addresses);
            setShowForm(false);
            setForm({ label: 'Home', street: '', city: '', pincode: '' });
            setMsg('✅ Address saved!');
        } catch {
            setMsg('❌ Failed to add address');
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const handleDelete = async id => {
        try {
            const res = await api.delete(`/api/profile/address/${id}`);
            setAddresses(res.data.addresses);
            setMsg('🗑️ Address removed');
            setTimeout(() => setMsg(''), 3000);
        } catch { /* silent */ }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bangers text-3xl">Saved Addresses</h2>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="px-4 py-2 bg-orange text-white font-bangers text-lg rounded-xl border-3 border-ink shadow-[3px_3px_0_#1A1A1A] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                >
                    {showForm ? '✕ Cancel' : '+ Add Address'}
                </button>
            </div>

            {msg && (
                <p className="mb-4 text-center font-grotesk text-sm font-bold text-ink bg-yellow/30 border-2 border-yellow rounded-xl px-4 py-2">{msg}</p>
            )}

            {/* Add form */}
            {showForm && (
                <form onSubmit={handleAdd} className="bg-white border-3 border-ink rounded-2xl p-5 mb-5 shadow-[4px_4px_0_#1A1A1A]">
                    <p className="font-bangers text-xl mb-4">📍 New Address</p>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        {['Home', 'Work', 'Other'].map(l => (
                            <button
                                key={l} type="button"
                                onClick={() => setForm(f => ({ ...f, label: l }))}
                                className={`py-2 rounded-xl font-bangers text-lg border-2 transition-all ${form.label === l ? 'bg-orange text-white border-orange shadow-[2px_2px_0_#1A1A1A]' : 'border-ink/30 text-ink hover:border-ink'}`}
                            >
                                {LABEL_ICONS[l]} {l}
                            </button>
                        ))}
                    </div>
                    <input
                        required
                        placeholder="Street / Flat / Area *"
                        value={form.street}
                        onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                        className="w-full mb-3 px-4 py-3 border-2 border-ink/30 rounded-xl font-grotesk focus:border-orange focus:outline-none"
                    />
                    <div className="flex gap-3">
                        <input
                            required
                            placeholder="City *"
                            value={form.city}
                            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                            className="flex-1 px-4 py-3 border-2 border-ink/30 rounded-xl font-grotesk focus:border-orange focus:outline-none"
                        />
                        <input
                            placeholder="Pincode"
                            value={form.pincode}
                            onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                            className="w-32 px-4 py-3 border-2 border-ink/30 rounded-xl font-grotesk focus:border-orange focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit" disabled={saving}
                        className="mt-4 w-full py-3 bg-orange text-white font-bangers text-xl rounded-xl border-3 border-ink shadow-[4px_4px_0_#1A1A1A] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
                    >
                        {saving ? '⏳ Saving…' : '💾 Save Address'}
                    </button>
                </form>
            )}

            {/* Address list */}
            {addresses.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-5xl mb-3">🗺️</div>
                    <p className="font-bangers text-2xl text-ink/50">No addresses saved</p>
                    <p className="font-grotesk text-ink/40 mt-1">Add your home or work address for faster checkout.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {addresses.map(addr => (
                        <div key={addr._id} className="flex items-start justify-between bg-white border-2 border-ink/20 rounded-2xl p-4 hover:border-orange transition-all group">
                            <div>
                                <p className="font-bangers text-lg">{LABEL_ICONS[addr.label]} {addr.label}</p>
                                <p className="font-grotesk text-sm text-ink/70 mt-0.5">{addr.street}</p>
                                <p className="font-grotesk text-sm text-ink/50">{addr.city}{addr.pincode ? ` — ${addr.pincode}` : ''}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(addr._id)}
                                className="ml-4 text-red-400 hover:text-red-600 text-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete address"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Favourites Tab
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FavouritesTab() {
    const [favs, setFavs]     = useState([]);
    const [loading, setLoad]  = useState(true);

    useEffect(() => {
        api.get('/api/profile')
            .then(res => setFavs(res.data.user?.favourites || []))
            .catch(() => {})
            .finally(() => setLoad(false));
    }, []);

    const removeFav = async cafeId => {
        try {
            await api.post(`/api/profile/favourite/${cafeId}`);
            setFavs(f => f.filter(c => c._id !== cafeId));
        } catch { /* silent */ }
    };

    if (loading) return (
        <div className="text-center py-16 animate-pulse font-bangers text-2xl text-ink/40">❤️ Loading favourites…</div>
    );

    if (favs.length === 0) return (
        <div className="text-center py-16">
            <div className="text-6xl mb-4">💔</div>
            <p className="font-bangers text-2xl text-ink/50">No favourites yet</p>
            <p className="font-grotesk text-ink/40 mt-1 mb-6">Tap ❤️ on a cafe page to save it here.</p>
            <Link to="/cafes">
                <CartoonButton label="🏪 Discover Cafes" color="bg-orange" size="md" />
            </Link>
        </div>
    );

    return (
        <div>
            <h2 className="font-bangers text-3xl mb-6">Favourite Cafes ❤️</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favs.map(cafe => (
                    <div key={cafe._id} className="bg-white border-2 border-ink/20 rounded-2xl p-4 flex items-center gap-4 hover:border-orange transition-all group">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-ink/10 flex-shrink-0">
                            {cafe.logo
                                ? <img src={cafe.logo} alt={cafe.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-yellow flex items-center justify-center text-2xl">🏪</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bangers text-lg truncate">{cafe.name}</p>
                            <p className="font-grotesk text-xs text-ink/50">{cafe.address?.city || ''}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <Link to={`/cafe/${cafe.slug}`} className="text-xs font-grotesk font-bold text-orange hover:underline">
                                Visit →
                            </Link>
                            <button
                                onClick={() => removeFav(cafe._id)}
                                className="text-red-400 hover:text-red-600 text-sm transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove favourite"
                            >
                                💔 Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Settings Tab (Edit Profile + Logout)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SettingsTab({ user, onLogout, onProfileUpdate }) {
    const [form,   setForm]   = useState({ name: user.name || '', phone: user.phone || '' });
    const [saving, setSaving] = useState(false);
    const [msg,    setMsg]    = useState('');

    const handleSave = async e => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const res = await api.patch('/api/profile/update', form);
            onProfileUpdate(res.data.user);
            setMsg('✅ Profile updated!');
        } catch {
            setMsg('❌ Failed to update profile');
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    return (
        <div>
            <h2 className="font-bangers text-3xl mb-6">Account Settings</h2>

            {msg && (
                <p className="mb-4 text-center font-grotesk text-sm font-bold bg-yellow/30 border-2 border-yellow rounded-xl px-4 py-2">{msg}</p>
            )}

            <form onSubmit={handleSave} className="space-y-4 max-w-md mb-8">
                <div>
                    <label className="font-bangers text-lg text-ink block mb-1">Full Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border-2 border-ink/30 rounded-xl font-grotesk focus:border-orange focus:outline-none"
                        placeholder="Your name"
                    />
                </div>
                <div>
                    <label className="font-bangers text-lg text-ink block mb-1">Phone Number</label>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border-2 border-ink/30 rounded-xl font-grotesk focus:border-orange focus:outline-none"
                        placeholder="10-digit mobile number"
                    />
                </div>
                <div>
                    <label className="font-bangers text-lg text-ink block mb-1">Email</label>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 bg-white border-2 border-ink/30 rounded-xl font-grotesk opacity-60 cursor-not-allowed"
                    />
                    <p className="font-grotesk text-xs text-ink/40 mt-1">Email cannot be changed.</p>
                </div>
                <button
                    type="submit" disabled={saving}
                    className="w-full py-3 bg-orange text-white font-bangers text-xl rounded-xl border-3 border-ink shadow-[4px_4px_0_#1A1A1A] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
                >
                    {saving ? '⏳ Saving…' : '💾 Save Changes'}
                </button>
            </form>

            {/* Danger zone */}
            <div className="border-t-2 border-red-100 pt-6">
                <p className="font-bangers text-xl text-red-500 mb-3">Danger Zone</p>
                <CartoonButton
                    label="🚪 Logout"
                    color="bg-red-500"
                    size="md"
                    onClick={onLogout}
                />
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Customer Profile Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function CustomerProfile() {
    const { user, logout, setUser } = useAuth();
    const navigate                  = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleProfileUpdate = updatedUser => {
        if (setUser) setUser(updatedUser);
    };

    const initials = user.name
        ?.split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || '👤';

    return (
        <div className="min-h-screen retro-grid">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">

                {/* ── Profile Header card ───────────────────── */}
                <div className="bg-white border-4 border-ink rounded-3xl p-6 mb-6 shadow-[8px_8px_0_#1A1A1A] flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full border-4 border-orange overflow-hidden flex-shrink-0 shadow-[4px_4px_0_#1A1A1A] bg-yellow">
                        {user.avatar
                            ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center font-bangers text-3xl text-ink">{initials}</div>}
                    </div>
                    <div className="min-w-0">
                        <h1 className="font-bangers text-4xl text-ink leading-tight truncate">{user.name}</h1>
                        <p className="font-mono text-sm text-ink/60 truncate">{user.email}</p>
                        {user.phone && <p className="font-grotesk text-sm text-ink/50 mt-0.5">📞 {user.phone}</p>}
                    </div>
                    <div className="ml-auto hidden sm:block">
                        <span className="px-4 py-2 bg-orange/10 border-2 border-orange rounded-full font-bangers text-orange text-sm">
                            {user.role?.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* ── Tab bar ───────────────────────────────── */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bangers text-lg border-3 border-ink whitespace-nowrap transition-all
                                ${activeTab === tab.id
                                    ? 'bg-orange text-white shadow-[4px_4px_0_#1A1A1A] translate-y-[-2px]'
                                    : 'bg-white text-ink hover:bg-cream shadow-[3px_3px_0_#1A1A1A]'}`}
                        >
                            <span>{tab.emoji}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* ── Content panel ─────────────────────────── */}
                <div className="bg-cream border-4 border-ink rounded-3xl p-6 shadow-[8px_8px_0_#1A1A1A] min-h-[320px]">
                    {activeTab === 'orders'    && <OrdersTab />}
                    {activeTab === 'addresses' && <AddressesTab />}
                    {activeTab === 'favs'      && <FavouritesTab />}
                    {activeTab === 'settings'  && (
                        <SettingsTab
                            user={user}
                            onLogout={handleLogout}
                            onProfileUpdate={handleProfileUpdate}
                        />
                    )}
                </div>

            </div>
        </div>
    );
}
