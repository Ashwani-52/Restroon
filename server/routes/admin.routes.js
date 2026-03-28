import express from 'express';
import {
  getPlatformStats,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  adminGetCafes,
  adminUpdateCafeStatus,
  adminGetOrders
} from '../controllers/admin.controller.js';
import { protect }     from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES }       from '../utils/constants.js';

const router = express.Router();

// ─── All admin routes are protected ────────
router.use(protect);
router.use(requireRole(ROLES.ADMIN));

// ─── Stats ─────────────────────────────────
router.get('/stats',                   getPlatformStats);

// ─── User Management ───────────────────────
router.get  ('/users',                 getAllUsers);
router.get  ('/users/:userId',         getUserById);
router.patch('/users/:userId/toggle',  toggleUserStatus);

// ─── Cafe Management ───────────────────────
router.get  ('/cafes',                       adminGetCafes);
router.patch('/cafes/:cafeId/status',        adminUpdateCafeStatus);

// ─── Order Management ──────────────────────
router.get('/orders',                  adminGetOrders);

export default router;
