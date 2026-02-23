const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cafe = require('../models/Cafe');
const Product = require('../models/Product');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/analytics/dashboard?cafeId=xxx
router.get('/dashboard', authenticate, async (req, res) => {
    const { cafeId } = req.query;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [allOrders, todayOrders, lowStock, activeCustomers] = await Promise.all([
        Order.find({ cafe: cafeId }),
        Order.find({ cafe: cafeId, createdAt: { $gte: today, $lt: tomorrow } }),
        Inventory.countDocuments({ cafe: cafeId, $expr: { $lte: ['$currentStock', '$minStock'] } }),
        Order.distinct('customer.phone', { cafe: cafeId, status: { $ne: 'cancelled' } })
    ]);

    const totalRevenue = allOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
    const todayRevenue = todayOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);

    res.json({
        success: true, data: {
            totalOrders: allOrders.length,
            totalRevenue,
            todayOrders: todayOrders.length,
            todayRevenue,
            pendingOrders: allOrders.filter(o => o.status === 'pending').length,
            preparingOrders: allOrders.filter(o => o.status === 'preparing').length,
            readyOrders: allOrders.filter(o => o.status === 'ready').length,
            lowStockItems: lowStock,
            activeCustomers: activeCustomers.length,
        }
    });
});

// GET /api/analytics/sales?cafeId=xxx&period=week
router.get('/sales', authenticate, async (req, res) => {
    const { cafeId, period = 'week' } = req.query;
    const days = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const from = new Date(); from.setDate(from.getDate() - days);

    const orders = await Order.find({ cafe: cafeId, createdAt: { $gte: from }, status: { $ne: 'cancelled' } });
    // Group by date
    const map = {};
    orders.forEach(o => {
        const d = o.createdAt.toISOString().split('T')[0];
        if (!map[d]) map[d] = { date: d, revenue: 0, orders: 0 };
        map[d].revenue += o.total;
        map[d].orders += 1;
    });
    res.json({ success: true, data: Object.values(map).sort((a, b) => a.date.localeCompare(b.date)) });
});

// GET /api/analytics/top-products?cafeId=xxx
router.get('/top-products', authenticate, async (req, res) => {
    const { cafeId, limit = 5 } = req.query;
    const orders = await Order.find({ cafe: cafeId, status: { $ne: 'cancelled' } });
    const productMap = {};
    orders.forEach(o => o.items.forEach(i => {
        const id = String(i.product);
        if (!productMap[id]) productMap[id] = { product: { _id: id, name: i.name }, totalSold: 0, totalRevenue: 0 };
        productMap[id].totalSold += i.quantity;
        productMap[id].totalRevenue += i.price * i.quantity;
    }));
    const sorted = Object.values(productMap).sort((a, b) => b.totalSold - a.totalSold).slice(0, Number(limit));
    res.json({ success: true, data: sorted });
});

// GET /api/analytics/revenue-by-category?cafeId=xxx
router.get('/revenue-by-category', authenticate, async (req, res) => {
    res.json({ success: true, data: [] }); // stub
});

// GET /api/analytics/order-stats?cafeId=xxx&period=week
router.get('/order-stats', authenticate, async (req, res) => {
    res.json({ success: true, data: [] }); // stub
});

// GET /api/analytics/platform (super admin)
router.get('/platform', authenticate, authorize('super_admin'), async (req, res) => {
    const [totalCafes, totalUsers, totalOrders, revenueOrders] = await Promise.all([
        Cafe.countDocuments(),
        User.countDocuments(),
        Order.countDocuments(),
        Order.find({ status: { $ne: 'cancelled' } }),
    ]);
    const totalRevenue = revenueOrders.reduce((s, o) => s + o.total, 0);
    res.json({ success: true, data: { totalCafes, totalUsers, totalOrders, totalRevenue } });
});

// GET /api/analytics/cafe-performance (super admin)
router.get('/cafe-performance', authenticate, authorize('super_admin'), async (req, res) => {
    const cafes = await Cafe.find();
    const performance = await Promise.all(cafes.map(async (cafe) => {
        const orders = await Order.find({ cafe: cafe._id, status: { $ne: 'cancelled' } });
        return { cafe, orders: orders.length, revenue: orders.reduce((s, o) => s + o.total, 0) };
    }));
    res.json({ success: true, data: performance });
});

// GET /api/analytics/subscription-stats (super admin)
router.get('/subscription-stats', authenticate, authorize('super_admin'), async (req, res) => {
    res.json({ success: true, data: [] }); // stub
});

// GET /api/analytics/platform-growth (super admin)
router.get('/platform-growth', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const cafes = await Cafe.find({ createdAt: { $gte: sixMonthsAgo } });
        const orders = await Order.find({ createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } });

        const monthMap = {};
        for (let i = 0; i < 6; i++) {
            const d = new Date(sixMonthsAgo);
            d.setMonth(sixMonthsAgo.getMonth() + i);
            const monthStr = d.toLocaleString('default', { month: 'short' });
            monthMap[monthStr] = { month: monthStr, cafes: 0, revenue: 0, orderNum: d.getMonth() };
        }

        cafes.forEach(c => {
            if (!c.createdAt) return;
            const m = c.createdAt.toLocaleString('default', { month: 'short' });
            if (monthMap[m]) monthMap[m].cafes += 1;
        });

        orders.forEach(o => {
            if (!o.createdAt) return;
            const m = o.createdAt.toLocaleString('default', { month: 'short' });
            if (monthMap[m]) monthMap[m].revenue += o.total;
        });

        const data = Object.values(monthMap).sort((a, b) => a.orderNum - b.orderNum).map(({ orderNum, ...rest }) => rest);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/analytics/recent-signups (super admin)
router.get('/recent-signups', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const cafes = await Cafe.find().sort({ createdAt: -1 }).limit(5).populate('owner', 'name');
        const data = cafes.map(c => ({
            name: c.name || 'Unnamed Cafe',
            owner: c.owner?.name || 'Unknown',
            date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Unknown date',
            status: c.status || (c.isActive ? 'active' : 'pending')
        }));
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
