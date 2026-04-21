import { useState, useEffect } from 'react';
import api from '../../../services/api';

const PlatformCommission = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [payLoading, setPayLoading] = useState(false);
    const [payError, setPayError] = useState("");
    const [paySuccess, setPaySuccess] = useState(null);

    const fetchDues = async () => {
        try {
            const { data: res } = await api.get('/api/commission/cafe-dues');
            if (res.success) {
                setData(res);
            }
        } catch (err) {
            console.error('Failed to fetch dues', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDues();
        // Load Razorpay SDK
        if (!document.getElementById("rzp-sdk")) {
            const s = document.createElement("script");
            s.id = "rzp-sdk";
            s.src = "https://checkout.razorpay.com/v1/checkout.js";
            document.body.appendChild(s);
        }
    }, []);

    const handlePay = async () => {
        if (!data?.totalDue) return;
        setPayLoading(true);
        setPayError("");

        try {
            const { data: orderData } = await api.post("/api/commission/create-payment");

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: "INR",
                name: "Restroon Platform",
                description: `Platform fee for ${data.unpaidCount} orders`,
                order_id: orderData.orderId,
                theme: { color: "#f97316" },
                handler: async (response) => {
                    try {
                        const { data: vData } = await api.post("/api/commission/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        if (vData.success) {
                            setPaySuccess(vData);
                            await fetchDues(); // refresh dues
                        }
                    } catch (err) {
                        setPayError("Payment received but verification failed. Contact support.");
                    } finally {
                        setPayLoading(false);
                    }
                },
                modal: { ondismiss: () => setPayLoading(false) },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setPayError(err.response?.data?.message || "Failed to initiate payment.");
            setPayLoading(false);
        }
    };

    if (loading) return (
        <div className="p-20 text-center text-ink/40 font-bangers text-2xl animate-pulse">
            🍱 FETCHING DUES...
        </div>
    );

    const { unpaidOrders = [], unpaidCount, feePerOrder, totalDue } = data || {};

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="font-bangers text-5xl text-ink mb-2">💸 PLATFORM FEES</h1>
                    <p className="font-grotesk text-ink/60 max-w-lg">
                        Our platform charges a small <span className="font-bold text-orange">5% platform fee</span> per delivered order to keep the service running.
                    </p>
                </div>
                
                {paySuccess && (
                  <div className="bg-green-100 border-4 border-ink rounded-3xl p-4 shadow-[4px_4px_0_#1A1A1A] animate-bounce">
                      <p className="font-bangers text-green-700 text-lg leading-tight">✅ DUES CLEARED!</p>
                      <p className="font-grotesk text-green-800/60 text-xs">₹{paySuccess.amountPaid} paid for {paySuccess.orderCount} orders.</p>
                  </div>
                )}
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pending Count */}
                <div className="bg-white border-4 border-ink rounded-3xl p-6 shadow-[6px_6px_0_#1A1A1A]">
                    <p className="font-grotesk font-bold text-ink/40 uppercase text-[10px] tracking-widest mb-1">UNPAID ORDERS</p>
                    <p className="font-bangers text-4xl text-ink">{unpaidCount}</p>
                </div>

                {/* Platform Fee Label */}
                <div className="bg-white border-4 border-ink rounded-3xl p-6 shadow-[6px_6px_0_#1A1A1A]">
                    <p className="font-grotesk font-bold text-ink/40 uppercase text-[10px] tracking-widest mb-1">PLATFORM FEE</p>
                    <p className="font-bangers text-4xl text-ink">5%</p>
                    <p className="font-grotesk text-[10px] text-orange font-bold uppercase mt-1">Of Menu Total</p>
                </div>

                {/* Total Due */}
                <div className={`${totalDue > 0 ? 'bg-yellow shadow-[6px_6px_0_#F97316]' : 'bg-green-100 shadow-[6px_6px_0_#16A34A]'} border-4 border-black rounded-3xl p-6 transition-all`}>
                    <p className="font-grotesk font-bold text-black/60 uppercase text-[10px] tracking-widest mb-1">TOTAL DUES</p>
                    <p className="font-bangers text-4xl text-black">
                        {totalDue > 0 ? `₹${totalDue}` : '✅ CLEARED'}
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Orders Breakdown */}
                <div className="lg:col-span-8 bg-white border-4 border-ink rounded-3xl overflow-hidden shadow-[8px_8px_0_#1A1A1A]">
                    <div className="p-6 border-b-4 border-ink flex items-center justify-between">
                        <h3 className="font-bangers text-2xl text-ink">📋 ORDER BREAKDOWN</h3>
                        {unpaidCount > 0 && <span className="bg-ink text-white px-3 py-1 rounded-full font-bangers text-sm">TOTAL: {unpaidCount}</span>}
                    </div>

                    <div className="overflow-x-auto">
                        {unpaidOrders.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="text-6xl mb-4 text-green-400 animate-pulse">🎉</div>
                                <h4 className="font-bangers text-3xl text-ink mb-1">NO PENDING DUES!</h4>
                                <p className="font-grotesk text-ink/40">You're all caught up with the platform. Keep cooking!</p>
                            </div>
                        ) : (
                            <table className="w-full text-left font-grotesk border-collapse">
                                <thead>
                                    <tr className="bg-ink/5 border-b-2 border-ink/10 text-[10px] font-bold uppercase tracking-widest text-ink/60">
                                        <th className="py-4 px-6">Order Details</th>
                                        <th className="py-4 px-6">Customer</th>
                                        <th className="py-4 px-6 text-right">Order Amt</th>
                                        <th className="py-4 px-6 text-right">Fee</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-ink/10">
                                    {unpaidOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-cream transition-colors">
                                            <td className="py-5 px-6">
                                                <div className="font-bold text-sm text-ink mb-0.5">#{order._id.toString().slice(-6).toUpperCase()}</div>
                                                <div className="text-[10px] text-ink/50 font-mono italic">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="font-bold text-sm text-ink mb-0.5">{order.customer?.name || 'Customer'}</div>
                                                <div className="text-[10px] text-blue font-bold tracking-tighter">
                                                    {order.customer?.phone ? <a href={`tel:${order.customer.phone}`} className="hover:underline">📞 {order.customer.phone}</a> : '-'}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-right font-bold text-ink">
                                                ₹{order.totalAmount}
                                            </td>
                                            <td className="py-5 px-6 text-right font-bangers text-xl text-orange">
                                                ₹{order.platformFeeAmount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Actions Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Payment Box */}
                    {totalDue > 0 && (
                        <div className="bg-ink text-cream border-4 border-ink rounded-3xl p-8 shadow-[8px_8px_0_#F97316] text-center">
                            <p className="font-bangers text-2xl text-yellow mb-2 tracking-wide uppercase">READY TO PAY?</p>
                            <p className="font-grotesk text-xs text-cream/60 mb-6 font-bold italic leading-relaxed">
                                {unpaidCount} orders collected. Clearing dues keeps your account in high standing!
                            </p>
                            
                            <button
                                onClick={handlePay}
                                disabled={payLoading}
                                className={`w-full py-5 rounded-2xl border-4 border-ink font-bangers text-3xl shadow-[4px_4px_0_#1A1A1A] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${payLoading ? 'bg-yellow/50 cursor-wait' : 'bg-yellow hover:bg-orange text-ink'}`}
                            >
                                {payLoading ? 'OPENING...' : `PAY ₹${totalDue}`}
                            </button>
                            
                            <p className="mt-6 text-[9px] uppercase font-bold text-cream/40 tracking-[2px]">SECURE RAZORPAY GATEWAY</p>
                            
                            {payError && (
                                <div className="mt-4 p-3 bg-red/20 border-2 border-red/40 rounded-xl">
                                    <p className="font-grotesk text-[10px] font-bold text-red">❌ {payError}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* How It Works Card */}
                    <div className="bg-cream border-4 border-ink rounded-3xl p-6 shadow-[5px_5px_0_#1A1A1A]">
                        <h4 className="font-bangers text-lg text-ink mb-4 flex items-center gap-2">
                             <span>💡</span> HOW IT WORKS
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { icon: '🍔', title: 'Food Sales', desc: 'Direct to your wallet', color: 'text-ink' },
                                { icon: '🛵', title: 'Delivery Charges', desc: 'Direct to your wallet', color: 'text-ink' },
                                { icon: '💳', title: 'Platform Fee', desc: `5% of order total`, color: 'text-orange' }
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <p className="font-bangers text-xs text-ink leading-tight">{item.title}</p>
                                        <p className={`font-grotesk text-[10px] font-bold uppercase tracking-tight ${item.color}`}>{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* All Clear Card */}
                    {totalDue === 0 && !loading && (
                        <div className="bg-green-400 border-4 border-ink rounded-3xl p-8 text-center shadow-[6px_6px_0_#1A1A1A]">
                            <div className="text-5xl mb-3 animate-pulse">👑</div>
                            <p className="font-bangers text-2xl text-ink leading-none mb-1">ALL CLEAR!</p>
                            <p className="font-grotesk text-[10px] text-ink/70 font-bold uppercase">Your zero balance is inspiring.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PlatformCommission;
