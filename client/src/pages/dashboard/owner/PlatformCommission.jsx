import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { CartoonButton } from '../../../components/ui/CartoonButton';

export default function PlatformCommission() {
    const { user } = useAuth();
    const [commissionData, setCommissionData] = useState({ totalCommission: 0, orderCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommission = async () => {
            try {
                // Fetch the cafe first if I need the cafe ID
                const { data: cafeRes } = await api.get('/cafe/my-cafe');
                if (cafeRes.success && cafeRes.cafe) {
                    const { data } = await api.get(`/commission/today?cafeId=${cafeRes.cafe._id}`);
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
            const { data: cafeRes } = await api.get('/cafe/my-cafe');
            const cafeId = cafeRes.cafe._id;

            const { data } = await api.post('/commission/create-payment', { amount: commissionData.totalCommission });
            
            if (!data.success) {
                alert('Payment creation failed');
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                amount: data.amount,
                currency: data.currency,
                name: "Restroon",
                description: "Platform Commission",
                order_id: data.orderId,
                handler: async function (response) {
                    const verifyData = await api.post('/commission/verify', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        cafeId
                    });
                    
                    if (verifyData.data.success) {
                        alert("Payment successful! Commission marked as paid.");
                        setCommissionData({ totalCommission: 0, orderCount: 0 });
                    }
                },
                theme: {
                    color: "#FFD700"
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Payment Error', error);
            alert('Something went wrong during payment processing');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-cream min-h-screen">
            <h1 className="font-bangers text-4xl mb-6">Platform Commission</h1>
            
            <div className="bg-white border-4 border-ink rounded-2xl shadow-[8px_8px_0_#1A1A1A] p-6 max-w-lg">
                <h3 className="font-grotesk font-bold text-xl mb-4">Today's Outstanding Dues</h3>
                
                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl border border-gray-300">
                    <div>
                        <p className="text-gray-500 font-medium">Unpaid Orders</p>
                        <p className="font-bangers text-2xl">{commissionData.orderCount}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">Total Platform Fee</p>
                        <p className="font-bangers text-3xl text-orange">₹{commissionData.totalCommission.toFixed(2)}</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <CartoonButton 
                        label="Pay Now with Razorpay" 
                        color="bg-green-400" 
                        onClick={processPayment}
                        disabled={commissionData.totalCommission <= 0}
                    />
                </div>
            </div>
        </div>
    );
}
