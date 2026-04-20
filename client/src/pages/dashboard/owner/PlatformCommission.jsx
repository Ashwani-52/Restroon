import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { CartoonButton } from '../../../components/ui/CartoonButton';

export default function PlatformCommission() {
    const [commissionData, setCommissionData] = useState({ totalCommission: 0, orderCount: 0, orders: [] });
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [statusBanner, setStatusBanner] = useState(null);

    // Razorpay Script Loader
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    useEffect(() => {
        const fetchCommission = async () => {
            try {
                const { data: cafeRes } = await api.get('/api/cafe/my-cafe');
                if (cafeRes.success && cafeRes.cafe) {
                    const { data } = await api.get(`/api/commission/today?cafeId=${cafeRes.cafe._id}`);
                    if (data.success) {
                        setCommissionData(data);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch commission data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCommission();
    }, []);

    const processPayment = async () => {
        try {
            setPaying(true);
            setStatusBanner(null);
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                setStatusBanner({ type: 'error', message: 'Razorpay SDK failed to load.' });
                setPaying(false);
                return;
            }

            const { data: cafeRes } = await api.get('/api/cafe/my-cafe');
            const cafeId = cafeRes.cafe._id;

            const { data } = await api.post('/api/commission/create-payment', { amount: commissionData.totalCommission });
            
            if (!data.success) {
                setStatusBanner({ type: 'error', message: 'Payment creation failed' });
                setPaying(false);
                return;
            }

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "Restroon",
                description: "Platform Commission",
                order_id: data.orderId,
                handler: async function (response) {
                    const verifyData = await api.post('/api/commission/verify', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        cafeId
                    });
                    
                    if (verifyData.data.success) {
                        setStatusBanner({ type: 'success', message: 'Payment successful! Commissions marked as paid.' });
                        setCommissionData({ totalCommission: 0, orderCount: 0, orders: [] });
                    }
                    setPaying(false);
                },
                modal: {
                    ondismiss: () => setPaying(false),
                },
                theme: { color: "#FFD700" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Payment Error', error);
            setStatusBanner({ type: 'error', message: 'Something went wrong during payment processing.' });
            setPaying(false);
        }
    };

    if (loading) return (
        <div className="p-6 bg-cream min-h-screen flex items-center justify-center">
            <div className="animate-bounce font-bangers text-2xl">Loading...</div>
        </div>
    );

    return (
        <div className="p-6 bg-cream min-h-screen">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="font-bangers text-5xl text-ink mb-2">Platform Fees</h1>
                    <p className="font-grotesk text-ink/60">Manage your platform commission payments.</p>
                </header>

                {statusBanner && (
                    <div className={`mb-6 p-4 rounded-2xl border-4 border-ink font-bangers text-xl shadow-[4px_4px_0_#000] ${statusBanner.type === 'success' ? 'bg-green-400' : 'bg-red text-cream'}`}>
                        {statusBanner.type === 'success' ? '✅ ' : '❌ '}{statusBanner.message}
                    </div>
                )}

                {/* ── 3-Stat Header ────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border-4 border-ink rounded-2xl p-6 shadow-[8px_8px_0_#1A1A1A]">
                        <p className="font-grotesk text-ink/60 font-bold uppercase text-xs tracking-widest mb-1">Unpaid Orders</p>
                        <p className="font-bangers text-4xl">{commissionData.orderCount}</p>
                    </div>
                    <div className="bg-white border-4 border-ink rounded-2xl p-6 shadow-[8px_8px_0_#1A1A1A]">
                        <p className="font-grotesk text-ink/60 font-bold uppercase text-xs tracking-widest mb-1">Per Order Fee</p>
                        <p className="font-bangers text-4xl">₹15</p>
                    </div>
                    <div className="bg-yellow border-4 border-ink rounded-2xl p-6 shadow-[8px_8px_0_#FF6B35]">
                        <p className="font-grotesk text-ink/60 font-bold uppercase text-xs tracking-widest mb-1">Total Due</p>
                        <p className="font-bangers text-4xl">₹{commissionData.totalCommission}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Order Breakdown Table ──────────── */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border-4 border-ink rounded-3xl p-6 shadow-[8px_8px_0_#1A1A1A] overflow-hidden">
                            <h3 className="font-bangers text-2xl mb-4">📜 Order Breakdown</h3>
                            
                            {commissionData.orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-5xl mb-4">✨</div>
                                    <p className="font-bangers text-2xl text-green-600">All clear!</p>
                                    <p className="font-grotesk text-ink/50 text-sm">No outstanding commissions for today.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left font-grotesk">
                                        <thead>
                                            <tr className="border-b-2 border-ink">
                                                <th className="py-2 px-3 font-bold text-sm">Order ID</th>
                                                <th className="py-2 px-3 font-bold text-sm">Time</th>
                                                <th className="py-2 px-3 font-bold text-sm text-right">Amount</th>
                                                <th className="py-2 px-3 font-bold text-sm text-right">Platform Fee</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {commissionData.orders.map(order => (
                                                <tr key={order._id} className="border-b border-ink/10 hover:bg-cream transition-colors">
                                                    <td className="py-3 px-3 font-mono text-xs">#{order._id.slice(-6)}</td>
                                                    <td className="py-3 px-3 text-xs">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                    <td className="py-3 px-3 text-right text-sm">₹{order.foodTotal}</td>
                                                    <td className="py-3 px-3 text-right font-bold text-orange">₹{order.platformFeeAmount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Fee Explanation & Pay Button ────── */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-cream border-4 border-ink rounded-3xl p-6 shadow-[4px_4px_0_#1A1A1A]">
                            <h4 className="font-bangers text-xl mb-3">💡 How it works</h4>
                            <ul className="space-y-3 font-grotesk text-sm">
                                <li className="flex gap-2">
                                    <span>🍔</span>
                                    <span><strong>Item Sales:</strong> Paid directly to your account.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>🛵</span>
                                    <span><strong>Delivery Charge:</strong> Paid directly to your account.</span>
                                </li>
                                <li className="flex gap-2 text-orange">
                                    <span>🏢</span>
                                    <span><strong>Platform Fee:</strong> Fixed ₹15/order due to the platform.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-ink border-4 border-ink rounded-3xl p-6 shadow-[8px_8px_0_#FF6B35]">
                            <p className="font-bangers text-cream text-lg mb-4 text-center">Ready to clear your dues?</p>
                            <CartoonButton 
                                label={paying ? "Processing..." : `Pay ₹${commissionData.totalCommission}`} 
                                color="bg-yellow" 
                                size="lg"
                                onClick={processPayment}
                                disabled={commissionData.totalCommission <= 0 || paying}
                            />
                            <p className="text-[10px] text-cream/40 font-grotesk text-center mt-3 uppercase tracking-tighter">
                                Payments are processed securely via SSL
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
