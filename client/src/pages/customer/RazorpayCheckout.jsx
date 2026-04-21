// src/components/customer/RazorpayCheckout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CartoonButton } from '../../components/ui/CartoonButton';

export function RazorpayCheckout({ orderId, amount, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const loadRazorpay = () => new Promise(resolve => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    const handlePay = async () => {
        setLoading(true);
        setError('');

        try {
            // ─── Load Razorpay SDK ──────────────────
            const loaded = await loadRazorpay();
            if (!loaded) {
                setError('Failed to load payment gateway. Check your internet.');
                setLoading(false);
                return;
            }

            // ─── Create Razorpay order ──────────────
            const res = await api.post('/api/payment/create-order', { orderId });
            const {
                razorpayOrderId,
                amount: totalPaise,
                keyId,
                platformFee,
                baseAmount,
                totalCharged
            } = res.data;

            // ─── Open Razorpay modal ────────────────
            const options = {
                key: keyId,
                amount: totalPaise,
                currency: 'INR',
                name: 'Restroon',
                description: `Order Payment (incl. ₹${platformFee} platform fee)`,
                image: '/logo.png',
                order_id: razorpayOrderId,
                prefill: {},
                theme: { color: '#FFD23F' },
                modal: { ondismiss: () => setLoading(false) },
                handler: async (response) => {
                    try {
                        // ─── Verify payment ───────────────
                        await api.post('/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId
                        });

                        onSuccess?.();
                        navigate(`/order-confirmation/${orderId}`);

                    } catch (verifyErr) {
                        setError('Payment captured but verification failed. Contact support.');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                setError(`Payment failed: ${resp.error.description}`);
                setLoading(false);
            });
            rzp.open();

        } catch (err) {
            setError(err.response?.data?.message || 'Payment failed. Please try again.');
            setLoading(false);
        }
    };

    const platformFeePreview = +(amount * 0.05).toFixed(2);
    const totalPayablePreview = +(amount + platformFeePreview).toFixed(2);

    return (
        <div className="space-y-3">
            {error && (
                <div className="bg-red/10 border-2 border-red rounded-xl p-3">
                    <p className="font-grotesk text-sm text-red">{error}</p>
                </div>
            )}

            {/* Fee Breakdown */}
            <div className="bg-yellow/20 border-2 border-ink rounded-xl p-3">
                <div className="space-y-1 font-grotesk text-sm">
                    <div className="flex justify-between">
                        <span className="text-ink/70">Food total</span>
                        <span>₹{amount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-ink/70">Platform fee (5%)</span>
                        <span>₹{platformFeePreview}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-ink/20 pt-1 mt-1">
                        <span>Total payable</span>
                        <span className="text-orange">₹{totalPayablePreview}</span>
                    </div>
                </div>
            </div>

            <CartoonButton
                label={loading ? '⏳ Opening Payment...' : `💳 Pay ₹${totalPayablePreview} via UPI/Card`}
                color="bg-yellow"
                size="lg"
                disabled={loading}
                onClick={handlePay}
            />

            <p className="font-mono text-xs text-ink/50 text-center">
                🔒 Secured by Razorpay · UPI · Cards · Netbanking
            </p>
        </div>
    );
}