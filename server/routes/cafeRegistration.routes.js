// server/routes/cafeRegistration.routes.js
import express from 'express';
import {
    saveTempDetails,
    createRegistrationOrder,
    verifyAndActivate,
    getRegistrationStatus,
    getMyCafe,
    getSubscriptionStatus,
} from '../controllers/cafeRegistration.controller.js';
import { protect }     from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES }       from '../utils/constants.js';

const router = express.Router();

// All routes require authenticated owner
router.use(protect);
router.use(requireRole(ROLES.OWNER));

router.post('/save-details',           saveTempDetails);
router.post('/create-order',           createRegistrationOrder);
router.post('/verify-and-activate',    verifyAndActivate);
router.get ('/status',                 getRegistrationStatus);
router.get ('/my-cafe',                getMyCafe);
router.get ('/subscription-status',    getSubscriptionStatus);

export default router;

