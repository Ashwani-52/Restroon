import Order from '../models/Order.model.js';
import Cafe from '../models/Cafe.model.js';
import Commission from '../models/Commission.model.js';
import Notification from '../models/Notification.model.js';
import crypto from 'crypto';
import { getAdminRazorpay } from '../config/razorpay.js';
import { PLATFORM_FEE_FLAT } from '../utils/constants.js';

// ────────────────────────────────────────────────────────────
// GET /api/commission/cafe-dues
// Cafe owner — see their unpaid delivered orders
// ────────────────────────────────────────────────────────────
export const getCafeDues = async (req, res) => {
    try {
        const cafe = await Cafe.findOne({ owner: req.user._id });
        if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });

        // Fetch unpaid delivered orders — populate customer details
        const unpaidOrders = await Order.find({
            cafe: cafe._id,
            status: 'delivered',
            commissionPaid: { $ne: true }
        })
        .populate('customer', 'name phone email')
        .select('_id totalAmount foodTotal platformFeeAmount createdAt customer commissionPaid')
        .sort({ createdAt: -1 })
        .lean();

        const totalDue = unpaidOrders.reduce((sum, order) => sum + (order.platformFeeAmount || 0), 0);

        res.json({
            success: true,
            unpaidOrders,
            unpaidCount: unpaidOrders.length,
            feePerOrder: PLATFORM_FEE_FLAT,
            totalDue
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ────────────────────────────────────────────────────────────
// POST /api/commission/create-payment
// Create Razorpay order for commission payment
// ────────────────────────────────────────────────────────────
export const createPayment = async (req, res) => {
    try {
        const cafe = await Cafe.findOne({ owner: req.user._id });
        if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });

        const unpaidOrders = await Order.find({
            cafe: cafe._id,
            status: 'delivered',
            commissionPaid: { $ne: true }
        }).select('_id platformFeeAmount');  // ← must include platformFeeAmount for reduce

        if (!unpaidOrders.length) {
            return res.status(400).json({ success: false, message: 'No dues pending' });
        }

        const totalDue = +unpaidOrders.reduce((sum, order) => sum + (order.platformFeeAmount || 0), 0).toFixed(2);

        if (totalDue <= 0) {
            return res.status(400).json({ success: false, message: 'Total due is ₹0 — nothing to pay' });
        }

        const options = {
            amount: totalDue * 100, // paise
            currency: 'INR',
            receipt: `comm_${cafe._id}_${Date.now()}`.slice(0, 40),
            notes: {
                cafeId: cafe._id.toString(),
                cafeName: cafe.name,
                orderIds: unpaidOrders.map(o => o._id).join(','),
                type: 'platform_commission'
            }
        };

        const razorpayOrder = await getAdminRazorpay().orders.create(options);

        res.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount, // already in paise
            totalDue,
            keyId: process.env.ADMIN_RAZORPAY_KEY_ID
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ────────────────────────────────────────────────────────────
// POST /api/commission/verify
// Verify and mark orders as commission-paid
// ────────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.ADMIN_RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        const cafe = await Cafe.findOne({ owner: req.user._id });

        // Get all unpaid delivered orders for this cafe
        const unpaidOrders = await Order.find({
            cafe: cafe._id,
            status: 'delivered',
            commissionPaid: { $ne: true }
        });

        if (!unpaidOrders.length) {
            return res.status(400).json({ success: false, message: 'No unpaid orders found' });
        }

        const amountPaid = unpaidOrders.reduce((sum, order) => sum + (order.platformFeeAmount || 0), 0);
        const orderIds = unpaidOrders.map(o => o._id);

        // 1. Mark orders as commission paid (bulk)
        await Order.updateMany(
            { _id: { $in: orderIds } },
            {
                $set: {
                    commissionPaid: true,
                    commissionPaidAt: new Date(),
                    commissionPaymentId: razorpay_payment_id
                }
            }
        );

        // 2. Save commission record for admin tracking
        await Commission.create({
            cafe: cafe._id,
            owner: req.user._id,
            orders: orderIds,
            orderCount: unpaidOrders.length,
            amountPaid,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            paidAt: new Date()
        });

        // 3. Clear system reminders
        await Notification.updateMany(
            { user: req.user._id, type: 'COMMISSION_REMINDER', read: false },
            { $set: { read: true } }
        );

        res.json({
            success: true,
            message: `Commission of ₹${amountPaid} paid successfully!`,
            amountPaid,
            orderCount: unpaidOrders.length
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ────────────────────────────────────────────────────────────
// GET /api/commission/admin-summary
// Aggregated stats for platform admin
// ────────────────────────────────────────────────────────────
export const getAdminSummary = async (req, res) => {
    try {
        // 1. Total collected commission
        const collectedAgg = await Commission.aggregate([
            { $group: { _id: null, total: { $sum: '$amountPaid' } } }
        ]);
        const totalCollected = collectedAgg[0]?.total || 0;

        // 2. Pending per cafe (delivered orders where commissionPaid != true)
        const pendingAgg = await Order.aggregate([
            {
                $match: {
                    status: 'delivered',
                    commissionPaid: { $ne: true }
                }
            },
            {
                $group: {
                    _id: '$cafe',
                    orderCount: { $sum: 1 },
                    pendingAmount: { $sum: '$platformFeeAmount' }
                }
            },
            {
                $lookup: {
                    from: 'cafes',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'cafeInfo'
                }
            },
            { $unwind: '$cafeInfo' },
            {
                $project: {
                    cafeName: '$cafeInfo.name',
                    cafeCity: '$cafeInfo.address.city',
                    orderCount: 1,
                    pendingAmount: 1
                }
            },
            { $sort: { pendingAmount: -1 } }
        ]);

        const totalPending = pendingAgg.reduce((s, c) => s + c.pendingAmount, 0);

        // 3. Recent commission payments (last 10)
        const recentPayments = await Commission.find()
            .sort({ paidAt: -1 })
            .limit(10)
            .populate('cafe', 'name address.city')
            .populate('owner', 'name email')
            .lean();

        res.json({
            success: true,
            totalCollected,
            totalPending,
            pendingByCafe: pendingAgg,
            recentPayments
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
