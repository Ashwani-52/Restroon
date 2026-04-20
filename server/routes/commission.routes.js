import express from 'express';
import {
    getCafeDues,
    createPayment,
    verifyPayment,
    getAdminSummary
} from '../controllers/commission.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// Cafe Owner routes
router.get('/cafe-dues', protect, requireRole(ROLES.OWNER), getCafeDues);
router.post('/create-payment', protect, requireRole(ROLES.OWNER), createPayment);
router.post('/verify', protect, requireRole(ROLES.OWNER), verifyPayment);

// Admin routes
router.get('/admin-summary', protect, requireRole(ROLES.ADMIN), getAdminSummary);

export default router;
