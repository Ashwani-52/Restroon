// server/controllers/payment.controller.js
import crypto from 'crypto';
import Order from '../models/Order.model.js';
import Cafe from '../models/Cafe.model.js';
import { sendOrderEmailPair } from '../utils/email.js';
import { PLATFORM_FEE_PERCENT } from '../utils/constants.js';
import { getCafeRazorpay } from '../config/razorpay.js';

// ──────────────────────────────────────────────
// CREATE RAZORPAY ORDER
// ──────────────────────────────────────────────
export const createRazorpayOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        // ─── Get order from DB ──────────────────
        const order = await Order.findById(orderId).populate('cafe');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // ─── Ensure order belongs to this customer
        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // ─── Calculate platform fee ─────────────
        const totalCharged = order.totalAmount;             // includes platform fee from order model
        const baseAmount = order.foodTotal;               // original food amount
        const platformFee = order.platformFeeAmount || 0;

        // ─── Create Razorpay order via CAFE account ─
        const razorpayOrder = await getCafeRazorpay().orders.create({
            amount: Math.round(totalCharged * 100),  // in paise
            currency: 'INR',
            receipt: `order_${orderId}`,
            notes: {
                orderId: orderId.toString(),
                cafeId: order.cafe._id.toString(),
                platformFee: platformFee.toString(),
                baseAmount: baseAmount.toString(),
                type: 'food_order'
            }
        });

        // ─── Save razorpay order id ─────────────
        order.razorpayOrderId = razorpayOrder.id;
        order.platformFee = platformFee;
        order.totalCharged = totalCharged;
        await order.save();

        res.status(200).json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: Math.round(totalCharged * 100),   // in paise for Razorpay SDK
            currency: 'INR',
            platformFee,
            baseAmount,
            totalCharged,
            keyId: process.env.CAFE_RAZORPAY_KEY_ID  // always send cafe key for food orders
        });

    } catch (err) {
        console.error('Razorpay order error:', err);
        res.status(500).json({ success: false, message: 'Payment initiation failed', error: err.message });
    }
};

// ──────────────────────────────────────────────
// VERIFY PAYMENT + AUTO TRANSFER TO CAFE
// ──────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        // ─── Verify signature using CAFE secret ────
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expected = crypto
            .createHmac('sha256', process.env.CAFE_RAZORPAY_KEY_SECRET)  // cafe secret
            .update(body)
            .digest('hex');

        if (expected !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed — signature mismatch'
            });
        }

        // ─── Update order ────────────────────────
        const order = await Order.findById(orderId).populate('cafe');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.razorpayPaymentId = razorpay_payment_id;
        order.paymentStatus = 'paid';
        order.paymentConfirmed = true;  // ← owner popup fires only now
        await order.save();

        // ─── Note: With cafeRazorpay, money goes directly to cafe account ──
        // ─── No transfer needed; update cafe revenue directly ────────────────
        const cafe = order.cafe;
        try {
            await Cafe.findByIdAndUpdate(
                cafe._id,
                { $inc: { totalRevenue: order.totalAmount } }
            );
        } catch (revenueErr) {
            console.error('Revenue update failed:', revenueErr.message);
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            orderId: order._id
        });

        // ─── Fire dual email for online payment (non-blocking) ───
        sendOrderEmailPair(order, cafe, order.customerEmail).catch(err =>
            console.error('[EMAIL] Online payment email error:', err.message)
        );

    } catch (err) {
        console.error('Payment verification error:', err);
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
};