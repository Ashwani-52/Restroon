import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import Cafe from '../models/Cafe.model.js';
import { DELIVERY_STATUS, ORDER_STATUS } from '../utils/constants.js';

// ──────────────────────────────────────────
// GET MY DELIVERY ORDERS (Delivery Partner)
// Priority: prepaid oldest → COD → failed retries
// ──────────────────────────────────────────
export const getMyDeliveryOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            deliveryPartnerId: req.user._id,
            deliveryStatus: { $in: ['assigned', 'out_for_delivery', 'failed'] }
        })
            .populate('cafe', 'name phone address')
            .populate('customer', 'name phone')
            .sort({ createdAt: 1 })
            .lean();

        // Priority sort: prepaid oldest → COD → failed
        const sorted = orders.sort((a, b) => {
            const priority = (o) => {
                if (o.deliveryStatus === 'failed') return 3;
                if (o.paymentMethod === 'razorpay' || o.paymentMethod === 'upi') return 1;
                return 2; // COD
            };
            const diff = priority(a) - priority(b);
            if (diff !== 0) return diff;
            return new Date(a.createdAt) - new Date(b.createdAt); // oldest first within same priority
        });

        // Also fetch today's delivered count
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const deliveredToday = await Order.countDocuments({
            deliveryPartnerId: req.user._id,
            deliveryStatus: 'delivered',
            deliveredAt: { $gte: todayStart }
        });

        res.status(200).json({
            success: true,
            count: sorted.length,
            deliveredToday,
            orders: sorted
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch delivery orders',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET AVAILABLE ORDERS (Unassigned from linked cafe)
// ──────────────────────────────────────────
export const getAvailableOrders = async (req, res) => {
    try {
        if (!req.user.assignedCafe) {
            return res.status(400).json({
                success: false,
                message: 'You are not linked to any cafe'
            });
        }

        const orders = await Order.find({
            cafe: req.user.assignedCafe,
            deliveryStatus: DELIVERY_STATUS.UNASSIGNED,
            orderType: 'delivery',
            paymentConfirmed: true,
            status: { $in: [ORDER_STATUS.PLACED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING] }
        })
            .populate('customer', 'name phone')
            .sort({ createdAt: 1 })
            .lean();

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available orders',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// UPDATE DELIVERY STATUS
// ──────────────────────────────────────────
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { deliveryStatus, deliveryNotes, paymentCollected } = req.body;

        // Validate status
        const validStatuses = ['out_for_delivery', 'delivered', 'failed'];
        if (!validStatuses.includes(deliveryStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid delivery status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Find order assigned to this delivery partner
        const order = await Order.findOne({
            _id: orderId,
            deliveryPartnerId: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or not assigned to you'
            });
        }

        // Validate transitions
        const validTransitions = {
            assigned: ['out_for_delivery', 'failed'],
            out_for_delivery: ['delivered', 'failed'],
            failed: ['out_for_delivery', 'failed'] // can retry
        };

        if (!validTransitions[order.deliveryStatus]?.includes(deliveryStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot transition from "${order.deliveryStatus}" to "${deliveryStatus}"`
            });
        }

        // Update order
        order.deliveryStatus = deliveryStatus;

        if (deliveryNotes) {
            order.deliveryNotes = deliveryNotes;
        }

        if (deliveryStatus === 'delivered') {
            order.deliveredAt = new Date();
            order.status = ORDER_STATUS.DELIVERED;

            // Handle COD payment collection
            if (order.paymentMethod === 'cod' && paymentCollected !== undefined) {
                order.paymentCollected = paymentCollected;
                if (paymentCollected) {
                    order.paymentStatus = 'paid';
                }
            }

            // Increment partner's total deliveries
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { totalDeliveries: 1 },
                $pull: { currentAssignedOrders: orderId }
            });

            // Update cafe revenue
            await Cafe.findByIdAndUpdate(order.cafe, {
                $inc: { totalRevenue: order.totalAmount }
            });
        }

        if (deliveryStatus === 'failed') {
            order.deliveryAttempts = (order.deliveryAttempts || 0) + 1;
        }

        if (deliveryStatus === 'out_for_delivery') {
            order.status = ORDER_STATUS.OUT_FOR_DELIVERY;
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: `Delivery status updated to "${deliveryStatus}"`,
            order
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update delivery status',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// TOGGLE AVAILABILITY
// ──────────────────────────────────────────
export const toggleAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;

        if (typeof isAvailable !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isAvailable must be a boolean'
            });
        }

        await User.findByIdAndUpdate(req.user._id, { isAvailable });

        res.status(200).json({
            success: true,
            message: `Availability set to ${isAvailable ? 'online' : 'offline'}`,
            isAvailable
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to toggle availability',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET DELIVERY PROFILE
// ──────────────────────────────────────────
export const getDeliveryProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('assignedCafe', 'name phone address')
            .lean();

        const activeOrders = await Order.countDocuments({
            deliveryPartnerId: req.user._id,
            deliveryStatus: { $in: ['assigned', 'out_for_delivery'] }
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const deliveredToday = await Order.countDocuments({
            deliveryPartnerId: req.user._id,
            deliveryStatus: 'delivered',
            deliveredAt: { $gte: todayStart }
        });

        res.status(200).json({
            success: true,
            profile: {
                name: user.name,
                phone: user.phone,
                email: user.email,
                isAvailable: user.isAvailable,
                totalDeliveries: user.totalDeliveries,
                activeOrders,
                deliveredToday,
                assignedCafe: user.assignedCafe
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch delivery profile',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET DELIVERY INFO (For customer order tracking)
// ──────────────────────────────────────────
export const getDeliveryInfo = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('deliveryPartnerId', 'name phone')
            .lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Only order's customer or cafe owner can see this
        const isCustomer = order.customer.toString() === req.user._id.toString();
        const cafe = await Cafe.findOne({ owner: req.user._id });
        const isOwner = cafe && order.cafe.toString() === cafe._id.toString();
        const isPartner = order.deliveryPartnerId?._id?.toString() === req.user._id.toString();

        if (!isCustomer && !isOwner && !isPartner && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (!order.deliveryPartnerId) {
            return res.status(200).json({
                success: true,
                deliveryInfo: null
            });
        }

        res.status(200).json({
            success: true,
            deliveryInfo: {
                partnerName: order.deliveryPartnerId.name,
                partnerPhone: order.deliveryPartnerId.phone,
                deliveryStatus: order.deliveryStatus,
                assignedAt: order.assignedAt,
                deliveredAt: order.deliveredAt
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch delivery info',
            error: err.message
        });
    }
};
