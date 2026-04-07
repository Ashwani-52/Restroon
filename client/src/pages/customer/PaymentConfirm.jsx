import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const PaymentConfirm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cafeId = searchParams.get('cafe');
    const [confirming, setConfirming] = useState(false);
    const [pendingOrder, setPendingOrder] = useState(null);

    useEffect(() => {
        // Load pending order from sessionStorage
        const saved = sessionStorage.getItem('pendingOrder');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Expire after 30 minutes
            if (Date.now() - parsed.savedAt < 30 * 60 * 1000) {
                setPendingOrder(parsed);
            } else {
                sessionStorage.removeItem('pendingOrder');
            }
        }
    }, []);

    const retryUpiPayment = () => {
        if (!pendingOrder) return;
        const { upiId, upiName, totalAmount } = pendingOrder;
        const shortRef = Date.now().toString().slice(-6);
        const upiParams = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${totalAmount}&tn=Restroon-${shortRef}&cu=INR`;
        window.location.href = `upi://pay?${upiParams}`;
    };

    const handlePaymentSuccess = async () => {
        if (!pendingOrder) {
            alert('Order data expired. Please order again.');
            navigate(`/cafe/${cafeId}`);
            return;
        }

        setConfirming(true);
        try {
            // NOW create the order in DB (only after customer confirms payment)
            // api object attaches token automatically via interceptors
            const res = await api.post('/api/order', {
                ...pendingOrder,
                paymentStatus: 'paid',
            });

            // Clear pending order
            sessionStorage.removeItem('pendingOrder');

            // Navigate to order page
            navigate(`/order-confirmation/${res.data.order._id}?paid=true`);

        } catch (err) {
            console.error(err);
            alert('❌ Failed to confirm order: ' + (err.response?.data?.message || err.message));
        } finally {
            setConfirming(false);
        }
    };

    const handlePaymentFailed = () => {
        // Clear pending order and go back to cafe page
        sessionStorage.removeItem('pendingOrder');
        // Use cafeId from sessionStorage or URL param
        const savedCafeId = pendingOrder?.cafeId || cafeId;
        if (savedCafeId) {
            navigate(`/cafe-info/${savedCafeId}`); // Note: use appropriate actual route to navigate to Cafe page. The URL slug is typically needed. Or simply /home. Wait, cafe slug? No, cafeId might need to go to info page or /cafe/slug. Let me check what the user proposed.
            navigate(-1); // Since cafeId isn't slug, let's just use navigate(-1) for now, or fetch slug. Let's redirect to `/`. Wait, we can navigate to `/cafes`
        } else {
            navigate('/');
        }
    };

    // The user suggested `navigate('/cafe/' + savedCafeId)`. In Restroon we use `/cafe/:slug`. 
    // I will write a small effect to intercept or just `navigate(-1)` if we know the previous was cafe page.
    const handleFailedFallback = () => {
        sessionStorage.removeItem('pendingOrder');
        navigate(-1);
    }

    const amount = pendingOrder?.totalAmount || 0;
    const cafeName = pendingOrder?.upiName || 'Cafe';
    const upiId = pendingOrder?.upiId || '';

    return (
        <div style={{
            minHeight: '100vh', background: '#F0EBE0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16
        }}>
            <div style={{ maxWidth: 400, width: '100%' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 52, marginBottom: 8 }}>🙏</div>
                    <h2 style={{ fontWeight: 900, fontSize: 22, margin: '0 0 6px' }}>
                        Complete Your Payment
                    </h2>
                    <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
                        Please confirm after paying in your UPI app
                    </p>
                </div>

                {/* Amount Card */}
                <div style={{
                    background: '#111', borderRadius: 20,
                    padding: '20px 24px', textAlign: 'center', marginBottom: 16
                }}>
                    <div style={{ color: '#aaa', fontSize: 13, marginBottom: 4 }}>
                        Pay to {cafeName}
                    </div>
                    <div style={{ fontSize: 42, fontWeight: 900, color: '#FFD700' }}>
                        ₹{amount}
                    </div>
                    <div style={{ color: '#555', fontSize: 12, marginTop: 4, fontFamily: 'monospace' }}>
                        {upiId}
                    </div>
                </div>

                {/* Instructions */}
                <div style={{
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderRadius: 14, padding: 16, marginBottom: 20
                }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
                        📱 How to pay:
                    </div>
                    {[
                        '1. Your UPI app should have opened automatically',
                        '2. If not, tap "Retry Payment" below',
                        '3. Complete the payment in your UPI app',
                        '4. Come back and tap "Yes, I Paid" below',
                    ].map((step, i) => (
                        <div key={i} style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                            {step}
                        </div>
                    ))}
                </div>

                {/* Paytm warning note */}
                <div style={{
                    background: '#fff3cd', border: '1px solid #ffc107',
                    borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                    fontSize: 12, color: '#856404'
                }}>
                    ⚠️ If your UPI app shows a warning, tap "Pay via Mobile Number" 
                    or "Pay via Scanning QR" — both options will work normally.
                </div>

                {/* Retry button */}
                <button
                    onClick={retryUpiPayment}
                    style={{
                        width: '100%', padding: '13px',
                        background: '#fff',
                        border: '2px solid #FFD700',
                        borderRadius: 12, fontWeight: 800,
                        fontSize: 14, cursor: 'pointer',
                        marginBottom: 10, color: '#111'
                    }}
                >
                    🔄 Retry / Open UPI App Again
                </button>

                {/* YES I PAID */}
                <button
                    onClick={handlePaymentSuccess}
                    disabled={confirming}
                    style={{
                        width: '100%', padding: '15px',
                        background: confirming ? '#ccc' : '#16a34a',
                        border: 'none', borderRadius: 14,
                        color: '#fff', fontWeight: 900,
                        fontSize: 16, cursor: confirming ? 'not-allowed' : 'pointer',
                        marginBottom: 10,
                        boxShadow: confirming ? 'none' : '0 4px 0 #166534'
                    }}
                >
                    {confirming ? '⏳ Placing Order...' : '✅ YES, I PAID — Place My Order'}
                </button>

                {/* PAYMENT FAILED */}
                <button
                    onClick={handleFailedFallback}
                    style={{
                        width: '100%', padding: '13px',
                        background: 'transparent',
                        border: '2px solid #ef4444',
                        borderRadius: 12, fontWeight: 700,
                        fontSize: 14, cursor: 'pointer',
                        color: '#ef4444', marginBottom: 20
                    }}
                >
                    ❌ Payment Failed — Go Back
                </button>

                <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center' }}>
                    ⚠️ Only tap "YES I PAID" after your UPI transaction shows success
                </p>
            </div>
        </div>
    );
};

export default PaymentConfirm;
