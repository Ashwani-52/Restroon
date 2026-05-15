import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import Cafe from '../models/Cafe.model.js';
import DeliveryInvite from '../models/DeliveryInvite.model.js';
import { DELIVERY_STATUS } from '../utils/constants.js';

// ──────────────────────────────────────────
// INVITE DELIVERY PARTNER (Cafe Owner)
// ──────────────────────────────────────────
export const inviteDeliveryPartner = async (req, res) => {
    try {
        const { phone, email } = req.body;

        if (!phone && !email) {
            return res.status(400).json({
                success: false,
                message: 'Phone or email is required'
            });
        }

        // Get owner's cafe
        const cafe = await Cafe.findOne({ owner: req.user._id });
        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found'
            });
        }

        // Check if invite already exists
        const existingInvite = await DeliveryInvite.findOne({
            cafeId: cafe._id,
            $or: [
                ...(phone ? [{ phone }] : []),
                ...(email ? [{ email }] : [])
            ],
            status: 'pending'
        });

        if (existingInvite) {
            return res.status(409).json({
                success: false,
                message: 'An invite already exists for this person'
            });
        }

        // Check if user already exists and link them directly
        let existingUser = null;
        if (email) {
            existingUser = await User.findOne({ email });
        }
        if (!existingUser && phone) {
            existingUser = await User.findOne({ phone });
        }

        if (existingUser) {
            // If user exists, directly assign them as delivery partner
            if (existingUser.role === 'delivery_partner' && existingUser.assignedCafe) {
                return res.status(409).json({
                    success: false,
                    message: 'This user is already assigned to a cafe'
                });
            }

            existingUser.role = 'delivery_partner';
            existingUser.assignedCafe = cafe._id;
            await existingUser.save({ validateBeforeSave: false });

            await DeliveryInvite.create({
                cafeId: cafe._id,
                phone: phone || '',
                email: email || '',
                status: 'accepted'
            });

            return res.status(200).json({
                success: true,
                message: 'User found and linked as delivery partner',
                partner: {
                    _id: existingUser._id,
                    name: existingUser.name,
                    phone: existingUser.phone,
                    email: existingUser.email,
                    isAvailable: existingUser.isAvailable
                }
            });
        }

        // Create pending invite
        const invite = await DeliveryInvite.create({
            cafeId: cafe._id,
            phone: phone || '',
            email: email || ''
        });

        res.status(201).json({
            success: true,
            message: 'Invite created. The partner can register using this phone/email.',
            invite
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to invite delivery partner',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET MY DELIVERY PARTNERS (Cafe Owner)
// ──────────────────────────────────────────
export const getMyDeliveryPartners = async (req, res) => {
    try {
        const cafe = await Cafe.findOne({ owner: req.user._id });
        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found'
            });
        }

        const partners = await User.find({
            assignedCafe: cafe._id,
            role: 'delivery_partner'
        })
            .select('name phone email isAvailable totalDeliveries currentAssignedOrders')
            .lean();

        // Attach active order counts
        const enriched = await Promise.all(
            partners.map(async (p) => {
                const activeCount = await Order.countDocuments({
                    deliveryPartnerId: p._id,
                    deliveryStatus: { $in: ['assigned', 'out_for_delivery'] }
                });
                return { ...p, activeOrders: activeCount };
            })
        );

        // Also fetch pending invites
        const pendingInvites = await DeliveryInvite.find({
            cafeId: cafe._id,
            status: 'pending'
        }).lean();

        res.status(200).json({
            success: true,
            partners: enriched,
            pendingInvites
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch delivery partners',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// REMOVE DELIVERY PARTNER (Cafe Owner)
// ──────────────────────────────────────────
export const removeDeliveryPartner = async (req, res) => {
    try {
        const { partnerId } = req.params;

        const cafe = await Cafe.findOne({ owner: req.user._id });
        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found'
            });
        }

        const partner = await User.findOne({
            _id: partnerId,
            assignedCafe: cafe._id,
            role: 'delivery_partner'
        });

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Delivery partner not found'
            });
        }

        // Check for active deliveries
        const activeOrders = await Order.countDocuments({
            deliveryPartnerId: partnerId,
            deliveryStatus: { $in: ['assigned', 'out_for_delivery'] }
        });

        if (activeOrders > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot remove — partner has ${activeOrders} active delivery(ies)`
            });
        }

        partner.role = 'customer';
        partner.assignedCafe = null;
        partner.currentAssignedOrders = [];
        await partner.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Delivery partner removed'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove delivery partner',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// ASSIGN DELIVERY PARTNER TO ORDER (Cafe Owner)
// ──────────────────────────────────────────
export const assignDeliveryPartner = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { deliveryPartnerId } = req.body;

        if (!deliveryPartnerId) {
            return res.status(400).json({
                success: false,
                message: 'deliveryPartnerId is required'
            });
        }

        const cafe = await Cafe.findOne({ owner: req.user._id });
        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found'
            });
        }

        // Find order belonging to this cafe
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

        // Verify partner is linked to this cafe and available
        const partner = await User.findOne({
            _id: deliveryPartnerId,
            assignedCafe: cafe._id,
            role: 'delivery_partner'
        });

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Delivery partner not found or not linked to your cafe'
            });
        }

        if (!partner.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Delivery partner is currently offline'
            });
        }

        // Assign
        order.deliveryPartnerId = deliveryPartnerId;
        order.deliveryStatus = DELIVERY_STATUS.ASSIGNED;
        order.assignedAt = new Date();
        await order.save();

        // Add to partner's current orders
        await User.findByIdAndUpdate(deliveryPartnerId, {
            $addToSet: { currentAssignedOrders: orderId }
        });

        res.status(200).json({
            success: true,
            message: 'Delivery partner assigned successfully',
            order
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to assign delivery partner',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// ADD CAFE NOTES TO ORDER (Cafe Owner)
// ──────────────────────────────────────────
export const addCafeNotes = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { cafeNotes } = req.body;

        const cafe = await Cafe.findOne({ owner: req.user._id });
        if (!cafe) {
            return res.status(404).json({ success: false, message: 'No cafe found' });
        }

        const order = await Order.findOneAndUpdate(
            { _id: orderId, cafe: cafe._id },
            { cafeNotes },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Cafe notes added',
            order
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to add cafe notes',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// DELETE PENDING INVITE (Cafe Owner)
// ──────────────────────────────────────────
export const deletePendingInvite = async (req, res) => {
    try {
        const { inviteId } = req.params;

        const cafe = await Cafe.findOne({ owner: req.user._id });
        if (!cafe) {
            return res.status(404).json({ success: false, message: 'No cafe found' });
        }

        const invite = await DeliveryInvite.findOneAndDelete({
            _id: inviteId,
            cafeId: cafe._id,
            status: 'pending'
        });

        if (!invite) {
            return res.status(404).json({ success: false, message: 'Invite not found' });
        }

        res.status(200).json({ success: true, message: 'Invite deleted' });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete invite',
            error: err.message
        });
    }
};
