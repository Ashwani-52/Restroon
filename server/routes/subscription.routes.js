// server/routes/subscription.routes.js
import express from 'express';
import {
    startTrial,
    createSubscriptionOrder,
    verifySubscriptionPayment,
    getSubscriptionStatus
} from '../controllers/subscription.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All subscription routes require auth + owner role
router.post('/start-trial',   protect, requireRole(ROLES.OWNER), startTrial);
router.post('/create-order',  protect, requireRole(ROLES.OWNER), createSubscriptionOrder);
router.post('/verify',        protect, requireRole(ROLES.OWNER), verifySubscriptionPayment);
router.get('/status',         protect, requireRole(ROLES.OWNER), getSubscriptionStatus);

export default router;