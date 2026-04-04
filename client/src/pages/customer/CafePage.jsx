// src/pages/customer/CafePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import { CartoonButton } from '../../components/ui/CartoonButton';
import { RazorpayCheckout } from './RazorpayCheckout';

export default function CafePage() {
    const { slug } = useParams();
    const [cafe, setCafe] = useState(null);
    const [menu, setMenu] = useState([]);
    const [category, setCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(false);
    const [address, setAddress] = useState({ street: '', city: '', pincode: '' });
    const [orderType, setOrderType] = useState('delivery');
    const [placedOrderId, setPlacedOrderId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [showSavePrompt, setShowSavePrompt] = useState(false); // save-address prompt
    const [savedOrderId, setSavedOrderId] = useState(null);     // orderId after COD success

    const cartRef = useRef(null);

    const { cart, cafeId, total, count, addToCart, updateQty, decreaseQty, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            api.get(`/api/cafe/slug/${slug}`),
        ]).then(([cafeRes]) => {
            setCafe(cafeRes.data.cafe);
            return api.get(`/api/menu/cafe/${cafeRes.data.cafe._id}`);
        }).then(menuRes => {
            setMenu(menuRes.data.menuItems);
        }).finally(() => setLoading(false));
    }, [slug]);

    // Pre-fill from user profile (phone + saved address)
    useEffect(() => {
        if (!user) return;
        if (user.name) setCustomerName(user.name);
        if (user.phone) setCustomerPhone(user.phone);
        if (user.defaultAddress?.street || user.defaultAddress?.city) {
            setAddress({
                street: user.defaultAddress.street || '',
                city:   user.defaultAddress.city   || '',
                pincode: user.defaultAddress.pincode || ''
            });
        }
    }, [user]);

    const categories = ['All', ...new Set(menu.map(m => m.category))];

    const filteredMenu = category === 'All'
        ? menu
        : menu.filter(m => m.category === category);

    const cartItems = cafeId === cafe?._id ? cart : [];

    const scrollToCart = () => {
        cartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // ── Shared order payload builder ──────────────────────
    const buildOrderPayload = (method) => ({
        cafeId: cafe._id,
        items: cart.map(i => ({ menuItemId: i.menuItem, quantity: i.quantity })),
        paymentMethod: method,
        orderType,
        deliveryAddress: orderType === 'delivery' ? address : null,
        note: orderType === 'dine_in' ? 'Dine-in order' : '',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
    });

    // ── COD order ─────────────────────────────────────────
    const placeOrder = async () => {
        if (!user) { navigate('/login'); return; }
        if (cart.length === 0) return;
        setOrdering(true);
        try {
            const res = await api.post('/api/order', buildOrderPayload('cod'));
            clearCart();
            // Show save-address prompt if address was entered and not yet saved
            const hasSavedAddr = user?.defaultAddress?.city;
            if (orderType === 'delivery' && address.city && !hasSavedAddr) {
                setSavedOrderId(res.data.order._id);
                setShowSavePrompt(true);
            } else {
                navigate(`/order-confirmation/${res.data.order._id}`);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Order failed');
        } finally {
            setOrdering(false);
        }
    };

    // ── Save address then navigate ─────────────────────────
    const saveAddressAndNavigate = async () => {
        try {
            await api.put('/api/auth/profile', {
                phone: customerPhone.trim(),
                defaultAddress: address
            });
        } catch (_) { /* non-critical */ }
        setShowSavePrompt(false);
        navigate(`/order-confirmation/${savedOrderId}`);
    };

    const skipSaveAndNavigate = () => {
        setShowSavePrompt(false);
        navigate(`/order-confirmation/${savedOrderId}`);
    };

    // ── Create pending order for online payment ───────────
    const createPendingOrder = async () => {
        if (!user) { navigate('/login'); return; }
        setOrdering(true);
        try {
            const res = await api.post('/api/order', buildOrderPayload(paymentMethod));
            setPlacedOrderId(res.data.order._id);
            if (paymentMethod === 'upi') {
                navigate(`/payment/upi/${res.data.order._id}`);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed');
        } finally {
            setOrdering(false);
        }
    };

    const isAddressValid = orderType !== 'delivery' || (address.street && address.city);
    const isFormValid = customerName.trim() && customerPhone.trim() && isAddressValid;

    if (loading) return (
        <div className="min-h-screen retro-grid flex items-center justify-center">
            <div className="text-6xl animate-bounce">🛵</div>
        </div>
    );

    if (!cafe) return (
        <div className="min-h-screen retro-grid flex items-center justify-center">
            <p className="font-bangers text-4xl text-ink">Cafe not found 😔</p>
        </div>
    );

    return (
        <div className="min-h-screen retro-grid">
            <Navbar />

            {/* ── Save-Address Modal ───────────────── */}
            <AnimatePresence>
                {showSavePrompt && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-cream border-4 border-ink rounded-3xl p-6 max-w-sm w-full shadow-[8px_8px_0_#FF6B35]"
                            initial={{ scale: 0.8, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                        >
                            <h2 className="font-bangers text-2xl text-ink mb-2">📍 Save Address?</h2>
                            <p className="font-grotesk text-sm text-ink/70 mb-4">
                                Save <strong>{address.street}, {address.city}</strong> so you don't retype it next time.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={saveAddressAndNavigate}
                                    className="flex-1 py-2 bg-yellow border-2 border-ink rounded-xl font-bangers shadow-[2px_2px_0_#1A1A1A] hover:shadow-none transition-all"
                                >
                                    ✅ Save
                                </button>
                                <button
                                    onClick={skipSaveAndNavigate}
                                    className="flex-1 py-2 bg-cream border-2 border-ink rounded-xl font-bangers"
                                >
                                    Skip
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Sticky Cart Icon (mobile only) ──────────── */}
            {count > 0 && (
                <button
                    onClick={scrollToCart}
                    className="md:hidden fixed top-20 right-4 z-50 bg-ink border-3 border-ink rounded-2xl w-14 h-14 flex flex-col items-center justify-center shadow-[4px_4px_0_#FF6B35] active:translate-y-1 active:shadow-[2px_2px_0_#FF6B35] transition-all"
                    aria-label="View Cart"
                >
                    <span className="text-2xl">🛒</span>
                    <span className="bg-yellow text-ink font-bangers text-xs rounded-full px-1.5 leading-tight -mt-1">
                        {count}
                    </span>
                </button>
            )}

            {/* Hero */}
            <div className="relative h-72 bg-gradient-to-br from-yellow to-orange">
                {cafe.coverImage && <img src={cafe.coverImage} className="w-full h-full object-cover" loading="lazy" decoding="async" alt="" />}
                <div className="absolute inset-0 bg-ink/40" />
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-end gap-4">
                        <div className="w-20 h-20 bg-yellow border-4 border-cream rounded-2xl flex items-center justify-center text-4xl shadow-[4px_4px_0_#1A1A1A]">
                            {cafe.logo ? <img src={cafe.logo} className="w-full h-full rounded-xl object-cover" loading="lazy" decoding="async" alt="" /> : '🏪'}
                        </div>
                        <div>
                            <h1 className="font-bangers text-4xl text-cream">{cafe.name}</h1>
                            <p className="font-grotesk text-cream/80">{cafe.address?.city} • {cafe.deliveryRadius}km delivery</p>
                            <div className={`inline-block mt-1 px-3 py-1 rounded-full font-bangers text-sm border-2 border-cream ${cafe.isOpen ? 'bg-green-400 text-ink' : 'bg-red text-cream'}`}>
                                {cafe.isOpen ? '✅ OPEN NOW' : '❌ CLOSED'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Menu ─────────────────────────────────── */}
                <div className="lg:col-span-2">
                    {/* Category Filter */}
                    <div className="flex gap-3 overflow-x-auto pb-3 mb-6">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`
                  px-4 py-2 rounded-full border-2 border-ink font-bangers text-lg whitespace-nowrap transition-all
                  ${category === cat
                                        ? 'bg-yellow shadow-[3px_3px_0_#1A1A1A] -translate-y-0.5'
                                        : 'bg-cream hover:bg-yellow/50'
                                    }
                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                        {filteredMenu.map(item => {
                            const cartItem = cartItems.find(i => i.menuItem === item._id);
                            return (
                                <motion.div
                                    key={item._id}
                                    className="bg-cream border-3 border-ink rounded-2xl p-4 flex items-center gap-4 shadow-[4px_4px_0_#1A1A1A]"
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="w-20 h-20 bg-yellow rounded-xl border-2 border-ink flex-shrink-0 overflow-hidden">
                                        {item.image
                                            ? <img src={item.image} className="w-full h-full object-cover" loading="lazy" decoding="async" alt="" />
                                            : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bangers text-xl text-ink">{item.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-grotesk ${item.isVeg ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red/10 border-red text-red'}`}>
                                                {item.isVeg ? '🟢 Veg' : '🔴 Non-veg'}
                                            </span>
                                            {item.isBestSeller && <span className="bg-yellow border border-ink rounded-full px-2 py-0.5 font-bangers text-xs">⭐ BEST</span>}
                                        </div>
                                        <p className="font-grotesk text-sm text-ink/70">{item.description}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-bangers text-2xl text-orange">₹{item.price}</span>
                                            {item.isAvailable ? (
                                                cartItem ? (
                                                    <div className="flex items-center gap-3 bg-red border-2 border-ink rounded-lg px-2 py-1">
                                                        <button onClick={() => decreaseQty(item._id)} className="text-cream text-lg px-2 font-bold hover:scale-110 active:scale-95 transition-transform">-</button>
                                                        <span className="text-cream font-bangers text-lg w-4 text-center">{cartItem.quantity}</span>
                                                        <button onClick={() => addToCart(item, cafe._id)} className="text-cream text-lg px-2 font-bold hover:scale-110 active:scale-95 transition-transform">+</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => addToCart(item, cafe._id)} className="bg-ink text-yellow font-bangers px-4 py-2 rounded-lg border-2 border-ink shadow-[2px_2px_0_#FF6B35] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                                        + ADD
                                                    </button>
                                                )
                                            ) : (
                                                <span className="font-grotesk text-sm text-ink/50 italic">Not available</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Cart ─────────────────────────────────── */}
                <div className="lg:col-span-1" ref={cartRef}>
                    <div className="sticky top-24">
                        <div className="bg-cream border-4 border-ink rounded-3xl p-6 shadow-[8px_8px_0_#1A1A1A]">
                            <h2 className="font-bangers text-3xl text-ink mb-4">🛒 YOUR ORDER</h2>

                            {cartItems.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-5xl mb-3">🍽️</div>
                                    <p className="font-grotesk text-ink/60">Add items to your cart</p>
                                </div>
                            ) : (
                                <>
                                    {/* Order Type */}
                                    <div className="flex gap-2 mb-4">
                                        {['delivery', 'dine_in'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setOrderType(type)}
                                                className={`flex-1 py-2 rounded-xl border-2 border-ink font-bangers transition-all ${orderType === type ? 'bg-yellow shadow-[2px_2px_0_#1A1A1A]' : 'bg-cream'}`}
                                            >
                                                {type === 'delivery' ? '🛵 Delivery' : '🪑 Dine-in'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Cart items */}
                                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                                        {cartItems.map(item => (
                                            <div key={item.menuItem} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-grotesk font-semibold text-sm">{item.name}</p>
                                                    <p className="font-mono text-xs text-orange">₹{item.price} × {item.quantity}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bangers text-lg">₹{item.price * item.quantity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ── Customer Details ──────────────────── */}
                                    <div className="space-y-2 mb-4">
                                        <p className="font-bangers text-sm text-ink/70">YOUR DETAILS</p>
                                        <input
                                            type="text"
                                            placeholder="Your Name *"
                                            value={customerName}
                                            onChange={e => setCustomerName(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border-2 border-ink rounded-xl font-grotesk text-sm focus:outline-none focus:border-orange"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number *"
                                            value={customerPhone}
                                            onChange={e => setCustomerPhone(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border-2 border-ink rounded-xl font-grotesk text-sm focus:outline-none focus:border-orange"
                                        />
                                    </div>

                                    {/* Delivery address (if delivery) */}
                                    {orderType === 'delivery' && (
                                        <div className="space-y-2 mb-4">
                                            <p className="font-bangers text-sm text-ink/70">DELIVERY ADDRESS</p>
                                            {['street', 'city', 'pincode'].map(field => (
                                                <input
                                                    key={field}
                                                    type="text"
                                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                                    value={address[field]}
                                                    onChange={e => setAddress(a => ({ ...a, [field]: e.target.value }))}
                                                    className="w-full px-3 py-2 bg-white border-2 border-ink rounded-xl font-grotesk text-sm focus:outline-none"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Total */}
                                    <div className="border-t-2 border-ink pt-3 mb-4">
                                        <div className="flex justify-between">
                                            <span className="font-bangers text-xl text-ink">TOTAL</span>
                                            <span className="font-bangers text-2xl text-orange">₹{total}</span>
                                        </div>
                                    </div>

                                    {/* Payment Method Toggle */}
                                    <div className="flex gap-2 mb-4">
                                        {['online', 'upi', 'cod'].map(method => (
                                            <button
                                                key={method}
                                                onClick={() => { setPaymentMethod(method); setPlacedOrderId(null); }}
                                                className={`flex-1 py-2 rounded-xl border-2 border-ink font-bangers text-sm transition-all ${paymentMethod === method ? 'bg-yellow shadow-[2px_2px_0_#1A1A1A]' : 'bg-cream'}`}
                                            >
                                                {method === 'online' ? '💳 Online' : method === 'upi' ? '📱 UPI' : '💵 Cash'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* COD Button */}
                                    {paymentMethod === 'cod' && (
                                        <CartoonButton
                                            label={ordering ? '⏳ Placing...' : `🛵 Place Order • ₹${total}`}
                                            color="bg-yellow"
                                            size="lg"
                                            disabled={ordering || !isFormValid}
                                            onClick={placeOrder}
                                        />
                                    )}

                                    {/* Online — Razorpay checkout (after order created) */}
                                    {paymentMethod === 'online' && placedOrderId && (
                                        <RazorpayCheckout
                                            orderId={placedOrderId}
                                            amount={total}
                                            onSuccess={() => { clearCart(); navigate(`/order-confirmation/${placedOrderId}`); }}
                                        />
                                    )}

                                    {/* Online/UPI — Create pending order first */}
                                    {(paymentMethod === 'online' || paymentMethod === 'upi') && !placedOrderId && (
                                        <CartoonButton
                                            label={ordering ? '⏳ Processing...' : `💳 Proceed to Pay • ₹${total}`}
                                            color="bg-yellow"
                                            size="lg"
                                            disabled={ordering || !isFormValid}
                                            onClick={createPendingOrder}
                                        />
                                    )}

                                    {/* Validation hint */}
                                    {!isFormValid && (
                                        <p className="text-center font-grotesk text-xs text-ink/50 mt-2">
                                            * Fill your name, phone{orderType === 'delivery' ? ' & address' : ''} to continue
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}