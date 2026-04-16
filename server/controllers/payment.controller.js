// server/controllers/payment.controller.js
import crypto from 'crypto';
import Order from '../models/Order.model.js';
import Cafe from '../models/Cafe.model.js';
import { sendOrderEmailPair } from '../utils/email.js';
import { PLATFORM_FEE_PERCENT } from '../utils/constants.js';
import { cafeRazorpay } from '../config/razorpay.js';

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
        const baseAmount = order.totalAmount;             // e.g. ₹100
        const platformFee = Math.ceil(baseAmount * PLATFORM_FEE_PERCENT / 100); // ₹4
        const totalCharged = baseAmount + platformFee;      // ₹104 (customer pays)

        // ─── Create Razorpay order via CAFE account ─
        const razorpayOrder = await cafeRazorpay.orders.create({
            amount: totalCharged * 100,  // in paise
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
            amount: totalCharged * 100,   // in paise for Razorpay SDK
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

// ──────────────────────────────────────────────
// CAFE OWNER — LINK BANK ACCOUNT
// ──────────────────────────────────────────────
export const linkBankAccount = async (req, res) => {
    try {
        const {
            accountHolderName,
            accountNumber,
            ifscCode,
            upiId
        } = req.body;

        // ─── Validate ────────────────────────────
        if (!accountHolderName || !accountNumber || !ifscCode) {
            return res.status(400).json({
                success: false,
                message: 'Account holder name, account number and IFSC are required'
            });
        }

        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid IFSC code format'
            });
        }

        const cafe = await Cafe.findOne({ owner: req.user._id });
        if (!cafe) {
            return res.status(404).json({ success: false, message: 'Cafe not found' });
        }

        // ─── Create Razorpay linked account ──────
        let razorpayAccountId = cafe.banking?.razorpayAccountId;

        try {
            if (!razorpayAccountId) {
                // Create new linked account
                const linkedAccount = await razorpay.accounts.create({
                    email: req.user.email,
                    profile: {
                        category: 'food_and_grocery',
                        subcategory: 'catering',
                        addresses: {
                            registered: {
                                street1: cafe.address?.street || 'India',
                                city: cafe.address?.city || 'India',
                                state: 'MH',
                                postal_code: cafe.address?.pincode || '400001',
                                country: 'IN'
                            }
                        }
                    },
                    type: 'route',
                    legal_info: {
                        pan: 'AAACX0000X',   // placeholder — in production collect real PAN
                        gst: ''
                    }
                });
                razorpayAccountId = linkedAccount.id;
            }

            // ─── Add bank account to linked account ──
            await razorpay.stakeholders.create(razorpayAccountId, {
                name: accountHolderName,
                ifsc: ifscCode.toUpperCase(),
                account_number: accountNumber
            });

        } catch (rzpErr) {
            // Still save locally even if Razorpay Route not enabled yet
            console.warn('Razorpay Route not enabled yet:', rzpErr.message);
        }

        // ─── Save to DB (encrypt sensitive data) ─
        cafe.banking = {
            accountHolderName: accountHolderName,
            accountNumber: accountNumber.slice(-4).padStart(accountNumber.length, '*'), // mask
            ifscCode: ifscCode.toUpperCase(),
            upiId: upiId || '',
            razorpayAccountId: razorpayAccountId || '',
            isVerified: false  // admin verifies manually
        };

        await cafe.save();

        res.status(200).json({
            success: true,
            message: 'Bank account linked successfully. Verification pending.'
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to link bank account', error: err.message });
    }
};

// ──────────────────────────────────────────────
// GET BANKING INFO
// ──────────────────────────────────────────────
export const getBankingInfo = async (req, res) => {
    try {
        const cafe = await Cafe.findOne({ owner: req.user._id });
        if (!cafe) {
            return res.status(404).json({ success: false, message: 'Cafe not found' });
        }

        res.status(200).json({
            success: true,
            banking: cafe.banking || {}
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};