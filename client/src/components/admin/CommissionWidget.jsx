import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const CommissionWidget = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSummary = useCallback(async () => {
        try {
            const { data: res } = await api.get('/api/commission/admin-summary');
            if (res.success) {
                setData(res);
            }
        } catch (err) {
            console.error('Failed to fetch admin commission summary', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
        // Auto-refresh every 30 seconds for real-time tracking
        const interval = setInterval(fetchSummary, 30000);
        return () => clearInterval(interval);
    }, [fetchSummary]);

    if (loading) return (
        <div className="p-8 text-center bg-white border-4 border-ink rounded-3xl shadow-[8px_8px_0_#1A1A1A]">
            <div className="text-4xl animate-bounce mb-4">👑</div>
            <p className="font-bangers text-xl text-ink/40">Loading platform wealth...</p>
        </div>
    );

    const { totalCollected, totalPending, pendingByCafe, recentPayments } = data || {};

    return (
        <div className="space-y-8 mt-8">
            <h2 className="font-bangers text-4xl text-ink mb-6 flex items-center gap-3">
                <span>👑</span> MY COMMISSION
            </h2>

            {/* Collected vs Pending Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Collected */}
                <div className="bg-green-100 border-4 border-ink rounded-3xl p-6 shadow-[8px_8px_0_#1A1A1A]">
                    <p className="font-grotesk text-green-800 font-bold uppercase text-xs tracking-widest mb-1">💰 COLLECTED COMMISSION</p>
                    <p className="font-bangers text-5xl text-green-700">₹{totalCollected?.toLocaleString('en-IN') || 0}</p>
                    <p className="font-grotesk text-green-800/60 text-xs mt-2 uppercase font-bold">Total received from all cafes</p>
                </div>

                {/* Pending */}
                <div className={`border-4 border-ink rounded-3xl p-6 shadow-[8px_8px_0_#1A1A1A] ${totalPending > 0 ? 'bg-red/10' : 'bg-green-100'}`}>
                    <p className={`font-grotesk font-bold uppercase text-xs tracking-widest mb-1 ${totalPending > 0 ? 'text-red/80' : 'text-green-800'}`}>⏳ PENDING COMMISSION</p>
                    <p className={`font-bangers text-5xl ${totalPending > 0 ? 'text-red' : 'text-green-700'}`}>
                        {totalPending > 0 ? `₹${totalPending.toLocaleString('en-IN')}` : '₹0'}
                    </p>
                    <p className={`font-grotesk text-xs mt-2 uppercase font-bold ${totalPending > 0 ? 'text-red/60' : 'text-green-800/60'}`}>
                        {totalPending > 0 ? 'Due from cafe owners' : 'All dues cleared! 🎉'}
                    </p>
                </div>
            </div>

            {/* Detailed Table Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending By Cafe */}
                <div className="lg:col-span-2 bg-white border-4 border-ink rounded-3xl p-6 shadow-[8px_8px_0_#1A1A1A]">
                    <h3 className="font-bangers text-2xl text-ink mb-6 flex items-center gap-2">
                        <span>⚠️</span> PENDING BY CAFE
                    </h3>
                    
                    {!pendingByCafe || pendingByCafe.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-5xl mb-4">✨</div>
                            <p className="font-bangers text-2xl text-green-600">Perfectly Balanced!</p>
                            <p className="font-grotesk text-ink/40 text-sm">Every cafe is up to date.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-grotesk">
                                <thead>
                                    <tr className="border-b-4 border-ink">
                                        <th className="py-3 px-4 font-bold text-xs uppercase tracking-widest">Cafe</th>
                                        <th className="py-3 px-4 font-bold text-xs uppercase tracking-widest">Orders</th>
                                        <th className="py-3 px-4 font-bold text-xs uppercase tracking-widest text-right">Pending Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-ink/10">
                                    {pendingByCafe.map((cafe) => (
                                        <tr key={cafe._id} className="hover:bg-cream transition-colors">
                                            <td className="py-4 px-4 font-bold">
                                                {cafe.cafeName}
                                                <div className="text-[10px] text-ink/40 font-mono tracking-tighter uppercase">{cafe.cafeCity}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="bg-yellow px-2 py-1 rounded-lg border-2 border-ink text-xs font-bold font-bangers">
                                                    {cafe.orderCount} Orders
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right text-red font-bangers text-xl">
                                                ₹{cafe.pendingAmount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Recent Payments */}
                <div className="lg:col-span-1 bg-ink text-cream border-4 border-ink rounded-3xl p-6 shadow-[8px_8px_0_#FF6B35]">
                    <h3 className="font-bangers text-2xl text-yellow mb-6">📜 RECENT PAYMENTS</h3>
                    
                    {!recentPayments || recentPayments.length === 0 ? (
                        <p className="text-center py-8 text-cream/40 font-grotesk italic">No payments recorded yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {recentPayments.map((payment) => (
                                <div key={payment._id} className="bg-white/10 border-2 border-white/20 rounded-2xl p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bangers text-lg text-cream leading-tight">
                                            {payment.cafe?.name || 'Unknown Cafe'}
                                        </p>
                                        <p className="font-bangers text-xl text-green-400">₹{payment.amountPaid}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-[10px] uppercase font-mono text-cream/40">
                                            {new Date(payment.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className="bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-400/30">
                                            {payment.orderCount} orders
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <p className="text-center text-[10px] text-cream/30 font-grotesk mt-6 uppercase tracking-tighter flex items-center justify-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        Live Dashboard · Auto-refresh Active
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CommissionWidget;
