import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { CheckCircle2, ChevronLeft, Loader2, IndianRupee, Store, Info } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import CartoonButton from '../../../components/ui/CartoonButton';

const UpiPayment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        fetchPaymentDetails();
    }, [orderId]);

    const fetchPaymentDetails = async () => {
        try {
            const { data } = await api.get(`/api/order/${orderId}/payment`);
            if (data.success) {
                if (data.paymentMethod === 'cod') {
                    toast.error(data.message || 'This cafe only accepts cash.');
                    navigate(`/order-confirmation/${orderId}`);
                    return;
                }
                setPaymentData(data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch payment details');
            navigate('/profile');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        setConfirming(true);
        try {
            const { data } = await api.post(`/api/order/${orderId}/paid`);
            if (data.success) {
                toast.success('Payment confirmed successfully!');
                navigate(`/order-confirmation/${orderId}`);
            }
        } catch (error) {
            toast.error('Failed to confirm payment');
        } finally {
            setConfirming(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!paymentData) return null;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50 font-comic">
            <div className="max-w-md mx-auto px-4">
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center text-gray-600 hover:text-orange-500 mb-6 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Profile
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
                    <div className="bg-[#4EAC3D] p-6 text-center text-white relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -translate-x-12 translate-y-12"></div>
                        
                        <Store className="w-10 h-10 mx-auto mb-2 opacity-90" />
                        <h2 className="text-2xl font-black mb-1">{paymentData.upiName}</h2>
                        <p className="text-green-100 text-sm font-medium opacity-90">{paymentData.upiId}</p>
                    </div>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <p className="text-gray-500 mb-2 uppercase tracking-wide text-sm font-bold">Amount to Pay</p>
                            <div className="flex items-center justify-center text-4xl font-black text-gray-800">
                                <IndianRupee className="w-8 h-8 mr-1" />
                                {paymentData.amount.toFixed(2)}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-gray-100 flex justify-center mx-auto w-fit mb-8 relative group">
                            <div className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"></div>
                            <QRCode
                                value={paymentData.upiLink}
                                size={200}
                                level="H"
                                className="drop-shadow-sm"
                            />
                        </div>

                        <div className="flex gap-2 mb-8 bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100">
                            <Info className="w-6 h-6 flex-shrink-0 text-blue-500" />
                            <p>Scan this QR code using PhonePe, GPay, Paytm, or any UPI app to pay directly to the cafe.</p>
                        </div>

                        <div className="space-y-4">
                            <CartoonButton
                                onClick={handleConfirmPayment}
                                disabled={confirming}
                                className="w-full py-4 text-lg bg-orange-500 hover:bg-orange-600 text-white flex justify-center items-center gap-2"
                            >
                                {confirming ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-6 h-6" />
                                        I Have Made The Payment
                                    </>
                                )}
                            </CartoonButton>
                            
                            <p className="text-xs text-center text-gray-400 font-medium">
                                By clicking confirm, you agree that you have successfully completed the transaction on your UPI app.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpiPayment;
