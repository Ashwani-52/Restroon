// server/routes/profile.routes.js
import express from 'express';
import {
    getProfile,
    updateProfile,
    addAddress,
    deleteAddress,
    toggleFavourite,
    getOrderHistory
} from '../controllers/profile.controller.js';
import { protect }      from '../middleware/auth.middleware.js';
import { requireRole }  from '../middleware/role.middleware.js';
import { ROLES }        from '../utils/constants.js';

const router = express.Router();

// All profile routes require authentication
router.use(protect);

// ─── Profile ────────────────────────────────
router.get('/',         getProfile);
router.patch('/update', updateProfile);

// ─── Addresses ──────────────────────────────
router.post('/address',             requireRole(ROLES.CUSTOMER), addAddress);
router.delete('/address/:addressId', requireRole(ROLES.CUSTOMER), deleteAddress);

// ─── Favourites ──────────────────────────────
router.post('/favourite/:cafeId', requireRole(ROLES.CUSTOMER), toggleFavourite);

// ─── Order History ───────────────────────────
router.get('/orders', requireRole(ROLES.CUSTOMER), getOrderHistory);

export default router;
