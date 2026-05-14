import express     from 'express';
import {
  addMenuItem,
  getMenuByCafe,
  getMyMenuItems,
  updateMenuItem,
  toggleItemAvailability,
  deleteMenuItem,
  migrateCategories
} from '../controllers/menu.controller.js';
import { protect }     from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES }       from '../utils/constants.js';

const router = express.Router();

// ─── Public Routes ─────────────────────────
router.get('/cafe/:cafeId', getMenuByCafe);
router.post('/migrate-categories', migrateCategories);

// ─── Owner Routes ──────────────────────────
router.get   ('/my-items',              protect, requireRole(ROLES.OWNER), getMyMenuItems);
router.post  ('/',                      protect, requireRole(ROLES.OWNER), addMenuItem);
router.put   ('/:itemId',               protect, requireRole(ROLES.OWNER), updateMenuItem);
router.patch ('/:itemId/toggle',        protect, requireRole(ROLES.OWNER), toggleItemAvailability);
router.delete('/:itemId',               protect, requireRole(ROLES.OWNER), deleteMenuItem);

export default router;
