// src/pages/delivery/DeliveryDashboard.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';

// ── Haversine distance (km) — client-side ──
const haversine = (lat1, lon1, lat2, lon2) => {
    const toRad = v => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Sound alert via Web Audio API ──
function playAlert() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.7, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    } catch { }
}

// ── Time ago helper ──
const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

// ── Status badge colors ──
const STATUS_CONFIG = {
    assigned: { label: '🟡 Assigned', bg: 'bg-yellow/60', text: 'text-ink' },
    out_for_delivery: { label: '🔵 On the Way', bg: 'bg-blue-200', text: 'text-blue-900' },
    delivered: { label: '🟢 Delivered', bg: 'bg-green-200', text: 'text-green-900' },
    failed: { label: '🔴 Failed', bg: 'bg-red/20', text: 'text-red' }
};

// ── Priority badge ──
const getPriorityBadge = (order) => {
    if (order.deliveryStatus === 'failed') return { label: '🔵 RETRY', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (order.paymentMethod === 'razorpay' || order.paymentMethod === 'upi') {
        const mins = (Date.now() - new Date(order.createdAt)) / 60000;
        if (mins > 15) return { label: '🔴 URGENT', color: 'bg-red/10 text-red border-red/30' };
    }
    return { label: '🟡 NORMAL', color: 'bg-yellow/30 text-ink border-yellow' };
};

// ═══════════════════════════════════════════
// ORDER CARD
// ═══════════════════════════════════════════
function OrderCard({ order, onStatusUpdate, cafeAddress }) {
    const [expanded, setExpanded] = useState(false);
    const [showFailModal, setShowFailModal] = useState(false);
    const [showCodModal, setShowCodModal] = useState(false);
    const [failNote, setFailNote] = useState('');
    const [updating, setUpdating] = useState(false);

    const status = STATUS_CONFIG[order.deliveryStatus] || STATUS_CONFIG.assigned;
    const priority = getPriorityBadge(order);
    const isPrepaid = order.paymentMethod === 'razorpay' || order.paymentMethod === 'upi';

    // Distance calculation
    const customerLat = order.deliveryAddress?.coordinates?.lat;
    const customerLng = order.deliveryAddress?.coordinates?.lng;
    const cafeLat = cafeAddress?.coordinates?.lat;
    const cafeLng = cafeAddress?.coordinates?.lng;
    const distKm = (cafeLat && cafeLng && customerLat && customerLng)
        ? haversine(cafeLat, cafeLng, customerLat, customerLng).toFixed(1)
        : null;

    // Navigation URL
    const navUrl = customerLat && customerLng
        ? `https://www.google.com/maps/dir/?api=1&destination=${customerLat},${customerLng}&travelmode=driving`
        : order.deliveryAddress?.street
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress.street + ' ' + order.deliveryAddress.city)}`
            : null;

    const handleStatus = async (newStatus, extras = {}) => {
        setUpdating(true);
        try {
            await onStatusUpdate(order._id, newStatus, extras);
        } finally {
            setUpdating(false);
            setShowFailModal(false);
            setShowCodModal(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-cream border-3 border-ink rounded-2xl p-4 shadow-[4px_4px_0_#1A1A1A] relative"
        >
            {/* Status Badge — top right */}
            <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text} border`}>
                {status.label}
            </div>

            {/* TOP ROW — Order ID + Priority + Time */}
            <div className="flex items-start gap-2 mb-3 pr-24">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bangers text-lg text-ink">
                            #{order._id?.slice(-5).toUpperCase()}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${priority.color}`}>
                            {priority.label}
                        </span>
                    </div>
                    <p className="font-grotesk text-xs text-ink/50">
                        Placed {timeAgo(order.createdAt)}
                        {order.deliveryAttempts > 0 && (
                            <span className="ml-2 text-red font-bold">• Attempt {order.deliveryAttempts}</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Payment Badge */}
            <div className="flex gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isPrepaid
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-orange/20 text-orange border-orange/40'
                    }`}>
                    {isPrepaid ? '💳 PREPAID' : '💵 COD'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow/30 border border-ink/20">
                    ₹{order.totalAmount}
                </span>
                {distKm && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700">
                        📍 ~{distKm} km
                    </span>
                )}
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-2 mb-3 bg-yellow/20 border border-ink/10 rounded-xl px-3 py-2">
                <span>👤</span>
                <span className="font-grotesk text-sm font-semibold text-ink flex-1">
                    {order.customerName || order.customer?.name || 'Customer'}
                </span>
                {(order.customerPhone || order.customer?.phone) && (
                    <a
                        href={`tel:${order.customerPhone || order.customer?.phone}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow border-2 border-ink rounded-full font-bangers text-xs shadow-[2px_2px_0_#1A1A1A] hover:shadow-none hover:translate-y-[2px] transition-all"
                    >
                        📞 Call
                    </a>
                )}
            </div>

            {/* Address */}
            <div className="mb-3 bg-white/60 border border-ink/10 rounded-xl px-3 py-2">
                <p className="font-grotesk text-xs text-ink/70">
                    📍 {order.deliveryAddress?.street || ''}{order.deliveryAddress?.city ? `, ${order.deliveryAddress.city}` : ''}
                    {order.deliveryAddress?.pincode ? ` - ${order.deliveryAddress.pincode}` : ''}
                </p>
                {navUrl && (
                    <button
                        onClick={() => window.open(navUrl, '_blank')}
                        className="mt-1.5 flex items-center gap-1 px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-lg font-bangers text-xs text-blue-800 hover:bg-blue-200 transition-colors"
                    >
                        🗺 Navigate
                    </button>
                )}
            </div>

            {/* Cafe Notes */}
            {order.cafeNotes && (
                <div className="mb-3 bg-orange/10 border border-orange/30 rounded-xl px-3 py-2">
                    <p className="font-grotesk text-xs text-ink">
                        📝 <strong>Cafe Note:</strong> {order.cafeNotes}
                    </p>
                </div>
            )}

            {/* Items Accordion */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex justify-between items-center bg-ink/5 rounded-xl px-3 py-2 mb-3 hover:bg-ink/10 transition-colors"
            >
                <span className="font-bangers text-sm text-ink">{order.items?.length || 0} Item(s)</span>
                <span className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-3"
                    >
                        <div className="space-y-1 px-1">
                            {order.items?.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm font-grotesk">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span className="text-orange font-semibold">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t border-ink/10 font-bangers">
                                <span>Total</span>
                                <span className="text-orange">₹{order.totalAmount}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
                {order.deliveryStatus === 'assigned' && (
                    <button
                        onClick={() => handleStatus('out_for_delivery')}
                        disabled={updating}
                        className="flex-1 py-2.5 bg-yellow border-2 border-ink rounded-xl font-bangers text-sm shadow-[3px_3px_0_#1A1A1A] hover:shadow-none hover:translate-y-[3px] transition-all disabled:opacity-50"
                    >
                        🏍️ OUT FOR DELIVERY
                    </button>
                )}
                {order.deliveryStatus === 'out_for_delivery' && (
                    <button
                        onClick={() => {
                            if (order.paymentMethod === 'cod') {
                                setShowCodModal(true);
                            } else {
                                handleStatus('delivered');
                            }
                        }}
                        disabled={updating}
                        className="flex-1 py-2.5 bg-green-400 border-2 border-ink rounded-xl font-bangers text-sm shadow-[3px_3px_0_#1A1A1A] hover:shadow-none hover:translate-y-[3px] transition-all disabled:opacity-50"
                    >
                        ✅ MARK DELIVERED
                    </button>
                )}
                {(order.deliveryStatus === 'assigned' || order.deliveryStatus === 'out_for_delivery' || order.deliveryStatus === 'failed') && (
                    <button
                        onClick={() => setShowFailModal(true)}
                        disabled={updating}
                        className="py-2.5 px-4 bg-white border-2 border-red/50 text-red rounded-xl font-bangers text-sm hover:bg-red/10 transition-all disabled:opacity-50"
                    >
                        ❌ Failed
                    </button>
                )}
            </div>

            {/* COD Confirmation Modal */}
            <AnimatePresence>
                {showCodModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/60 backdrop-blur-sm px-4 pb-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowCodModal(false)}
                    >
                        <motion.div
                            className="bg-cream border-3 border-ink rounded-2xl p-6 w-full max-w-sm shadow-[6px_6px_0_#1A1A1A]"
                            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="font-bangers text-xl text-ink mb-3">💵 Cash Collection</h3>
                            <p className="font-grotesk text-sm text-ink/70 mb-4">
                                Did you collect <strong className="text-orange">₹{order.totalAmount}</strong> cash from the customer?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleStatus('delivered', { paymentCollected: true })}
                                    disabled={updating}
                                    className="flex-1 py-3 bg-green-400 border-2 border-ink rounded-xl font-bangers shadow-[3px_3px_0_#1A1A1A] hover:shadow-none hover:translate-y-[3px] transition-all"
                                >
                                    ✅ Yes, Collected
                                </button>
                                <button
                                    onClick={() => handleStatus('delivered', { paymentCollected: false })}
                                    disabled={updating}
                                    className="flex-1 py-3 bg-orange/20 border-2 border-ink rounded-xl font-bangers shadow-[3px_3px_0_#1A1A1A] hover:shadow-none hover:translate-y-[3px] transition-all"
                                >
                                    ⏳ No, Pending
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Failed Delivery Modal */}
            <AnimatePresence>
                {showFailModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/60 backdrop-blur-sm px-4 pb-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowFailModal(false)}
                    >
                        <motion.div
                            className="bg-cream border-3 border-ink rounded-2xl p-6 w-full max-w-sm shadow-[6px_6px_0_#1A1A1A]"
                            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="font-bangers text-xl text-red mb-3">❌ Failed Delivery</h3>
                            <textarea
                                placeholder="Reason (e.g. Customer not home, Wrong address...)"
                                value={failNote}
                                onChange={e => setFailNote(e.target.value)}
                                className="w-full px-3 py-2 bg-white border-2 border-ink rounded-xl font-grotesk text-sm mb-4 focus:outline-none focus:border-orange resize-none"
                                rows={3}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleStatus('failed', { deliveryNotes: failNote })}
                                    disabled={updating}
                                    className="flex-1 py-3 bg-red text-cream border-2 border-ink rounded-xl font-bangers shadow-[3px_3px_0_#1A1A1A] hover:shadow-none hover:translate-y-[3px] transition-all"
                                >
                                    Submit Failed
                                </button>
                                <button
                                    onClick={() => setShowFailModal(false)}
                                    className="py-3 px-4 bg-white border-2 border-ink rounded-xl font-bangers hover:bg-ink/5 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ═══════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════
export default function DeliveryDashboard() {
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [deliveredToday, setDeliveredToday] = useState(0);
    const [isAvailable, setIsAvailable] = useState(true);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const prevOrderIds = useRef(new Set());
    const titleFlashRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const [profileRes, ordersRes] = await Promise.all([
                api.get('/api/delivery/profile'),
                api.get('/api/delivery/orders')
            ]);

            setProfile(profileRes.data.profile);
            setIsAvailable(profileRes.data.profile.isAvailable);
            setOrders(ordersRes.data.orders);
            setDeliveredToday(ordersRes.data.deliveredToday);
            setLastUpdated(Date.now());

            // Detect new assignments
            const currentIds = new Set(ordersRes.data.orders.map(o => o._id));
            if (prevOrderIds.current.size > 0) {
                const newOrders = ordersRes.data.orders.filter(o => !prevOrderIds.current.has(o._id));
                if (newOrders.length > 0) {
                    playAlert();
                    // Flash tab title
                    if (titleFlashRef.current) clearInterval(titleFlashRef.current);
                    const original = document.title;
                    let show = true;
                    titleFlashRef.current = setInterval(() => {
                        document.title = show ? '🔔 New Order! — Restroon' : original;
                        show = !show;
                    }, 1000);
                    setTimeout(() => {
                        clearInterval(titleFlashRef.current);
                        document.title = original;
                    }, 10000);
                }
            }
            prevOrderIds.current = currentIds;
        } catch (err) {
            console.error('Fetch delivery data error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => {
            clearInterval(interval);
            if (titleFlashRef.current) clearInterval(titleFlashRef.current);
        };
    }, [fetchData]);

    const handleToggleAvailability = async () => {
        const newVal = !isAvailable;
        setIsAvailable(newVal);
        try {
            await api.patch('/api/delivery/availability', { isAvailable: newVal });
        } catch {
            setIsAvailable(!newVal); // revert on error
        }
    };

    const handleStatusUpdate = async (orderId, deliveryStatus, extras = {}) => {
        await api.patch(`/api/delivery/orders/${orderId}/status`, {
            deliveryStatus,
            ...extras
        });
        fetchData();
    };

    const pendingCount = orders.filter(o => ['assigned', 'out_for_delivery'].includes(o.deliveryStatus)).length;
    const cafeAddress = profile?.assignedCafe?.address;

    if (loading) return (
        <div className="min-h-screen retro-grid flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl animate-bounce mb-4">🛵</div>
                <p className="font-bangers text-3xl text-ink">Loading...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen retro-grid">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 pt-20 pb-24">

                {/* ─── Header ─────────────────────────── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="font-bangers text-3xl text-ink">🛵 MY DELIVERIES</h1>
                        {profile?.assignedCafe && (
                            <p className="font-grotesk text-xs text-ink/50 mt-0.5">
                                {profile.assignedCafe.name}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleToggleAvailability}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 border-ink font-bangers text-sm shadow-[3px_3px_0_#1A1A1A] transition-all ${isAvailable
                            ? 'bg-green-400 hover:bg-green-300'
                            : 'bg-gray-300 hover:bg-gray-200'
                            }`}
                    >
                        {isAvailable ? '🟢 Online' : '⚫ Offline'}
                    </button>
                </div>

                {/* ─── Stats Strip ────────────────────── */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-cream border-3 border-ink rounded-2xl p-3 text-center shadow-[3px_3px_0_#1A1A1A]">
                        <div className="text-2xl mb-1">📦</div>
                        <div className="font-bangers text-2xl text-ink">{pendingCount}</div>
                        <div className="font-grotesk text-[10px] text-ink/50 uppercase">Pending</div>
                    </div>
                    <div className="bg-cream border-3 border-ink rounded-2xl p-3 text-center shadow-[3px_3px_0_#1A1A1A]">
                        <div className="text-2xl mb-1">✅</div>
                        <div className="font-bangers text-2xl text-ink">{deliveredToday}</div>
                        <div className="font-grotesk text-[10px] text-ink/50 uppercase">Today</div>
                    </div>
                    <div className="bg-cream border-3 border-ink rounded-2xl p-3 text-center shadow-[3px_3px_0_#1A1A1A]">
                        <div className="text-2xl mb-1">🏍️</div>
                        <div className="font-bangers text-2xl text-ink">{profile?.totalDeliveries || 0}</div>
                        <div className="font-grotesk text-[10px] text-ink/50 uppercase">Total</div>
                    </div>
                </div>

                {/* ─── Orders ────────────────────────── */}
                {orders.length === 0 ? (
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                        <div className="text-7xl mb-4">🛵</div>
                        <p className="font-bangers text-2xl text-ink/50 mb-2">No deliveries right now</p>
                        <p className="font-grotesk text-sm text-ink/40">
                            Stay available and new orders will appear here.
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {orders.map(order => (
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    onStatusUpdate={handleStatusUpdate}
                                    cafeAddress={cafeAddress}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* ─── Last Updated Footer ───────────── */}
                <div className="text-center mt-8">
                    <p className="font-grotesk text-xs text-ink/30">
                        🔄 Last updated {Math.floor((Date.now() - lastUpdated) / 1000)}s ago • Auto-refreshes every 30s
                    </p>
                </div>
            </div>
        </div>
    );
}
