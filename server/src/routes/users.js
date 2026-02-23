const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cafe = require('../models/Cafe');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/users - All users (super admin only)
router.get('/', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const { page = 1, limit = 50, search, role } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role && role !== 'all') {
            query.role = role;
        }

        const [users, total] = await Promise.all([
            User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
            User.countDocuments(query),
        ]);

        // For cafe owners, augment with their cafe count
        const augmentedUsers = await Promise.all(users.map(async (u) => {
            const userObj = u.toJSON();
            if (userObj.role === 'cafe_owner') {
                const cafeCount = await Cafe.countDocuments({ owner: userObj._id });
                userObj.cafeCount = cafeCount;
            }
            return userObj;
        }));

        res.json({
            success: true,
            data: {
                data: augmentedUsers,
                total,
                page: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/users/:id/toggle-ban - Super admin ban/unban user
router.patch('/:id/toggle-ban', authenticate, authorize('super_admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.role === 'super_admin') {
            return res.status(403).json({ success: false, message: 'Cannot ban another super admin' });
        }

        user.isActive = !user.isActive;
        await user.save();

        // If banned, and user is cafe owner, optionally deactivate their cafes?
        // Let's just ban the user account for now.

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
