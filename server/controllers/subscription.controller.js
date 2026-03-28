// server/controllers/subscription.controller.js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Cafe from '../models/Cafe.model.js';
import { SUBSCRIPTION_PLANS } from '../utils/constants.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ──────────────────────────────────────────────
// CREATE SUBSCRIPTION PAYMENT ORDER
// ──────────────────────────────────────────────
export const createSubscriptionOrder = async (req, res) => {
    try {
        const { plan } = req.body;

        if (!SUBSCRIPTION_PLANS[plan]) {
            return res.status(400).json({ success: false, message: 'Invalid plan' });
        }

        const selectedPlan = SUBSCRIPTION_PLANS[plan];

        // ─── Starter is free — no payment needed ─
        if (selectedPlan.price === 0) {
            const cafe = await Cafe.findOne({ owner: req.user._id });
            if (cafe) {
                cafe.subscription = {
                    plan: 'starter',
                    status: 'active',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
                };
                await cafe.save();
            }
            return res.status(200).json({
                success: true,
                free: true,
                message: 'Starter plan activated!'
            });
        }

        // ─── Create Razorpay order for paid plans ─
        const razorpayOrder = await razorpay.orders.create({
            amount: selectedPlan.price * 100,  // in paise
            currency: 'INR',
            receipt: `sub_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                plan: plan,
                planName: selectedPlan.name
            }
        });

        res.status(200).json({
            success: true,
            free: false,
            razorpayOrderId: razorpayOrder.id,
            amount: selectedPlan.price * 100,
            currency: 'INR',
            plan,
            planName: selectedPlan.name,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ──────────────────────────────────────────────
// VERIFY SUBSCRIPTION PAYMENT
// ──────────────────────────────────────────────
export const verifySubscriptionPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan
        } = req.body;

        // ─── Verify signature ────────────────────
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expected !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // ─── Activate subscription ───────────────
        const cafe = await Cafe.findOne({ owner: req.user._id });
        if (!cafe) {
            return res.status(404).json({ success: false, message: 'Cafe not found' });
        }

        cafe.subscription = {
            plan: plan,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            razorpayPaymentId: razorpay_payment_id
        };

        await cafe.save();

        res.status(200).json({
            success: true,
            message: `${SUBSCRIPTION_PLANS[plan].name} plan activated!`,
            subscription: cafe.subscription
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ──────────────────────────────────────────────
// GET CURRENT SUBSCRIPTION
// ──────────────────────────────────────────────
export const getSubscription = async (req, res) => {
    try {
        const cafe = await Cafe.findOne({ owner: req.user._id });
        res.status(200).json({
            success: true,
            subscription: cafe?.subscription || { plan: 'starter', status: 'trial' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};