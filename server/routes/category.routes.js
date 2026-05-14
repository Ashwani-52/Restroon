import express from 'express';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/category.controller.js';
import { protect }     from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES }       from '../utils/constants.js';

const router = express.Router();

// ─── Public Routes ─────────────────────────
router.get('/:cafeId', getCategories);

// ─── Owner Routes ──────────────────────────
router.post  ('/',    protect, requireRole(ROLES.OWNER), createCategory);
router.put   ('/:id', protect, requireRole(ROLES.OWNER), updateCategory);
router.delete('/:id', protect, requireRole(ROLES.OWNER), deleteCategory);

export default router;
