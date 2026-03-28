import express from 'express';
import {
    registerCafe,
    getMyCafe,
    updateMyCafe,
    toggleCafeStatus,
    getActiveCafes,
    getCafeBySlug,
    adminGetAllCafes,
    adminUpdateCafeStatus
} from '../controllers/cafe.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// ─── Public Routes ─────────────────────────
router.get('/', getActiveCafes);
router.get('/slug/:slug', getCafeBySlug);

// ─── Owner Routes ──────────────────────────
router.post('/', protect, requireRole(ROLES.OWNER), registerCafe);
router.get('/my-cafe', protect, requireRole(ROLES.OWNER), getMyCafe);
router.put('/my-cafe', protect, requireRole(ROLES.OWNER), updateMyCafe);
router.patch('/my-cafe/toggle', protect, requireRole(ROLES.OWNER), toggleCafeStatus);

// ─── Admin Routes ──────────────────────────
router.get('/admin/all', protect, requireRole(ROLES.ADMIN), adminGetAllCafes);
router.patch('/admin/:cafeId/status', protect, requireRole(ROLES.ADMIN), adminUpdateCafeStatus);

export default router;
