// src/pages/customer/OrderConfirmation.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { GlobeStickers } from '../../components/ui/GlobeStickers';
import { CartoonButton } from '../../components/ui/CartoonButton';
import Navbar from '../../components/common/Navbar';

const STATUS_STEPS = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];
const STATUS_LABELS = {
    placed: '📝 Order Placed',
    accepted: '✅ Accepted',
    preparing: '👨‍🍳 Preparing',
    out_for_delivery: '🛵 On the Way',
    delivered: '🎉 Delivered!'
};

export default function OrderConfirmation() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/api/order/${orderId}`)
            .then(r => setOrder(r.data.order))
            .finally(() => setLoading(false));

        // Poll every 15 seconds for status updates
        const interval = setInterval(() => {
            api.get(`/api/order/${orderId}`)
                .then(r => setOrder(r.data.order));
        }, 15000);

        return () => clearInterval(interval);
    }, [orderId]);

    if (loading) return (
        <div className="min-h-screen retro-grid flex items-center justify-center">
            <div className="text-6xl animate-bounce">🛵</div>
        </div>
    );

    const currentStep = STATUS_STEPS.indexOf(order?.status);
    const isDelivered = order?.status === 'delivered';

    return (
        <div className="min-h-screen retro-grid">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">

                {/* Header */}
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {isDelivered ? (
                        <>
                            <div className="text-7xl mb-4">🎉</div>
                            <h1 className="font-bangers text-6xl text-ink">DELIVERED!</h1>
                        </>
                    ) : (
                        <>
                            <div className="text-7xl mb-4 animate-bounce">🛵</div>
                            <h1 className="font-bangers text-5xl text-ink">
                                ORDER <span className="text-orange">CONFIRMED!</span>
                            </h1>
                            <p className="font-grotesk text-xl text-ink/70 mt-2">
                                We're preparing your food. Hang tight!
                            </p>
                        </>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left — Globe Animation */}
                    <motion.div
                        className="flex flex-col items-center justify-center pt-10"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="w-full relative">
                            <p className="font-bangers text-center text-ink text-2xl mb-4 absolute -top-8 left-0 right-0 z-20">
                                🍕 FOOD IS ON ITS WAY ACROSS THE CITY!
                            </p>

                            <div className="flex justify-center">
                                <GlobeStickers className="w-72 mx-auto" speed={0.005} />
                            </div>

                            <p className="font-mono text-center text-ink/60 text-xs mt-4">
                                Real-time delivery tracking coming soon
                            </p>
                        </div>
                    </motion.div>

                    {/* Right — Order Details + Status */}
                    <div className="space-y-6">

                        {/* Order ID */}
                        <div className="bg-yellow border-3 border-ink rounded-2xl p-4 shadow-[4px_4px_0_#1A1A1A]">
                            <p className="font-mono text-xs text-ink/60">ORDER ID</p>
                            <p className="font-bangers text-2xl text-ink">#{order?._id?.slice(-8).toUpperCase()}</p>
                            <p className="font-grotesk text-sm text-ink/70 mt-1">
                                {order?.cafe?.name} • ₹{order?.totalAmount}
                            </p>
                        </div>

                        {/* Status Steps */}
                        <div className="bg-cream border-3 border-ink rounded-2xl p-5 shadow-[4px_4px_0_#1A1A1A]">
                            <h3 className="font-bangers text-xl text-ink mb-4">ORDER STATUS</h3>
                            <div className="space-y-3">
                                {STATUS_STEPS.map((status, i) => (
                                    <div key={status} className="flex items-center gap-3">
                                        <div className={`
                      w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center text-sm font-bold
                      ${i <= currentStep ? 'bg-yellow' : 'bg-white'}
                    `}>
                                            {i < currentStep ? '✓' : i === currentStep ? '●' : '○'}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-grotesk font-semibold ${i <= currentStep ? 'text-ink' : 'text-ink/40'}`}>
                                                {STATUS_LABELS[status]}
                                            </div>
                                        </div>
                                        {i === currentStep && (
                                            <div className="w-2 h-2 bg-orange rounded-full animate-pulse" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Items */}
                        <div className="bg-cream border-3 border-ink rounded-2xl p-5 shadow-[4px_4px_0_#1A1A1A]">
                            <h3 className="font-bangers text-xl text-ink mb-3">YOUR ITEMS</h3>
                            {order?.items?.map(item => (
                                <div key={item._id} className="flex justify-between py-2 border-b border-ink/10 last:border-0">
                                    <span className="font-grotesk">{item.name} × {item.quantity}</span>
                                    <span className="font-bangers text-orange">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-3">
                                <span className="font-bangers text-lg">TOTAL</span>
                                <span className="font-bangers text-xl text-orange">₹{order?.totalAmount}</span>
                            </div>
                        </div>

                        <Link to="/cafes">
                            <CartoonButton label="🍕 Order More Food" color="bg-yellow" size="lg" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}