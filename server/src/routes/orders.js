const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/orders
router.get('/', authenticate, async (req, res) => {
    const { cafeId, status, paymentStatus, startDate, endDate, page = 1, limit = 50 } = req.query;
    // Hash Maps, Array Traversal, Reduce Pattern, Set Filtering, Finite State Machine, Event Queues, and Parallel Execution
    // DSA: Using JavaScript Object as a Hash Map
    // Key-value pairs allow O(1) average-time filtering
    // This dynamically builds MongoDB query conditions
    const query = {};
    if (cafeId) query.cafe = cafeId;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    // DSA: Pagination using index arithmetic (.skip((page - 1) * limit)
    // .limit(Number(limit)))
    // Reduces space complexity by fetching limited records
    // Improves performance for large datasets
    const [orders, total] = await Promise.all([
        Order.find(query).populate('items.product', 'name price').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
        Order.countDocuments(query),
    ]);
    res.json({ success: true, data: { data: orders, total, page: Number(page), limit: Number(limit) } });
});

// GET /api/orders/active?cafeId=xxx
router.get('/active', authenticate, async (req, res) => {
    const { cafeId } = req.query;
    const orders = await Order.find({
        cafe: cafeId,
        status: { $in: ['pending', 'preparing', 'ready'] },
    }).populate('items.product', 'name').sort('-createdAt');
    res.json({ success: true, data: orders });
});

// GET /api/orders/today?cafeId=xxx
router.get('/today', authenticate, async (req, res) => {
    const { cafeId } = req.query;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const orders = await Order.find({ cafe: cafeId, createdAt: { $gte: start, $lte: end } }).sort('-createdAt');
    res.json({ success: true, data: orders });
});

// GET /api/orders/number/:orderNumber
router.get('/number/:orderNumber', authenticate, async (req, res) => {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('items.product', 'name price image');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
});

// POST /api/orders - Create new order
router.post('/', authenticate, async (req, res) => {
    const { cafe, items, orderType, tableNumber, customer, notes } = req.body;

    //ARRAY MAPPING

    // Fetch product prices and build order
    // DSA: Array traversal using map(), items.map(async)
    // Iterates through each order item to enrich product data
    // Time Complexity: O(n)
    const orderItems = await Promise.all(items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw Object.assign(new Error(`Product ${item.product} not found`), { statusCode: 404 });
        return {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            variant: item.variant,
            addons: item.addons || [],
            notes: item.notes,
        };
    }));
    //REDUCTION - AGGREGATION PATTERN
    // DSA: Reduce (accumulator) pattern
    // Aggregates item-wise price to calculate subtotal
    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    const order = await Order.create({
        cafe,
        items: orderItems,
        orderType: orderType || 'dine_in',
        tableNumber,
        customer,
        notes,
        subtotal,
        tax,
        total,
    });
    //Real-Time Events → QUEUE (io)
    // Emit socket event
    // DSA: Event-driven architecture
    // Orders are pushed into real-time event queue using sockets
    const io = req.app.get('io');
    if (io) io.to(String(cafe)).emit('new-order', order);

    res.status(201).json({ success: true, data: order });
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.to(String(order.cafe)).to(`order-${order._id}`).emit('order-update', order);

    res.json({ success: true, data: order });
});

// PATCH /api/orders/:id/payment
router.patch('/:id/payment', authenticate, async (req, res) => {
    const { paymentStatus, transactionId } = req.body;
    const order = await Order.findByIdAndUpdate(
        req.params.id, { paymentStatus, transactionId }, { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const io = req.app.get('io');
    if (io) {
        if (paymentStatus === 'paid') io.to(String(order.cafe)).to(`order-${order._id}`).emit('payment-success', { orderId: order._id, status: 'paid' });
        else if (paymentStatus === 'failed') io.to(String(order.cafe)).to(`order-${order._id}`).emit('payment-failed', { orderId: order._id, error: 'Payment failed' });
    }

    res.json({ success: true, data: order });
});

// PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', authenticate, async (req, res) => {
    const { reason } = req.body;
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: 'cancelled', cancellationReason: reason },
        { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const io = req.app.get('io');
    if (io) io.to(String(order.cafe)).to(`order-${order._id}`).emit('order-update', order);

    res.json({ success: true, data: order });
});

module.exports = router;
