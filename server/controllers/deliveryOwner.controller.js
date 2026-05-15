import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import Cafe from '../models/Cafe.model.js';
import DeliveryInvite from '../models/DeliveryInvite.model.js';
import { DELIVERY_STATUS } from '../utils/constants.js';
import { sendDeliveryInviteEmail } from '../utils/email.js';

// ── Generate random 8-char alphanumeric invite code ──
const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/1/I confusion
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

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

        // Check if pending invite already exists
        const existingInvite = await DeliveryInvite.findOne({
            cafeId: cafe._id,
            $or: [
                ...(phone ? [{ phone }] : []),
                ...(email ? [{ email }] : [])
            ],
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });

        if (existingInvite) {
            return res.status(409).json({
                success: false,
                message: `An active invite already exists for this person. Code: ${existingInvite.inviteCode}`
            });
        }

        // Generate unique invite code
        let inviteCode = generateInviteCode();
        // Ensure uniqueness (very unlikely collision)
        while (await DeliveryInvite.findOne({ inviteCode })) {
            inviteCode = generateInviteCode();
        }

        // Create invite with 7-day expiry
        const invite = await DeliveryInvite.create({
            cafeId: cafe._id,
            cafeName: cafe.name,
            phone: phone || '',
            email: email || '',
            inviteCode,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        // Send invite email (fire-and-forget, never blocks response)
        if (email) {
            sendDeliveryInviteEmail({
                to: email,
                cafeName: cafe.name,
                inviteCode
            }).catch(err => console.error('[EMAIL] Invite email failed:', err.message));
        }

        res.status(201).json({
            success: true,
            message: email
                ? `Invite sent to ${email} with code ${inviteCode}`
                : `Invite created. Share this code with your partner: ${inviteCode}`,
            inviteCode,
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
