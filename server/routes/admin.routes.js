import express from 'express';
import {
  getPlatformStats,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  adminGetCafes,
  adminUpdateCafeStatus,
  adminGetOrders,
  getCafeWiseRevenue
} from '../controllers/admin.controller.js';
import { protect }     from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES }       from '../utils/constants.js';
import Setting         from '../models/Setting.model.js';

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
router.get('/revenue/cafes',           getCafeWiseRevenue);

// ─── Maintenance Mode ──────────────────────
router.post('/maintenance/on', async (req, res) => {
  await Setting.findOneAndUpdate(
    { key: 'maintenance_mode' },
    { value: true },
    { upsert: true, new: true }
  );
  res.json({ success: true, message: 'Maintenance mode ON 🛠️' });
});

router.post('/maintenance/off', async (req, res) => {
  await Setting.findOneAndUpdate(
    { key: 'maintenance_mode' },
    { value: false },
    { upsert: true, new: true }
  );
  res.json({ success: true, message: 'Maintenance mode OFF ✅' });
});

router.get('/maintenance/status', async (req, res) => {
  const setting = await Setting.findOne({ key: 'maintenance_mode' });
  res.json({ maintenance: setting?.value || false });
});

export default router;
