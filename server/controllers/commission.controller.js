import Order from '../models/Order.model.js';
import Notification from '../models/Notification.model.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const getTodayCommission = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            cafe: req.query.cafeId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            commissionPaid: false
        });

        const totalCommission = orders.reduce((sum, order) => sum + (order.platformFeeAmount || 0), 0);

        res.json({
            success: true,
            totalCommission,
            orderCount: orders.length
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const createPayment = async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' });
        }

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency: 'INR',
            receipt: `comm_receipt_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);
        
        res.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            cafeId
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        // Mark today's orders as paid
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        await Order.updateMany(
            {
                cafe: cafeId,
                createdAt: { $gte: startOfDay, $lte: endOfDay },
                commissionPaid: false
            },
            {
                $set: {
                    commissionPaid: true,
                    commissionPaidAt: new Date()
                }
            }
        );

        // Optionally mark all system reminders for this user as read
        await Notification.updateMany(
            { user: req.user._id, type: 'COMMISSION_REMINDER', read: false },
            { $set: { read: true } }
        );

        res.json({ success: true, message: 'Payment verified and commissions marked as paid' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
