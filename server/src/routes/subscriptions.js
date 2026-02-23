const express = require('express');
const router = express.Router();
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const Cafe = require('../models/Cafe');
const { authenticate, authorize } = require('../middleware/auth');

// ==================== ALL ROLE ROUTES ====================

// GET /api/admin/subscriptions/plans
// Get all available subscription plans
router.get('/plans', async (req, res) => {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort('price.monthly');
    res.json({ success: true, data: plans });
});

// ==================== SUPER ADMIN ROUTES ====================

// GET /api/admin/subscriptions
// Get all active subscriptions and overall stats
router.get('/', authenticate, authorize('super_admin'), async (req, res) => {
    // 1. Fetch all subscriptions and populate plan and cafe
    const subscriptions = await Subscription.find()
        .populate('plan', 'name price type')
        .populate('cafe', 'name owner')
        .sort('-createdAt');

    // Mongoose populate might leave cafe null if it was deleted, so let's format safely
    const formattedSubscriptions = subscriptions.map(sub => {
        const obj = sub.toJSON();
        return {
            ...obj,
            cafeName: sub.cafe?.name || 'Unknown Cafe',
            plan: sub.plan?._id || sub.plan,
            planName: sub.plan?.name || 'Unknown Plan'
        };
    });

    // 2. Calculate Stats
    const totalSubscriptions = formattedSubscriptions.length;
    const activeCount = formattedSubscriptions.filter(s => s.status === 'active').length;

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const expiringSoon = formattedSubscriptions.filter(s =>
        s.status === 'active' &&
        new Date(s.endDate) <= sevenDaysFromNow &&
        new Date(s.endDate) >= now
    ).length;

    // Monthly revenue estimation based on active subscriptions
    let monthlyRevenue = 0;
    formattedSubscriptions.forEach(sub => {
        if (sub.status === 'active' && sub.plan && sub.plan.price) {
            // roughly normalize yearly to monthly
            if (sub.billingCycle === 'yearly') {
                monthlyRevenue += (sub.amount / 12);
            } else {
                monthlyRevenue += sub.amount;
            }
        }
    });

    res.json({
        success: true,
        data: {
            subscriptions: formattedSubscriptions,
            stats: {
                totalSubscriptions,
                activeCount,
                expiringSoon,
                monthlyRevenue: Math.round(monthlyRevenue)
            }
        }
    });
});

// POST /api/admin/subscriptions/seed-plans
// Utility to initially seed the DB
router.post('/seed-plans', authenticate, authorize('super_admin'), async (req, res) => {
    const count = await SubscriptionPlan.countDocuments();
    if (count > 0) {
        return res.status(400).json({ success: false, message: 'Plans already exist.' });
    }

    const plans = [
        {
            name: 'Starter',
            type: 'starter',
            description: 'Perfect for small cafés just getting started',
            price: { monthly: 999, yearly: 9990 },
            features: [
                'Up to 50 products',
                'Up to 100 orders/month',
                'Basic analytics',
                'Email support',
            ],
            limits: { maxProducts: 50, maxOrders: 100, maxStaff: 2 },
            isActive: true,
        },
        {
            name: 'Professional',
            type: 'professional',
            description: 'For growing cafés with more needs',
            price: { monthly: 2499, yearly: 24990 },
            features: [
                'Up to 200 products',
                'Unlimited orders',
                'Advanced analytics',
                'Priority support',
                'Inventory management',
            ],
            limits: { maxProducts: 200, maxOrders: -1, maxStaff: 5 },
            isActive: true,
        },
        {
            name: 'Enterprise',
            type: 'enterprise',
            description: 'For large café chains and franchises',
            price: { monthly: 4999, yearly: 49990 },
            features: [
                'Unlimited products',
                'Unlimited orders',
                'Custom analytics',
                '24/7 phone support',
                'Multi-location support',
                'API access',
            ],
            limits: { maxProducts: -1, maxOrders: -1, maxStaff: -1 },
            isActive: true,
        },
    ];

    const seeded = await SubscriptionPlan.insertMany(plans);
    res.json({ success: true, data: seeded });
});

// POST /api/admin/subscriptions/seed-test-subscription
// Utility to seed a test subscription for a cafe
router.post('/seed-test-subscription', authenticate, authorize('super_admin'), async (req, res) => {
    const { cafeId } = req.body;
    if (!cafeId) return res.status(400).json({ success: false, message: 'cafeId is required' });

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });

    const plan = await SubscriptionPlan.findOne({ type: 'professional' });
    if (!plan) return res.status(400).json({ success: false, message: 'Must seed plans first' });

    // Ensure no overlapping active subscription
    await Subscription.updateMany({ cafe: cafe._id }, { status: 'expired' });

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await Subscription.create({
        cafe: cafe._id,
        plan: plan._id,
        status: 'active',
        billingCycle: 'monthly',
        amount: plan.price.monthly,
        startDate: new Date(),
        endDate: endDate,
        autoRenew: true
    });

    // Emit live to super admin
    const io = req.app.get('io');
    if (io) {
        io.to('super_admin').emit('subscription-updated', {
            action: 'created',
            cafeId: cafe._id,
            subscription: subscription
        });
    }

    res.json({ success: true, data: subscription });
});

module.exports = router;
