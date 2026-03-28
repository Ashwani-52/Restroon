// server/routes/payment.routes.js
import express from 'express';
import {
    createRazorpayOrder,
    verifyPayment,
    linkBankAccount,
    getBankingInfo
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// ─── Customer payment routes ─────────────────
router.post('/create-order', protect, requireRole(ROLES.CUSTOMER), createRazorpayOrder);
router.post('/verify', protect, requireRole(ROLES.CUSTOMER), verifyPayment);

// ─── Owner banking routes ────────────────────
router.post('/bank', protect, requireRole(ROLES.OWNER), linkBankAccount);
router.get('/bank', protect, requireRole(ROLES.OWNER), getBankingInfo);

export default router;