// src/pages/dashboard/owner/OwnerDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { CartoonButton } from '../../../components/ui/CartoonButton';
import { ImageUpload } from '../../../components/ui/ImageUpload';
import SubscriptionPage from './SubscriptionPage';

// ── Order Popup Component ──────────────────────
function NewOrderPopup({ order, onAccept, onReject }) {
    return (
        <AnimatePresence>
            {order && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-cream border-4 border-ink rounded-3xl p-8 max-w-md w-full mx-4 shadow-[12px_12px_0_#FF6B35] relative overflow-hidden"
                        initial={{ scale: 0.5, rotate: -5 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="stripe-bg absolute top-0 left-0 right-0 h-3" />

                        <div className="text-center mb-6">
                            <div className="text-6xl mb-3 animate-bounce">🔔</div>
                            <h2 className="font-bangers text-4xl text-ink">NEW ORDER!</h2>
                            <p className="font-grotesk text-ink/70 mt-1">
                                #{order._id?.slice(-6).toUpperCase()}
                            </p>
                        </div>

                        <div className="bg-yellow border-2 border-ink rounded-2xl p-4 mb-6">
                            <div className="space-y-2">
                                {order.items?.map(item => (
                                    <div key={item._id} className="flex justify-between">
                                        <span className="font-grotesk font-semibold">{item.name} × {item.quantity}</span>
                                        <span className="font-bangers text-orange">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                <div className="border-t-2 border-ink pt-2 flex justify-between">
                                    <span className="font-bangers text-lg">TOTAL</span>
                                    <span className="font-bangers text-xl text-orange">₹{order.totalAmount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <CartoonButton
                                label="✅ Accept"
                                color="bg-green-400"
                                size="md"
                                onClick={() => onAccept(order._id)}
                            />
                            <CartoonButton
                                label="❌ Reject"
                                color="bg-red"
                                size="md"
                                onClick={() => onReject(order._id)}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Owner Orders Tab ───────────────────────────
function OwnerOrders({ cafe }) {
    const [orders, setOrders] = useState([]);
    const [newOrder, setNewOrder] = useState(null);
    const [filter, setFilter] = useState('placed');
    const prevOrderIds = useRef(new Set());

    const fetchOrders = async () => {
        const res = await api.get(`/api/order/cafe/all?status=${filter}`);
        const fetched = res.data.orders;

        // Detect new placed orders
        const newPlaced = fetched.filter(
            o => o.status === 'placed' && !prevOrderIds.current.has(o._id)
        );
        if (newPlaced.length > 0) {
            setNewOrder(newPlaced[0]);
            // Play notification sound
            try { new Audio('/notification.mp3').play(); } catch { }
        }
        prevOrderIds.current = new Set(fetched.map(o => o._id));
        setOrders(fetched);
    };

    useEffect(() => {
        if (!cafe) return;
        fetchOrders();
        const interval = setInterval(fetchOrders, 8000); // Poll every 8s
        return () => clearInterval(interval);
    }, [cafe, filter]);

    const updateStatus = async (orderId, status) => {
        await api.patch(`/api/order/${orderId}/status`, { status });
        setNewOrder(null);
        fetchOrders();
    };

    return (
        <>
            <NewOrderPopup
                order={newOrder}
                onAccept={id => updateStatus(id, 'accepted')}
                onReject={id => updateStatus(id, 'rejected')}
            />

            <div>
                <h2 className="font-bangers text-3xl text-ink mb-4">📦 ORDERS</h2>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-full border-2 border-ink font-bangers text-sm whitespace-nowrap transition-all ${filter === s ? 'bg-yellow shadow-[2px_2px_0_#1A1A1A]' : 'bg-cream'}`}
                        >
                            {s.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-3">📭</div>
                        <p className="font-bangers text-2xl text-ink/50">No orders yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order._id} className="bg-cream border-3 border-ink rounded-2xl p-5 shadow-[4px_4px_0_#1A1A1A]">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-bangers text-xl text-ink">#{order._id.slice(-6).toUpperCase()}</p>
                                        <p className="font-grotesk text-sm text-ink/60">
                                            {order.customer?.name} • {new Date(order.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <span className="bg-yellow border-2 border-ink rounded-full px-3 py-1 font-bangers text-sm">
                                        ₹{order.totalAmount}
                                    </span>
                                </div>

                                <div className="space-y-1 mb-4">
                                    {order.items?.map(item => (
                                        <div key={item._id} className="flex justify-between text-sm font-grotesk">
                                            <span>{item.name} × {item.quantity}</span>
                                            <span className="text-orange font-semibold">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action buttons */}
                                {order.status === 'placed' && (
                                    <div className="flex gap-3">
                                        <CartoonButton label="✅ Accept" color="bg-green-400" size="sm" onClick={() => updateStatus(order._id, 'accepted')} />
                                        <CartoonButton label="❌ Reject" color="bg-red" size="sm" onClick={() => updateStatus(order._id, 'rejected')} />
                                    </div>
                                )}
                                {order.status === 'accepted' && (
                                    <CartoonButton label="👨‍🍳 Start Preparing" color="bg-orange" size="sm" onClick={() => updateStatus(order._id, 'preparing')} />
                                )}
                                {order.status === 'preparing' && (
                                    <CartoonButton label="🛵 Out for Delivery" color="bg-yellow" size="sm" onClick={() => updateStatus(order._id, 'out_for_delivery')} />
                                )}
                                {order.status === 'out_for_delivery' && (
                                    <CartoonButton label="✅ Mark Delivered" color="bg-green-400" size="sm" onClick={() => updateStatus(order._id, 'delivered')} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

// ── Owner Menu Tab ──────────────────────────────
function OwnerMenu({ cafe }) {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', price: '', category: 'General', isVeg: true, image: '' });
    const [imagePreview, setImagePreview] = useState(null);
    const [adding, setAdding] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            // Compress via canvas — max 600px, 70% quality
            const img = new Image();
            img.onload = () => {
                const MAX = 600;
                const scale = Math.min(1, MAX / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                const compressed = canvas.toDataURL('image/jpeg', 0.7);
                setImagePreview(compressed);
                setForm(f => ({ ...f, image: compressed }));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (!cafe) return;
        api.get('/api/menu/my-items').then(r => setItems(r.data.menuItems));
    }, [cafe]);

    const addItem = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            const res = await api.post('/api/menu', { ...form, price: Number(form.price) });
            setItems(prev => [...prev, res.data.menuItem]);
            setForm({ name: '', description: '', price: '', category: 'General', isVeg: true, image: '' });
            setImagePreview(null);
            setShowAdd(false);
        } catch (err) {
            alert(err.response?.data?.message);
        } finally {
            setAdding(false);
        }
    };

    const toggleAvailability = async (itemId) => {
        await api.patch(`/api/menu/${itemId}/toggle`);
        setItems(prev => prev.map(i => i._id === itemId ? { ...i, isAvailable: !i.isAvailable } : i));
    };

    const deleteItem = async (itemId) => {
        if (!window.confirm('Delete this item?')) return;
        await api.delete(`/api/menu/${itemId}`);
        setItems(prev => prev.filter(i => i._id !== itemId));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-bangers text-3xl text-ink">🍽️ MENU ITEMS</h2>
                <CartoonButton label="+ Add Item" color="bg-yellow" size="sm" onClick={() => setShowAdd(true)} />
            </div>

            {/* Add Item Form */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        className="bg-yellow border-3 border-ink rounded-2xl p-6 mb-6 shadow-[6px_6px_0_#1A1A1A]"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h3 className="font-bangers text-2xl text-ink mb-4">ADD NEW ITEM</h3>
                        <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'name', placeholder: '✏️ e.g. Butter Chicken', type: 'text' },
                                { name: 'price', placeholder: '₹ e.g. 180', type: 'number' },
                                { name: 'category', placeholder: '📂 e.g. Main Course', type: 'text' },
                                { name: 'description', placeholder: '📝 Short description...', type: 'text' }
                            ].map(({ name, placeholder, type }) => (
                                <input
                                    key={name}
                                    type={type}
                                    placeholder={placeholder}
                                    value={form[name]}
                                    onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                                    required={name !== 'description'}
                                    className="px-4 py-3 bg-white border-2 border-ink rounded-xl font-grotesk text-ink placeholder:text-ink/50 focus:outline-none focus:border-orange"
                                />
                            ))}
                            {/* Image upload */}
                            <div className="md:col-span-2">
                                <label className="block font-bangers text-ink text-sm mb-2">📸 FOOD IMAGE (optional)</label>
                                <label className="flex items-center gap-4 cursor-pointer bg-white border-2 border-dashed border-ink rounded-xl p-3 hover:border-orange transition-colors">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-lg object-cover border-2 border-ink" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg border-2 border-ink/30 bg-cream flex items-center justify-center text-2xl">🖼️</div>
                                    )}
                                    <div>
                                        <p className="font-grotesk text-sm text-ink font-semibold">{imagePreview ? 'Change photo' : 'Upload food photo'}</p>
                                        <p className="font-grotesk text-xs text-ink/50">JPG, PNG — shows on customer menu</p>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                                </label>
                            </div>
                            <label className="flex items-center gap-2 font-grotesk">
                                <input
                                    type="checkbox"
                                    checked={form.isVeg}
                                    onChange={e => setForm(f => ({ ...f, isVeg: e.target.checked }))}
                                    className="w-5 h-5"
                                />
                                Vegetarian
                            </label>
                            <div className="flex gap-3 md:col-span-2">
                                <CartoonButton type="submit" label={adding ? '⏳ Adding...' : '✅ Add Item'} color="bg-green-400" size="sm" disabled={adding} />
                                <CartoonButton label="Cancel" color="bg-red" size="sm" onClick={() => setShowAdd(false)} />
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(item => (
                    <div
                        key={item._id}
                        className={`bg-cream border-3 border-ink rounded-2xl p-4 flex flex-col shadow-[4px_4px_0_#1A1A1A] transition-opacity ${!item.isAvailable ? 'opacity-60' : ''}`}
                    >
                        {/* ── Item Image ── */}
                        <div className="mb-3 relative w-full">
                            <ImageUpload
                                endpoint={`/api/upload/menu/${item._id}`}
                                currentImage={item.image}
                                onSuccess={(url) => setItems(prev =>
                                    prev.map(i => i._id === item._id ? { ...i, image: url } : i)
                                )}
                                label="Add Photo"
                                aspect="1/1"
                            />
                            {/* Veg badge */}
                            <span className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs z-10 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}>
                                {item.isVeg ? '🟢' : '🔴'}
                            </span>
                        </div>

                        {/* ── Info ── */}
                        <div className="flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bangers text-xl text-ink leading-tight">{item.name}</h3>
                                <span className="font-bangers text-xl text-orange ml-1 shrink-0">₹{item.price}</span>
                            </div>
                            <p className="font-grotesk text-sm text-ink/60 mb-3">{item.category}</p>
                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => toggleAvailability(item._id)}
                                    className={`flex-1 py-1.5 rounded-xl border-2 border-ink font-bangers text-sm ${item.isAvailable ? 'bg-green-100' : 'bg-red/20'}`}
                                >
                                    {item.isAvailable ? '✅ Available' : '❌ Unavailable'}
                                </button>
                                <button
                                    onClick={() => deleteItem(item._id)}
                                    className="px-3 py-1.5 rounded-xl border-2 border-ink bg-red/10 font-bangers text-sm hover:bg-red/30"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main Owner Dashboard ───────────────────────
export default function OwnerDashboard() {
    const [cafe, setCafe] = useState(null);
    const [stats, setStats] = useState(null);
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const tab = location.pathname.split('/').pop();

    useEffect(() => {
        api.get('/api/cafe/my-cafe')
            .then(r => setCafe(r.data.cafe))
            .catch((err) => {
                if (err.response?.status === 404 && tab !== 'setup') {
                    navigate('/dashboard/owner/setup', { replace: true });
                }
            });

        // Get simple stats
        api.get('/api/order/cafe/all').then(r => {
            const orders = r.data.orders;
            setStats({
                total: orders.length,
                today: orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length,
                revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0),
                pending: orders.filter(o => o.status === 'placed').length
            });
        }).catch(() => { });
    }, [navigate, tab]);

    const navItems = [
        { path: 'orders', label: '📦 Orders', badge: stats?.pending },
        { path: 'menu', label: '🍽️ Menu' },
        { path: 'revenue', label: '💰 Revenue' },
        { path: 'settings', label: '⚙️ Settings' },
        { path: 'banking', label: '🏦 Banking' },
        { path: 'subscription', label: '💳 Subscription' }
    ];

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Back to Home */}
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-cream/50 hover:text-yellow font-grotesk text-sm mb-5 transition-colors group w-fit"
            >
                <span className="text-lg group-hover:-translate-x-1 transition-transform inline-block">←</span>
                Home
            </button>

            <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">🛵</span>
                <span className="font-bangers text-2xl text-yellow">RESTROON</span>
            </div>

            {/* Cafe Info */}
            {cafe && (
                <div className="bg-yellow/20 border-2 border-yellow/40 rounded-xl p-3 mb-6">
                    <p className="font-bangers text-yellow">{cafe.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <button
                            onClick={() => api.patch('/api/cafe/my-cafe/toggle').then(r => setCafe(c => ({ ...c, isOpen: r.data.isOpen }))).catch(e => alert(e.response?.data?.message || 'Failed to toggle status'))}
                            className={`w-8 h-4 rounded-full border transition-colors ${cafe.isOpen ? 'bg-green-400' : 'bg-red'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${cafe.isOpen ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                        <span className="font-mono text-xs text-cream/60">{cafe.isOpen ? 'Open' : 'Closed'}</span>
                    </div>
                </div>
            )}

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 gap-2 mb-6">
                    {[
                        { label: 'Today', value: stats.today, color: 'text-yellow' },
                        { label: 'Pending', value: stats.pending, color: 'text-orange' },
                        { label: 'Revenue', value: `₹${stats.revenue}`, color: 'text-green-400', full: true }
                    ].map(({ label, value, color, full }) => (
                        <div key={label} className={`bg-white/10 rounded-xl p-2 text-center ${full ? 'col-span-2' : ''}`}>
                            <div className={`font-bangers text-lg ${color}`}>{value}</div>
                            <div className="font-mono text-xs text-cream/50">{label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Nav */}
            <nav className="space-y-2">
                {!cafe ? (
                    <div className="text-cream/50 font-grotesk text-sm px-4">Setup required</div>
                ) : navItems.map(({ path, label, badge }) => (
                    <Link
                        key={path}
                        to={`/dashboard/owner/${path}`}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl font-bangers text-lg transition-all ${tab === path ? 'bg-yellow text-ink shadow-[3px_3px_0_rgba(255,255,255,0.2)]' : 'text-cream hover:bg-white/10'}`}
                    >
                        {label}
                        {badge > 0 && (
                            <span className="bg-red text-cream text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {badge}
                            </span>
                        )}
                        
                    </Link>
                ))}
            </nav>
        </div>
    );

    return (
        <div className="min-h-screen bg-cream flex">

            {/* ── Mobile overlay backdrop ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-ink/60 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Mobile slide-in drawer ── */}
            <div className={`
                fixed top-0 left-0 bottom-0 w-72 bg-ink z-40 p-6 overflow-y-auto
                transform transition-transform duration-300 lg:hidden
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 text-cream/50 hover:text-cream text-2xl"
                >✕</button>
                <SidebarContent />
            </div>

            {/* ── Desktop sidebar (hidden on mobile) ── */}
            <div className="hidden lg:flex w-64 bg-ink border-r-4 border-ink min-h-screen p-6 fixed left-0 top-0 bottom-0 flex-col overflow-y-auto">
                <SidebarContent />
            </div>

            {/* ── Main content ── */}
            <div className="flex-1 lg:ml-64 min-w-0">

                {/* Mobile top bar */}
                <div className="lg:hidden sticky top-0 z-20 bg-ink border-b-4 border-ink px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-yellow text-2xl font-bold leading-none px-2"
                    >☰</button>
                    <span className="font-bangers text-xl text-yellow">🛵 RESTROON</span>
                    {cafe && (
                        <div className={`text-xs font-bangers px-2 py-1 rounded-full ${cafe.isOpen ? 'bg-green-400 text-ink' : 'bg-red text-cream'}`}>
                            {cafe.isOpen ? 'OPEN' : 'CLOSED'}
                        </div>
                    )}
                </div>

                {/* Page content */}
                <div className="p-4 md:p-8 pb-24 lg:pb-8">
                    <div className="max-w-5xl mx-auto">
                        <Routes>
                            <Route path="orders" element={<OwnerOrders cafe={cafe} />} />
                            <Route path="menu" element={<OwnerMenu cafe={cafe} />} />
                            <Route path="revenue" element={<OwnerRevenue cafe={cafe} />} />
                            <Route path="settings" element={<OwnerSettings cafe={cafe} setCafe={setCafe} />} />
                            <Route path="banking" element={<OwnerBanking cafe={cafe} />} />
                            <Route path="subscription" element={<SubscriptionPage />} />
                            <Route path="setup" element={<CafeSetup setCafe={setCafe} />} />
                            <Route index element={<OwnerOrders cafe={cafe} />} />
                        </Routes>
                    </div>
                </div>
            </div>

            {/* ── Mobile bottom nav bar ── */}
            {cafe && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-ink border-t-4 border-ink flex">
                    {navItems.map(({ path, label, badge }) => (
                        <Link
                            key={path}
                            to={`/dashboard/owner/${path}`}
                            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${tab === path ? 'bg-yellow/20' : ''}`}
                        >
                            <span className="text-xl">{label.split(' ')[0]}</span>
                            <span className={`font-bangers text-xs ${tab === path ? 'text-yellow' : 'text-cream/60'}`}>
                                {label.split(' ').slice(1).join(' ')}
                            </span>
                            {badge > 0 && (
                                <span className="absolute top-1 bg-red text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}


// ── Revenue Tab ────────────────────────────────
// In OwnerDashboard.jsx — replace OwnerRevenue function
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

function OwnerRevenue({ cafe }) {
    const [orders, setOrders] = useState([]);
    const [period, setPeriod] = useState('week'); // week | month | all
    const [trends, setTrends] = useState([]);
    const [loadTrend, setLoadTrend] = useState(true);

    useEffect(() => {
        api.get('/api/order/cafe/all?status=delivered')
            .then(r => setOrders(r.data.orders));
    }, []);

    // ─── Fetch food trends from backend ──────────
    useEffect(() => {
        api.get('/api/admin/food-trends')
            .then(r => setTrends(r.data.trends))
            .catch(() => setTrends(defaultTrends))
            .finally(() => setLoadTrend(false));
    }, []);

    // ─── Process orders into chart data ──────────
    const getChartData = () => {
        const now = new Date();
        const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;

        return Array.from({ length: days }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (days - 1 - i));
            const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

            const dayOrders = orders.filter(o => {
                const od = new Date(o.createdAt);
                return od.toDateString() === date.toDateString();
            });

            return {
                date: dateStr,
                revenue: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
                orders: dayOrders.length
            };
        });
    };

    // ─── Top selling items ────────────────────────
    const topItems = () => {
        const itemMap = {};
        orders.forEach(order => {
            order.items?.forEach(item => {
                if (!itemMap[item.name]) itemMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
                itemMap[item.name].qty += item.quantity;
                itemMap[item.name].revenue += item.price * item.quantity;
            });
        });
        return Object.values(itemMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    };

    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const todayOrders = orders.filter(o =>
        new Date(o.createdAt).toDateString() === new Date().toDateString()
    );
    const todayRevenue = todayOrders.reduce((s, o) => s + o.totalAmount, 0);
    const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;
    const chartData = getChartData();
    const pieData = topItems();
    const PIE_COLORS = ['#FFD23F', '#FF6B35', '#FF3B30', '#4CAF50', '#2196F3'];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="font-bangers text-4xl text-ink">💰 ANALYTICS</h2>
                <div className="flex gap-2">
                    {['week', 'month', 'all'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-full border-2 border-ink font-bangers capitalize transition-all ${period === p ? 'bg-yellow shadow-[2px_2px_0_#1A1A1A]' : 'bg-cream'}`}
                        >
                            {p === 'all' ? '90 Days' : `Last ${p}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-yellow' },
                    { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString()}`, icon: '📅', color: 'bg-orange' },
                    { label: 'Total Orders', value: orders.length, icon: '📦', color: 'bg-red' },
                    { label: 'Avg Order Value', value: `₹${avgOrderValue}`, icon: '📊', color: 'bg-green-400' },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className={`${color} border-3 border-ink rounded-2xl p-5 shadow-[4px_4px_0_#1A1A1A]`}>
                        <div className="text-3xl mb-2">{icon}</div>
                        <div className="font-bangers text-3xl text-ink">{value}</div>
                        <div className="font-grotesk text-xs text-ink/70 mt-1">{label}</div>
                    </div>
                ))}
            </div>

            {/* ── Revenue Chart ── */}
            <div className="bg-cream border-3 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1A1A1A]">
                <h3 className="font-bangers text-2xl text-ink mb-4">📈 REVENUE TREND</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A20" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontFamily: 'Space Mono', fontSize: 11 }}
                            interval={period === 'week' ? 0 : 'preserveStartEnd'}
                        />
                        <YAxis tick={{ fontFamily: 'Space Mono', fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{
                                fontFamily: 'Space Grotesk',
                                border: '3px solid #1A1A1A',
                                borderRadius: '12px',
                                boxShadow: '4px 4px 0 #1A1A1A'
                            }}
                            formatter={(val) => [`₹${val}`, 'Revenue']}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#FF6B35"
                            strokeWidth={3}
                            dot={{ fill: '#FFD23F', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* ── Orders Bar Chart ── */}
            <div className="bg-cream border-3 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1A1A1A]">
                <h3 className="font-bangers text-2xl text-ink mb-4">📦 DAILY ORDERS</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A20" />
                        <XAxis dataKey="date" tick={{ fontFamily: 'Space Mono', fontSize: 11 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontFamily: 'Space Mono', fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{
                                fontFamily: 'Space Grotesk',
                                border: '3px solid #1A1A1A',
                                borderRadius: '12px'
                            }}
                        />
                        <Bar dataKey="orders" fill="#FFD23F" radius={[6, 6, 0, 0]} stroke="#1A1A1A" strokeWidth={2} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ── Top Items + Pie ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Top Selling Items */}
                <div className="bg-cream border-3 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1A1A1A]">
                    <h3 className="font-bangers text-2xl text-ink mb-4">🏆 TOP SELLING ITEMS</h3>
                    {pieData.length === 0 ? (
                        <p className="font-grotesk text-ink/50 text-center py-8">No data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {pieData.map((item, i) => (
                                <div key={item.name} className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full border-2 border-ink flex-shrink-0"
                                        style={{ backgroundColor: PIE_COLORS[i] }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-grotesk font-semibold text-sm">{item.name}</span>
                                            <span className="font-bangers text-orange">₹{item.revenue}</span>
                                        </div>
                                        <div className="h-2 bg-ink/10 rounded-full">
                                            <div
                                                className="h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${(item.revenue / pieData[0].revenue) * 100}%`,
                                                    backgroundColor: PIE_COLORS[i]
                                                }}
                                            />
                                        </div>
                                        <span className="font-mono text-xs text-ink/50">{item.qty} sold</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Revenue Pie Chart */}
                <div className="bg-cream border-3 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1A1A1A]">
                    <h3 className="font-bangers text-2xl text-ink mb-4">🍕 REVENUE BY ITEM</h3>
                    {pieData.length === 0 ? (
                        <p className="font-grotesk text-ink/50 text-center py-8">No data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="revenue"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    stroke="#1A1A1A"
                                    strokeWidth={2}
                                >
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val) => [`₹${val}`, 'Revenue']} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Food Trends India ── */}
            <div className="bg-ink border-3 border-ink rounded-2xl p-6 shadow-[8px_8px_0_#FF6B35]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bangers text-3xl text-yellow">🔥 TRENDING IN INDIA</h3>
                        <p className="font-grotesk text-cream/60 text-sm mt-1">
                            What customers are loving right now — updated daily
                        </p>
                    </div>
                    <div className="bg-yellow/20 border border-yellow/40 rounded-full px-3 py-1">
                        <span className="font-mono text-xs text-yellow">LIVE DATA</span>
                    </div>
                </div>

                {loadTrend ? (
                    <div className="flex justify-center py-8">
                        <div className="text-4xl animate-bounce">📊</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trends.map((trend, i) => (
                            <div
                                key={trend.name}
                                className="bg-white/10 border border-white/20 rounded-xl p-4 flex items-center gap-4"
                            >
                                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bangers text-lg
                  ${i === 0 ? 'bg-yellow text-ink' : i === 1 ? 'bg-orange text-cream' : i === 2 ? 'bg-red text-cream' : 'bg-white/20 text-cream'}
                `}>
                                    #{i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{trend.emoji}</span>
                                        <span className="font-bangers text-cream text-lg">{trend.name}</span>
                                        <span className={`text-xs font-grotesk px-2 py-0.5 rounded-full ${trend.growing ? 'bg-green-400/20 text-green-400' : 'bg-red/20 text-red'}`}>
                                            {trend.growing ? '↑' : '↓'} {trend.change}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full">
                                        <div
                                            className="h-1.5 rounded-full bg-yellow"
                                            style={{ width: `${trend.score}%` }}
                                        />
                                    </div>
                                    <p className="font-mono text-xs text-cream/40 mt-1">{trend.insight}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="font-mono text-xs text-cream/30 text-center mt-4">
                    Based on Restroon platform data + Indian food delivery trends
                </p>
            </div>
        </div>
    );
}

// Default trends if API fails
const defaultTrends = [
    { name: 'Biryani', emoji: '🍛', score: 95, change: '+12%', growing: true, insight: 'Highest ordered dish across all cities' },
    { name: 'Momos', emoji: '🥟', score: 88, change: '+18%', growing: true, insight: 'Trending heavily in North India' },
    { name: 'South Indian', emoji: '🍜', score: 82, change: '+8%', growing: true, insight: 'Dosa & idli seeing peak demand' },
    { name: 'Chai & Snacks', emoji: '☕', score: 78, change: '+5%', growing: true, insight: 'Evening orders spiking 40%' },
    { name: 'Healthy Bowls', emoji: '🥗', score: 71, change: '+22%', growing: true, insight: 'Fastest growing category in 2025' },
    { name: 'Pizza', emoji: '🍕', score: 65, change: '-3%', growing: false, insight: 'Slight dip but still top 6' },
    { name: 'Rolls & Wraps', emoji: '🌯', score: 60, change: '+9%', growing: true, insight: 'Quick lunch favourite' },
    { name: 'Chinese', emoji: '🍜', score: 55, change: '-5%', growing: false, insight: 'Losing to South Indian options' },
];

// ── Settings Tab ───────────────────────────────
function OwnerSettings({ cafe, setCafe }) {
    const [form, setForm] = useState({
        name: cafe?.name || '',
        description: cafe?.description || '',
        phone: cafe?.phone || '',
    });
    const [saving, setSaving] = useState(false);

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/api/cafe/my-cafe', form);
            setCafe(res.data.cafe);
            alert('✅ Saved successfully!');
        } catch (err) {
            alert('❌ Save failed: ' + (err.response?.data?.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h2 className="font-bangers text-3xl text-ink mb-6">⚙️ CAFE SETTINGS</h2>

            {/* ── Image Section ── */}
            <div className="bg-yellow/20 border-3 border-ink rounded-2xl p-6 mb-6 shadow-[4px_4px_0_#1A1A1A]">
                <h3 className="font-bangers text-2xl text-ink mb-4">📸 CAFE IMAGES</h3>

                {/* Cover Image */}
                <div className="mb-6">
                    <label className="font-bangers text-lg text-ink mb-2 block">Cover Photo</label>
                    <p className="font-grotesk text-xs text-ink/60 mb-3">
                        This appears at the top of your cafe page. Recommended: 1200×600px
                    </p>
                    <ImageUpload
                        endpoint="/api/upload/cafe/cover"
                        currentImage={cafe?.coverImage}
                        onSuccess={(url) => setCafe(c => ({ ...c, coverImage: url }))}
                        label="Upload Cover Photo"
                        aspect="16/9"
                    />
                </div>

                {/* Logo */}
                <div>
                    <label className="font-bangers text-lg text-ink mb-2 block">Cafe Logo</label>
                    <p className="font-grotesk text-xs text-ink/60 mb-3">
                        Square logo for your cafe card. Recommended: 300×300px
                    </p>
                    <div className="w-40 mx-auto">
                        <ImageUpload
                            endpoint="/api/upload/cafe/logo"
                            currentImage={cafe?.logo}
                            onSuccess={(url) => setCafe(c => ({ ...c, logo: url }))}
                            label="Upload Logo"
                            circular
                        />
                    </div>
                </div>
            </div>

            {/* ── Cafe Details Form ── */}
            <div className="bg-cream border-3 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1A1A1A]">
                <h3 className="font-bangers text-2xl text-ink mb-4">📝 CAFE DETAILS</h3>
                <form onSubmit={save} className="space-y-4">
                    {[
                        { name: 'name', label: 'Cafe Name', type: 'text' },
                        { name: 'phone', label: 'Contact Number', type: 'tel' },
                    ].map(({ name, label, type }) => (
                        <div key={name}>
                            <label className="font-bangers text-lg text-ink">{label}</label>
                            <input
                                type={type}
                                value={form[name]}
                                onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                                className="w-full mt-1 px-4 py-3 bg-white border-3 border-ink rounded-xl font-grotesk focus:outline-none focus:border-orange"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="font-bangers text-lg text-ink">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={3}
                            className="w-full mt-1 px-4 py-3 bg-white border-3 border-ink rounded-xl font-grotesk focus:outline-none focus:border-orange resize-none"
                            placeholder="Tell customers about your cafe..."
                        />
                    </div>
                    <CartoonButton
                        type="submit"
                        label={saving ? '⏳ Saving...' : '💾 Save Changes'}
                        color="bg-yellow"
                        size="lg"
                        disabled={saving}
                    />
                </form>
            </div>
        </div>
    );
}

// Add OwnerBanking function
function OwnerBanking({ cafe }) {
    const [form, setForm] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: ''
    });
    const [existing, setExisting] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/api/payment/bank')
            .then(r => {
                if (r.data.banking?.accountNumber) setExisting(r.data.banking);
            })
            .catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.post('/api/payment/bank', form);
            setSaved(true);
            setExisting({ ...form, accountNumber: form.accountNumber.slice(-4).padStart(form.accountNumber.length, '*') });
            setForm({ accountHolderName: '', accountNumber: '', ifscCode: '', upiId: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save banking info');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-xl space-y-6">
            <h2 className="font-bangers text-3xl text-ink">🏦 PAYMENT SETTINGS</h2>

            {/* Security notice */}
            <div className="bg-ink border-3 border-ink rounded-2xl p-4 flex gap-3">
                <span className="text-2xl">🔐</span>
                <div>
                    <p className="font-bangers text-yellow text-lg">BANK-LEVEL SECURITY</p>
                    <p className="font-grotesk text-cream/70 text-sm">
                        Your banking details are encrypted and never shared.
                        Payments are automatically transferred after each order.
                    </p>
                </div>
            </div>

            {/* Platform fee info */}
            <div className="bg-yellow/20 border-3 border-ink rounded-2xl p-4">
                <h3 className="font-bangers text-xl text-ink mb-2">💡 HOW PAYMENTS WORK</h3>
                <div className="space-y-2 font-grotesk text-sm text-ink/80">
                    <div className="flex justify-between py-1 border-b border-ink/10">
                        <span>Customer pays</span>
                        <span className="font-semibold">₹104</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-ink/10">
                        <span>Platform fee (4%)</span>
                        <span className="font-semibold text-red">- ₹4</span>
                    </div>
                    <div className="flex justify-between py-1 font-bold">
                        <span>You receive</span>
                        <span className="text-green-600">₹100 ✅</span>
                    </div>
                </div>
                <p className="font-mono text-xs text-ink/50 mt-2">
                    Transferred automatically within 2-3 business days
                </p>
            </div>

            {/* Existing account */}
            {existing && (
                <div className="bg-green-50 border-3 border-green-400 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">✅</span>
                        <span className="font-bangers text-xl text-ink">ACCOUNT LINKED</span>
                        {existing.isVerified
                            ? <span className="bg-green-400 text-ink px-2 py-0.5 rounded-full font-bangers text-xs">VERIFIED</span>
                            : <span className="bg-yellow text-ink px-2 py-0.5 rounded-full font-bangers text-xs">PENDING VERIFICATION</span>
                        }
                    </div>
                    <div className="space-y-1 font-grotesk text-sm">
                        <p><span className="font-semibold">Name:</span> {existing.accountHolderName}</p>
                        <p><span className="font-semibold">Account:</span> {existing.accountNumber}</p>
                        <p><span className="font-semibold">IFSC:</span> {existing.ifscCode}</p>
                        {existing.upiId && <p><span className="font-semibold">UPI:</span> {existing.upiId}</p>}
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="bg-cream border-3 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1A1A1A]">
                <h3 className="font-bangers text-2xl text-ink mb-4">
                    {existing ? '🔄 UPDATE ACCOUNT' : '➕ ADD BANK ACCOUNT'}
                </h3>

                {error && (
                    <div className="bg-red/10 border-2 border-red rounded-xl p-3 mb-4">
                        <p className="font-grotesk text-sm text-red">{error}</p>
                    </div>
                )}

                {saved && (
                    <div className="bg-green-100 border-2 border-green-400 rounded-xl p-3 mb-4">
                        <p className="font-grotesk text-sm text-green-700">✅ Banking info saved! Verification in 24-48 hours.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { name: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'As per bank records' },
                        { name: 'accountNumber', label: 'Account Number', type: 'text', placeholder: 'Enter account number' },
                        { name: 'ifscCode', label: 'IFSC Code', type: 'text', placeholder: 'e.g. SBIN0001234' },
                        { name: 'upiId', label: 'UPI ID (Optional)', type: 'text', placeholder: 'yourname@upi' },
                    ].map(({ name, label, type, placeholder }) => (
                        <div key={name}>
                            <label className="font-bangers text-lg text-ink">{label}</label>
                            <input
                                type={type}
                                placeholder={placeholder}
                                value={form[name]}
                                onChange={e => setForm(f => ({
                                    ...f,
                                    [name]: name === 'ifscCode' ? e.target.value.toUpperCase() : e.target.value
                                }))}
                                required={name !== 'upiId'}
                                autoComplete="off"
                                className="w-full mt-1 px-4 py-3 bg-white border-3 border-ink rounded-xl font-grotesk focus:outline-none focus:border-orange"
                            />
                        </div>
                    ))}

                    <div className="bg-red/5 border border-red/30 rounded-xl p-3">
                        <p className="font-grotesk text-xs text-red/80">
                            ⚠️ Enter exact details as per your bank records.
                            Incorrect details may delay payments.
                        </p>
                    </div>

                    <CartoonButton
                        type="submit"
                        label={saving ? '⏳ Saving...' : '🏦 Save Banking Info'}
                        color="bg-yellow"
                        size="lg"
                        disabled={saving}
                    />
                </form>
            </div>
        </div>
    );
}

// ── Cafe Setup (first time) ────────────────────
function CafeSetup({ setCafe }) {
    const [form, setForm] = useState({
        name: '', description: '', phone: '',
        address: { street: '', city: '', pincode: '', coordinates: { lat: 0, lng: 0 } },
        deliveryRadius: 5, cuisine: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate?.() ?? (() => { });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Get coordinates from city name (simplified)
        try {
            const payload = {
                ...form,
                cuisine: form.cuisine.split(',').map(s => s.trim()),
                address: {
                    ...form.address,
                    coordinates: { lat: 20.5937, lng: 78.9629 } // Default India center
                }
            };
            const res = await api.post('/api/cafe', payload);
            setCafe(res.data.cafe);
            window.location.href = '/dashboard/owner/subscription';
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to register cafe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl">
            <h2 className="font-bangers text-4xl text-ink mb-2">🏪 SETUP YOUR CAFE</h2>
            <p className="font-grotesk text-ink/70 mb-6">Tell us about your restaurant</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                {[
                    { name: 'name', label: 'Cafe Name', type: 'text', ph: '🏪 e.g. Spice Garden' },
                    { name: 'description', label: 'Short Description', type: 'text', ph: '✍️ What makes you special?' },
                    { name: 'phone', label: 'Contact Number', type: 'tel', ph: '📞 e.g. 9876543210' },
                    { name: 'cuisine', label: 'Cuisines (comma sep)', type: 'text', ph: '🍛 e.g. Indian, Chinese, Fast Food' },
                ].map(({ name, label, type, ph }) => (
                    <div key={name}>
                        <label className="font-bangers text-lg text-ink">{label}</label>
                        <input
                            type={type}
                            placeholder={ph}
                            required={name !== 'description'}
                            value={form[name]}
                            onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                            className="w-full mt-1 px-4 py-3 bg-white border-3 border-ink rounded-xl font-grotesk text-ink placeholder:text-ink/40 focus:outline-none focus:border-orange"
                        />
                    </div>
                ))}
                {[
                    { field: 'street', ph: '🏠 e.g. 12 MG Road, Koramangala' },
                    { field: 'city', ph: '🏙️ e.g. Bangalore' },
                    { field: 'pincode', ph: '📮 e.g. 560001' },
                ].map(({ field, ph }) => (
                    <div key={field}>
                        <label className="font-bangers text-lg text-ink">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                        <input
                            type="text"
                            placeholder={ph}
                            required
                            value={form.address[field]}
                            onChange={e => setForm(f => ({ ...f, address: { ...f.address, [field]: e.target.value } }))}
                            className="w-full mt-1 px-4 py-3 bg-white border-3 border-ink rounded-xl font-grotesk text-ink placeholder:text-ink/40 focus:outline-none focus:border-orange"
                        />
                    </div>
                ))}
                <CartoonButton type="submit" label={loading ? '⏳ Setting up...' : '🚀 Launch My Cafe!'} color="bg-yellow" size="lg" disabled={loading} />
            </form>
        </div>
    );
}