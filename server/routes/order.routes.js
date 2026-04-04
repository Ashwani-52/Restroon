import express from 'express';
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    getCafeOrders,
    updateOrderStatus,
    cancelOrder,
    adminGetAllOrders,
    getPaymentDetails,
    markOrderPaid
} from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// ─── Customer Routes ───────────────────────
router.post('/', protect, requireRole(ROLES.CUSTOMER), placeOrder);
router.get('/my-orders', protect, requireRole(ROLES.CUSTOMER), getMyOrders);
router.post('/:orderId/cancel', protect, requireRole(ROLES.CUSTOMER), cancelOrder);
router.get('/:orderId/payment', protect, requireRole(ROLES.CUSTOMER), getPaymentDetails);
router.post('/:orderId/paid', protect, requireRole(ROLES.CUSTOMER), markOrderPaid);

// ─── Shared Route (Customer + Owner) ───────
router.get('/:orderId', protect, getOrderById);

// ─── Owner Routes ──────────────────────────
router.get('/cafe/all', protect, requireRole(ROLES.OWNER), getCafeOrders);
router.patch('/:orderId/status', protect, requireRole(ROLES.OWNER), updateOrderStatus);

// ─── Admin Routes ──────────────────────────
router.get('/admin/all', protect, requireRole(ROLES.ADMIN), adminGetAllOrders);

export default router;
