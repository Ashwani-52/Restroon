import User from '../models/User.model.js';
import Cafe from '../models/Cafe.model.js';
import Order from '../models/Order.model.js';
import MenuItem from '../models/MenuItem.model.js';
import {
    CAFE_STATUS,
    ORDER_STATUS,
    ROLES
} from '../utils/constants.js';

// ──────────────────────────────────────────
// GET PLATFORM STATS
// ──────────────────────────────────────────
export const getPlatformStats = async (req, res) => {
    try {
        // ─── Run all counts in parallel ────────
        const [
            totalUsers,
            totalOwners,
            totalCustomers,
            totalCafes,
            activeCafes,
            pendingCafes,
            suspendedCafes,
            totalOrders,
            deliveredOrders,
            cancelledOrders,
            totalMenuItems
        ] = await Promise.all([
            User.countDocuments({ role: ROLES.CUSTOMER }),
            User.countDocuments({ role: ROLES.OWNER }),
            User.countDocuments({ role: ROLES.CUSTOMER }),
            Cafe.countDocuments(),
            Cafe.countDocuments({ status: CAFE_STATUS.ACTIVE }),
            Cafe.countDocuments({ status: CAFE_STATUS.PENDING }),
            Cafe.countDocuments({ status: CAFE_STATUS.SUSPENDED }),
            Order.countDocuments(),
            Order.countDocuments({ status: ORDER_STATUS.DELIVERED }),
            Order.countDocuments({ status: ORDER_STATUS.CANCELLED }),
            MenuItem.countDocuments()
        ]);

        // ─── Calculate total platform revenue ──
        const revenueData = await Order.aggregate([
            { $match: { status: ORDER_STATUS.DELIVERED } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueData[0]?.total || 0;

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    owners: totalOwners,
                    customers: totalCustomers
                },
                cafes: {
                    total: totalCafes,
                    active: activeCafes,
                    pending: pendingCafes,
                    suspended: suspendedCafes
                },
                orders: {
                    total: totalOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders
                },
                totalMenuItems,
                totalRevenue
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch platform stats',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET ALL USERS
// ──────────────────────────────────────────
export const getAllUsers = async (req, res) => {
    try {
        const { role, isActive } = req.query;

        const query = {};
        if (role) query.role = role;
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const users = await User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET SINGLE USER
// ──────────────────────────────────────────
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({ success: true, user });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// SUSPEND OR ACTIVATE USER
// ──────────────────────────────────────────
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // ─── Prevent admin from suspending self ─
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot suspend your own account'
            });
        }

        // ─── Prevent suspending another admin ──
        if (user.role === ROLES.ADMIN) {
            return res.status(400).json({
                success: false,
                message: 'Cannot suspend another admin'
            });
        }

        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'suspended'} successfully`,
            isActive: user.isActive
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to toggle user status',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET ALL CAFES (with filters)
// ──────────────────────────────────────────
export const adminGetCafes = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};

        if (status) query.status = status;

        const cafes = await Cafe.find(query)
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: cafes.length,
            cafes
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cafes',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// APPROVE / SUSPEND CAFE
// ──────────────────────────────────────────
export const adminUpdateCafeStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { cafeId } = req.params;

        if (!Object.values(CAFE_STATUS).includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${Object.values(CAFE_STATUS).join(', ')}`
            });
        }

        const cafe = await Cafe.findByIdAndUpdate(
            cafeId,
            { status },
            { new: true }
        ).populate('owner', 'name email');

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'Cafe not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Cafe ${status} successfully`,
            cafe
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update cafe status',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET ALL ORDERS (with filters)
// ──────────────────────────────────────────
export const adminGetOrders = async (req, res) => {
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