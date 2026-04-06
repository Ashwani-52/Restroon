import express from 'express';
import {
    getTodayCommission,
    createPayment,
    verifyPayment
} from '../controllers/commission.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.get('/today', protect, requireRole(ROLES.OWNER), getTodayCommission);
router.post('/create-payment', protect, requireRole(ROLES.OWNER), createPayment);
router.post('/verify', protect, requireRole(ROLES.OWNER), verifyPayment);

export default router;
