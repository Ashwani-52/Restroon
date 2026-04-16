// server/controllers/subscription.controller.js
import crypto from 'crypto';
import User from '../models/User.model.js';
import Subscription from '../models/Subscription.model.js';
import { SUBSCRIPTION_PLANS } from '../utils/constants.js';
import { getAdminRazorpay } from '../config/razorpay.js';

// ─────────────────────────────────────────────
// POST /api/subscription/start-trial
// ─────────────────────────────────────────────
export const startTrial = async (req, res) => {
    try {
        const existingTrial = await Subscription.findOne({
            user: req.user._id,
            isTrial: true
        });

        if (existingTrial) {
            return res.status(400).json({
                success: false,
                message: 'You have already used your free trial.'
            });
        }

        const trialEnd = new Date();
        trialEnd.setHours(trialEnd.getHours() + 24);

        const sub = await Subscription.create({
            user: req.user._id,
            planId: 'trial',
            planLabel: '1 Day Trial',
            isTrial: true,
            status: 'active',
            startDate: new Date(),
            endDate: trialEnd,
            amount: 0
        });

        await User.findByIdAndUpdate(req.user._id, {
            subscriptionStatus: 'active',
            subscriptionEndDate: trialEnd,
            currentPlan: 'trial'
        });

        res.json({ success: true, message: 'Trial activated!', subscription: sub });
    } catch (err) {
        console.error('[startTrial]', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
// POST /api/subscription/create-order
// ─────────────────────────────────────────────
export const createSubscriptionOrder = async (req, res) => {
    try {
        // Accept both "planId" (SubscriptionPage/PricingSection) and "plan" (legacy)
        const planId = req.body.planId || req.body.plan;

        console.log('[subscription] PLAN RECEIVED:', planId);
        console.log('[subscription] USER ID:', req.user?._id);
        console.log('[subscription] VALID PLANS:', Object.keys(SUBSCRIPTION_PLANS));

        const plan = SUBSCRIPTION_PLANS[planId];

        if (!planId || !plan) {
            console.error(`[subscription] INVALID PLAN: "${planId}"`);
            return res.status(400).json({
                success: false,
                message: `Invalid plan "${planId}". Valid: ${Object.keys(SUBSCRIPTION_PLANS).join(', ')}`
            });
        }

        const order = await getAdminRazorpay().orders.create({
            amount: plan.amount * 100,  // rupees → paise
            currency: 'INR',
            receipt: `sub_${req.user._id.toString().slice(-6)}_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                planId,
                planLabel: plan.label,
                type: 'subscription'
            }
        });

        console.log(`[subscription] ORDER CREATED: ${order.id} plan=${planId} amount=₹${plan.amount}`);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            planLabel: plan.label,
            keyId: process.env.ADMIN_RAZORPAY_KEY_ID  // always send admin key to frontend
        });
    } catch (err) {
        console.error('[createSubscriptionOrder]', err);
        const msg = err.error?.description || err.message || JSON.stringify(err);
        res.status(500).json({ success: false, message: msg });
    }
};

// ─────────────────────────────────────────────
// POST /api/subscription/verify
// ─────────────────────────────────────────────
export const verifySubscriptionPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // Accept both "planId" and "plan" field names
        const planId = req.body.planId || req.body.plan;

        console.log('[subscription] VERIFYING plan:', planId, 'payment:', razorpay_payment_id);

        const plan = SUBSCRIPTION_PLANS[planId];
        if (!planId || !plan) {
            return res.status(400).json({
                success: false,
                message: `Invalid plan during verification: "${planId}"`
            });
        }

        // Verify HMAC signature using ADMIN secret
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSig = crypto
            .createHmac('sha256', process.env.ADMIN_RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSig !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed — signature mismatch'
            });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.days);

        const sub = await Subscription.create({
            user: req.user._id,
            planId,
            planLabel: plan.label,
            isTrial: planId === 'trial',
            status: 'active',
            startDate,
            endDate,
            amount: plan.amount,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });

        await User.findByIdAndUpdate(req.user._id, {
            subscriptionStatus: 'active',
            subscriptionEndDate: endDate,
            currentPlan: planId
        });

        // ₹1 trial refund — non-blocking, failure doesn't affect activation
        if (planId === 'trial') {
            try {
                await getAdminRazorpay().payments.refund(razorpay_payment_id, { amount: 100 });
                console.log('[subscription] Trial ₹1 refunded:', razorpay_payment_id);
            } catch (refundErr) {
                console.error('[subscription] Refund failed (non-critical):', refundErr.message);
            }
        }

        console.log(`[subscription] ACTIVATED: ${planId} → expires ${endDate.toISOString()}`);

        res.json({
            success: true,
            message: `${plan.label} subscription activated!`,
            subscription: sub
        });
    } catch (err) {
        console.error('[verifySubscriptionPayment]', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
// GET /api/subscription/status
// ─────────────────────────────────────────────
export const getSubscriptionStatus = async (req, res) => {
    try {
        const sub = await Subscription.findOne({
            user: req.user._id,
            status: 'active',
            endDate: { $gte: new Date() }
        }).sort({ createdAt: -1 });

        if (!sub) {
            return res.json({ success: true, active: false, plan: null });
        }

        const daysLeft = Math.ceil(
            (sub.endDate - new Date()) / (1000 * 60 * 60 * 24)
        );

        res.json({
            success: true,
            active: true,
            plan: sub.planId,
            planLabel: sub.planLabel,
            isTrial: sub.isTrial,
            endDate: sub.endDate,
            daysLeft
        });
    } catch (err) {
        console.error('[getSubscriptionStatus]', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
// GET /api/subscription/plans  (public — no auth)
// ─────────────────────────────────────────────
export const getPlans = (req, res) => {
    const publicPlans = Object.entries(SUBSCRIPTION_PLANS).map(([id, p]) => ({
        id,
        label: p.label,
        amount: p.amount,
        days: p.days,
    }));
    res.json({ success: true, plans: publicPlans });
};