// server/routes/upload.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';
import { uploadCafeCover, uploadMenuImage, uploadLogo } from '../config/cloudinary.js';
import Cafe from '../models/Cafe.model.js';
import MenuItem from '../models/MenuItem.model.js';
import { cloudinary } from '../config/cloudinary.js';

const router = express.Router();

// ─── Upload cafe cover image ─────────────────
router.post(
    '/cafe/cover',
    protect,
    requireRole(ROLES.OWNER),
    uploadCafeCover.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No image uploaded' });
            }

            const cafe = await Cafe.findOneAndUpdate(
                { owner: req.user._id },
                { coverImage: req.file.path },
                { new: true }
            );

            if (!cafe) {
                return res.status(404).json({ success: false, message: 'Cafe not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Cover image updated',
                coverImage: req.file.path
            });

        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

// ─── Upload cafe logo ────────────────────────
router.post(
    '/cafe/logo',
    protect,
    requireRole(ROLES.OWNER),
    uploadLogo.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No image uploaded' });
            }

            const cafe = await Cafe.findOneAndUpdate(
                { owner: req.user._id },
                { logo: req.file.path },
                { new: true }
            );

            if (!cafe) {
                return res.status(404).json({ success: false, message: 'Cafe not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Logo updated',
                logo: req.file.path
            });

        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

// ─── Upload menu item image ──────────────────
router.post(
    '/menu/:itemId',
    protect,
    requireRole(ROLES.OWNER),
    uploadMenuImage.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No image uploaded' });
            }

            const cafe = await Cafe.findOne({ owner: req.user._id });
            if (!cafe) {
                return res.status(404).json({ success: false, message: 'Cafe not found' });
            }

            const item = await MenuItem.findOneAndUpdate(
                { _id: req.params.itemId, cafe: cafe._id },
                { image: req.file.path },
                { new: true }
            );

            if (!item) {
                return res.status(404).json({ success: false, message: 'Menu item not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Image updated',
                image: req.file.path
            });

        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

export default router;