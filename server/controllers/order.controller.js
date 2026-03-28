import Order from '../models/Order.model.js';
import Cafe from '../models/Cafe.model.js';
import MenuItem from '../models/MenuItem.model.js';
import {
    ORDER_STATUS,
    CAFE_STATUS
} from '../utils/constants.js';

// ──────────────────────────────────────────
// PLACE ORDER (Customer only)
// ──────────────────────────────────────────
export const placeOrder = async (req, res) => {
    try {
        const {
            cafeId,
            items,
            paymentMethod,
            deliveryAddress,
            orderType,
            note
        } = req.body;

        // ─── Validate required fields ──────────
        if (!cafeId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cafe and items are required'
            });
        }

        // Delivery address required only for delivery orders
        if (orderType !== 'dine_in' && (!deliveryAddress?.street || !deliveryAddress?.city)) {
            return res.status(400).json({
                success: false,
                message: 'Delivery address is required for delivery orders'
            });
        }

        // ─── Check cafe exists and is active ───
        const cafe = await Cafe.findById(cafeId);

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'Cafe not found'
            });
        }

        if (cafe.status !== CAFE_STATUS.ACTIVE) {
            return res.status(400).json({
                success: false,
                message: 'This cafe is not available'
            });
        }

        if (!cafe.isOpen) {
            return res.status(400).json({
                success: false,
                message: 'This cafe is currently closed'
            });
        }

        // ─── Validate items + calculate total ──
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            if (!item.menuItemId || !item.quantity || item.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have menuItemId and valid quantity'
                });
            }

            // ─── Find menu item ─────────────────
            const menuItem = await MenuItem.findOne({
                _id: item.menuItemId,
                cafe: cafeId,
                isAvailable: true
            });

            if (!menuItem) {
                return res.status(404).json({
                    success: false,
                    message: `Menu item not found or unavailable`
                });
            }

            // ─── Snapshot item at order time ────
            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: item.quantity,
                image: menuItem.image
            });

            totalAmount += menuItem.price * item.quantity;
        }

        // ─── Create order ──────────────────────
        const order = await Order.create({
            customer: req.user._id,
            cafe: cafeId,
            items: orderItems,
            totalAmount,
            paymentMethod: paymentMethod || 'cod',
            deliveryAddress,
            note: note || ''
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to place order',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET MY ORDERS (Customer only)
// ──────────────────────────────────────────
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id })
            .populate('cafe', 'name logo address.city')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET SINGLE ORDER (Customer + Owner)
// ──────────────────────────────────────────
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('customer', 'name email phone')
            .populate('cafe', 'name logo phone address')
            .populate('items.menuItem', 'name image price');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // ─── Only customer or cafe owner can see ─
        const cafe = await Cafe.findOne({ owner: req.user._id });

        const isCustomer = order.customer._id.toString() === req.user._id.toString();
        const isOwner = cafe && order.cafe._id.toString() === cafe._id.toString();

        if (!isCustomer && !isOwner && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.status(200).json({ success: true, order });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET CAFE ORDERS (Owner only)
// ──────────────────────────────────────────
export const getCafeOrders = async (req, res) => {
    try {
        const cafe = await Cafe.findOne({ owner: req.user._id });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found'
            });
        }

        const { status } = req.query;
        const query = { cafe: cafe._id };

        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('customer', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cafe orders',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// UPDATE ORDER STATUS (Owner only)
// ──────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // ─── Validate status ───────────────────
        if (!Object.values(ORDER_STATUS).includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${Object.values(ORDER_STATUS).join(', ')}`
            });
        }

        // ─── Get owner's cafe ──────────────────
        const cafe = await Cafe.findOne({ owner: req.user._id });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found'
            });
        }

        // ─── Find order belonging to this cafe ─
        const order = await Order.findOne({
            _id: orderId,
            cafe: cafe._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // ─── Prevent going backwards in status ─
        const statusFlow = [
            ORDER_STATUS.PLACED,
            ORDER_STATUS.ACCEPTED,
            ORDER_STATUS.PREPARING,
            ORDER_STATUS.OUT_FOR_DELIVERY,
            ORDER_STATUS.DELIVERED
        ];

        const currentIndex = statusFlow.indexOf(order.status);
        const newIndex = statusFlow.indexOf(status);

        if (
            newIndex !== -1 &&
            currentIndex !== -1 &&
            newIndex < currentIndex
        ) {
            return res.status(400).json({
                success: false,
                message: `Cannot go back from "${order.status}" to "${status}"`
            });
        }

        // ─── Update status ─────────────────────
        order.status = status;

        // ─── If delivered, update cafe revenue ─
        if (status === ORDER_STATUS.DELIVERED) {
            await Cafe.findByIdAndUpdate(
                cafe._id,
                { $inc: { totalRevenue: order.totalAmount } }
            );

            // ─── Mark payment as paid for COD ───
            if (order.paymentMethod === 'cod') {
                order.paymentStatus = 'paid';
            }
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: `Order status updated to "${status}"`,
            order
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// CANCEL ORDER (Customer only)
// ──────────────────────────────────────────
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            customer: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // ─── Can only cancel if still placed ───
        if (order.status !== ORDER_STATUS.PLACED) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order. Current status: "${order.status}"`
            });
        }

        order.status = ORDER_STATUS.CANCELLED;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// ADMIN — GET ALL ORDERS
// ──────────────────────────────────────────
export const adminGetAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};

        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('customer', 'name email')
            .populate('cafe', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: err.message
        });
    }
};