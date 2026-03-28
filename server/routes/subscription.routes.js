// server/routes/subscription.routes.js
import express from 'express';
import {
    createSubscriptionOrder,
    verifySubscriptionPayment,
    getSubscription
} from '../controllers/subscription.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.post('/create', protect, requireRole(ROLES.OWNER), createSubscriptionOrder);
router.post('/verify', protect, requireRole(ROLES.OWNER), verifySubscriptionPayment);
router.get('/', protect, requireRole(ROLES.OWNER), getSubscription);

export default router;