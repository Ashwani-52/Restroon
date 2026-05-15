import express from 'express';
import {
    getMyDeliveryOrders,
    getAvailableOrders,
    updateDeliveryStatus,
    toggleAvailability,
    getDeliveryProfile,
    getDeliveryInfo
} from '../controllers/delivery.controller.js';
import {
    inviteDeliveryPartner,
    getMyDeliveryPartners,
    removeDeliveryPartner,
    assignDeliveryPartner,
    addCafeNotes,
    deletePendingInvite
} from '../controllers/deliveryOwner.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// ─── Delivery Partner Routes ───────────────
router.get('/orders',              protect, requireRole(ROLES.DELIVERY_PARTNER), getMyDeliveryOrders);
router.get('/orders/available',    protect, requireRole(ROLES.DELIVERY_PARTNER), getAvailableOrders);
router.patch('/orders/:orderId/status', protect, requireRole(ROLES.DELIVERY_PARTNER), updateDeliveryStatus);
router.patch('/availability',      protect, requireRole(ROLES.DELIVERY_PARTNER), toggleAvailability);
router.get('/profile',             protect, requireRole(ROLES.DELIVERY_PARTNER), getDeliveryProfile);

// ─── Delivery Info (Customer/Owner/Partner can access) ──
router.get('/orders/:orderId/info', protect, getDeliveryInfo);

// ─── Cafe Owner — Delivery Partner Management ──
router.post('/partners/invite',              protect, requireRole(ROLES.OWNER), inviteDeliveryPartner);
router.get('/partners',                      protect, requireRole(ROLES.OWNER), getMyDeliveryPartners);
router.delete('/partners/:partnerId',        protect, requireRole(ROLES.OWNER), removeDeliveryPartner);
router.patch('/orders/:orderId/assign',      protect, requireRole(ROLES.OWNER), assignDeliveryPartner);
router.patch('/orders/:orderId/cafe-notes',  protect, requireRole(ROLES.OWNER), addCafeNotes);
router.delete('/invites/:inviteId',          protect, requireRole(ROLES.OWNER), deletePendingInvite);

export default router;
