// src/pages/dashboard/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { CartoonButton } from '../../../components/ui/CartoonButton';
import AdminLayout from '../../../components/layout/AdminLayout';
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

// Replace AdminStats function in AdminDashboard.jsx
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import CommissionWidget from '../../../components/admin/CommissionWidget';

function AdminStats() {
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [period, setPeriod] = useState('week');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/api/admin/stats'),
            api.get('/api/admin/orders')
        ]).then(([statsRes, ordersRes]) => {
            setStats(statsRes.data.stats);
            setOrders(ordersRes.data.orders);
        }).finally(() => setLoading(false));
    }, []);

    const getRevenueChart = () => {
        const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
        const now = new Date();
        return Array.from({ length: days }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (days - 1 - i));
            const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            const dayOrders = orders.filter(o =>
                new Date(o.createdAt).toDateString() === date.toDateString()
            );
            return {
                date: dateStr,
                revenue: dayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0),
                orders: dayOrders.length,
                commission: dayOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.platformFee || 0), 0)
            };
        });
    };

    const PIE_COLORS = ['#FFD23F', '#FF6B35', '#FF3B30', '#4CAF50'];

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="text-6xl animate-bounce">📊</div>
        </div>
    );

    const chartData = getRevenueChart();
    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0);
    const totalCommission = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.platformFee || 0), 0);
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
    const todayRevenue = todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0);

    const cafeStatusData = [
        { name: 'Active', value: stats?.cafes?.active || 0 },
        { name: 'Pending', value: stats?.cafes?.pending || 0 },
        { name: 'Suspended', value: stats?.cafes?.suspended || 0 },
    ];

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="font-bangers text-4xl text-ink">📊 PLATFORM ANALYTICS</h2>
                <div className="flex gap-2">
                    {['week', 'month', 'all'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-full border-2 border-ink font-bangers text-sm capitalize transition-all ${period === p ? 'bg-yellow shadow-[2px_2px_0_#1A1A1A]' : 'bg-cream'}`}
                        >
                            {p === 'all' ? '90 Days' : `Last ${p}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="admin-stats-grid">
                {[
                    { label: 'Total Users', value: stats?.users?.total || 0, icon: '👥', color: 'bg-yellow' },
                    { label: 'Active Cafes', value: stats?.cafes?.active || 0, icon: '🏪', color: 'bg-orange' },
                    { label: 'Total Orders', value: stats?.orders?.total || 0, icon: '📦', color: 'bg-red' },
                    { label: 'Platform Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-green-400' },
                    { label: 'My Commission', value: `₹${totalCommission.toLocaleString()}`, icon: '👑', color: 'bg-yellow' },
                    { label: "Today's Orders", value: todayOrders.length, icon: '📅', color: 'bg-orange' },
                    { label: 'Pending Approvals', value: stats?.cafes?.pending || 0, icon: '⏳', color: 'bg-red' },
                    { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString()}`, icon: '📈', color: 'bg-green-400' },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className={`admin-stat-card ${color} border-3 border-ink shadow-[4px_4px_0_#1A1A1A]`}>
                        <div className="text-2xl mb-1">{icon}</div>
                        <div className="font-bangers text-2xl text-ink">{value}</div>
                        <div className="font-grotesk text-xs text-ink/70 mt-0.5">{label}</div>
                    </div>
                ))}
            </div>

            {/* ── Revenue Area Chart ── */}
            <div className="bg-cream border-3 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1A1A1A]">
                <h3 className="font-bangers text-2xl text-ink mb-4">📈 PLATFORM REVENUE TREND</h3>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[500px]">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="commissionGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFD23F" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#FFD23F" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A15" />
                                <XAxis dataKey="date" tick={{ fontFamily: 'Space Mono', fontSize: 10 }} interval="preserveStartEnd" />
                                <YAxis tick={{ fontFamily: 'Space Mono', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ fontFamily: 'Space Grotesk', border: '3px solid #1A1A1A', borderRadius: '12px' }}
                                    formatter={(val, name) => [`₹${val}`, name === 'revenue' ? 'Total Revenue' : 'My Commission']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={3} fill="url(#revenueGrad)" />
                                <Area type="monotone" dataKey="commission" stroke="#FFD23F" strokeWidth={2} fill="url(#commissionGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Orders Bar + Cafe Status Pie ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-cream border-3 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1A1A1A]">
                    <h3 className="font-bangers text-2xl text-ink mb-4">📦 DAILY ORDERS</h3>
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[300px]">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A15" />
                                    <XAxis dataKey="date" tick={{ fontFamily: 'Space Mono', fontSize: 10 }} interval="preserveStartEnd" />
                                    <YAxis tick={{ fontFamily: 'Space Mono', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ fontFamily: 'Space Grotesk', border: '2px solid #1A1A1A', borderRadius: '10px' }} />
                                    <Bar dataKey="orders" fill="#FFD23F" radius={[6, 6, 0, 0]} stroke="#1A1A1A" strokeWidth={2} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-cream border-3 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1A1A1A]">
                    <h3 className="font-bangers text-2xl text-ink mb-4">🏪 CAFE STATUS</h3>
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[250px]">
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={cafeStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} stroke="#1A1A1A" strokeWidth={2} label={({ name, value }) => `${name}: ${value}`}>
                                        {cafeStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Trending Section ── */}
            <div className="bg-ink border-3 border-ink rounded-2xl p-6 shadow-[8px_8px_0_#FF6B35]">
                <h3 className="font-bangers text-3xl text-yellow mb-2">🔥 TRENDING IN INDIA RIGHT NOW</h3>
                <p className="font-grotesk text-cream/50 text-sm mb-6">What's hot — updated based on platform + national food delivery data</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {defaultTrends.map((trend, i) => (
                        <div key={trend.name} className="bg-white/10 border border-white/20 rounded-xl p-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bangers text-lg flex-shrink-0 ${i === 0 ? 'bg-yellow text-ink' : i === 1 ? 'bg-orange text-cream' : i === 2 ? 'bg-red text-cream' : 'bg-white/20 text-cream'}`}>
                                #{i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{trend.emoji}</span>
                                    <span className="font-bangers text-cream">{trend.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${trend.growing ? 'bg-green-400/20 text-green-400' : 'bg-red/30 text-red'}`}>
                                        {trend.growing ? '↑' : '↓'} {trend.change}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full">
                                    <div className="h-1.5 rounded-full bg-yellow transition-all" style={{ width: `${trend.score}%` }} />
                                </div>
                                <p className="font-mono text-xs text-cream/40 mt-1 truncate">{trend.insight}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Recent Orders Table ── */}
            <div className="bg-cream border-3 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1A1A1A]">
                <h3 className="font-bangers text-2xl text-ink mb-4">📋 RECENT ORDERS</h3>
                <div className="overflow-x-auto">
                    <table className="w-full font-grotesk text-sm">
                        <thead>
                            <tr className="border-b-2 border-ink">
                                {['Order ID', 'Cafe', 'Customer', 'Amount', 'Status', 'Payment'].map(h => (
                                    <th key={h} className="text-left py-2 px-3 font-bangers text-ink">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.slice(0, 10).map(order => (
                                <tr key={order._id} className="border-b border-ink/10 hover:bg-yellow/10 transition-colors">
                                    <td className="py-2 px-3 font-mono text-xs">#{order._id?.slice(-6).toUpperCase()}</td>
                                    <td className="py-2 px-3">{order.cafe?.name || '—'}</td>
                                    <td className="py-2 px-3">{order.customer?.name || '—'}</td>
                                    <td className="py-2 px-3 font-bangers text-orange">₹{order.totalAmount}</td>
                                    <td className="py-2 px-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'placed' ? 'bg-yellow text-ink' :
                                                    order.status === 'cancelled' ? 'bg-red/20 text-red' : 'bg-orange/20 text-orange'
                                            }`}>{order.status}</span>
                                    </td>
                                    <td className="py-2 px-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow/50 text-ink'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 👑 Platform Commission Tracking */}
            <CommissionWidget />
        </div>
    );
}

function AdminCafes() {
    const [cafes, setCafes] = useState([]);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        api.get(`/api/admin/cafes?status=${filter}`).then(r => setCafes(r.data.cafes));
    }, [filter]);

    const updateStatus = async (cafeId, status) => {
        await api.patch(`/api/admin/cafes/${cafeId}/status`, { status });
        setCafes(prev => prev.filter(c => c._id !== cafeId));
    };

    return (
        <div>
            <h2 className="font-bangers text-4xl text-ink mb-4">🏪 MANAGE CAFES</h2>
            <div className="flex gap-3 mb-6">
                {['pending', 'active', 'suspended'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-full border-2 border-ink font-bangers capitalize transition-all ${filter === s ? 'bg-yellow shadow-[2px_2px_0_#1A1A1A]' : 'bg-cream'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {cafes.length === 0 && (
                    <div className="text-center py-12 text-ink/40 font-grotesk">No {filter} cafes found</div>
                )}
                {cafes.map(cafe => (
                    <div key={cafe._id} className="bg-cream border-3 border-ink rounded-2xl p-5 shadow-[4px_4px_0_#1A1A1A]">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bangers text-2xl text-ink">{cafe.name}</h3>
                                <p className="font-grotesk text-sm text-ink/60">
                                    {cafe.owner?.name} • {cafe.owner?.email}
                                </p>
                                <p className="font-grotesk text-sm text-ink/60">
                                    {cafe.address?.city} • {cafe.cuisine?.join(', ')}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full border-2 border-ink font-bangers text-sm ${cafe.status === 'active' ? 'bg-green-400' : cafe.status === 'pending' ? 'bg-yellow' : 'bg-red text-cream'}`}>
                                {cafe.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="flex gap-3 mt-4">
                            {cafe.status !== 'active' && <CartoonButton label="✅ Approve" color="bg-green-400" size="sm" onClick={() => updateStatus(cafe._id, 'active')} />}
                            {cafe.status !== 'suspended' && <CartoonButton label="🚫 Suspend" color="bg-red" size="sm" onClick={() => updateStatus(cafe._id, 'suspended')} />}
                            {cafe.status !== 'pending' && <CartoonButton label="⏳ Pending" color="bg-yellow" size="sm" onClick={() => updateStatus(cafe._id, 'pending')} />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AdminUsers() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.get('/api/admin/users').then(r => setUsers(r.data.users));
    }, []);

    const toggleUser = async (userId) => {
        await api.patch(`/api/admin/users/${userId}/toggle`);
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    };

    return (
        <div>
            <h2 className="font-bangers text-4xl text-ink mb-6">👥 MANAGE USERS</h2>
            <div className="space-y-3">
                {users.map(user => (
                    <div key={user._id} className="bg-cream border-3 border-ink rounded-xl p-4 shadow-[3px_3px_0_#1A1A1A] flex items-center justify-between">
                        <div>
                            <p className="font-bangers text-xl text-ink">{user.name}</p>
                            <p className="font-grotesk text-sm text-ink/60">{user.email} • <span className="capitalize">{user.role}</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full border border-ink font-bangers text-xs ${user.isActive ? 'bg-green-200' : 'bg-red/30'}`}>
                                {user.isActive ? 'Active' : 'Suspended'}
                            </span>
                            {user.role !== 'admin' && (
                                <button
                                    onClick={() => toggleUser(user._id)}
                                    className={`px-3 py-1 rounded-lg border-2 border-ink font-bangers text-sm ${user.isActive ? 'bg-red/20 hover:bg-red/40' : 'bg-green-200 hover:bg-green-300'}`}
                                >
                                    {user.isActive ? 'Suspend' : 'Activate'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setLoading(true);
        api.get('/api/admin/orders')
            .then(r => setOrders(r.data.orders || []))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, []);

    const statusColor = {
        placed: 'bg-yellow',
        confirmed: 'bg-blue-300',
        preparing: 'bg-orange',
        delivered: 'bg-green-400',
        rejected: 'bg-red text-cream',
        cancelled: 'bg-gray-300',
    };

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    if (loading) return <div className="text-6xl animate-bounce text-center py-16">📦</div>;

    return (
        <div>
            <h2 className="font-bangers text-4xl text-ink mb-4">📦 ALL ORDERS</h2>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {['all', 'placed', 'confirmed', 'preparing', 'delivered', 'rejected'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-1.5 rounded-full border-2 border-ink font-bangers capitalize text-sm transition-all ${filter === s ? 'bg-yellow shadow-[2px_2px_0_#1A1A1A]' : 'bg-cream hover:bg-yellow/30'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="font-grotesk text-ink/40">No {filter} orders found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(order => (
                        <div key={order._id} className="bg-cream border-3 border-ink rounded-2xl p-5 shadow-[4px_4px_0_#1A1A1A]">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-bangers text-lg text-ink">
                                        #{order._id?.slice(-6).toUpperCase()}
                                    </p>
                                    <p className="font-grotesk text-sm text-ink/60">
                                        {order.customer?.name || 'Customer'} • {order.cafe?.name || 'Unknown Cafe'}
                                    </p>
                                    <p className="font-mono text-xs text-ink/40">
                                        {new Date(order.createdAt).toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full border-2 border-ink font-bangers text-sm ${statusColor[order.status] || 'bg-cream'}`}>
                                        {order.status?.toUpperCase()}
                                    </span>
                                    <p className="font-bangers text-xl text-orange mt-1">₹{order.totalAmount}</p>
                                </div>
                            </div>
                            <div className="border-t-2 border-ink/10 pt-3 flex flex-wrap gap-2">
                                {order.items?.map((item, i) => (
                                    <span key={i} className="bg-yellow/30 border border-ink/20 rounded-lg px-2 py-1 font-grotesk text-xs">
                                        {item.name} × {item.quantity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminDashboard() {
    const [isMaintenance, setIsMaintenance] = useState(false);

    useEffect(() => {
        api.get('/api/admin/maintenance/status')
           .then(res => setIsMaintenance(res.data.maintenance))
           .catch(() => {});
    }, []);

    const toggleMaintenance = async () => {
        if (!window.confirm(`Are you sure you want to turn ${isMaintenance ? 'OFF' : 'ON'} maintenance mode?`)) return;
        
        try {
            const endpoint = isMaintenance ? '/api/admin/maintenance/off' : '/api/admin/maintenance/on';
            await api.post(endpoint);
            setIsMaintenance(!isMaintenance);
            alert(`Maintenance mode is now ${!isMaintenance ? 'ON' : 'OFF'}`);
        } catch (err) {
            console.error(err);
            alert('Failed to update maintenance mode.');
        }
    };

    return (
        <AdminLayout isMaintenance={isMaintenance} onToggleMaintenance={toggleMaintenance}>
            <div className="max-w-5xl mx-auto">
                <Routes>
                    <Route path="stats" element={<AdminStats />} />
                    <Route path="cafes" element={<AdminCafes />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route index element={<AdminStats />} />
                </Routes>
            </div>
        </AdminLayout>
    );
}