import MenuItem from '../models/MenuItem.model.js';
import Cafe from '../models/Cafe.model.js';
import Category from '../models/Category.model.js';
import mongoose from 'mongoose';
import {
    CAFE_STATUS,
    MENU_ITEM_NAME_MAX,
    MENU_ITEM_DESC_MAX
} from '../utils/constants.js';

// ── Helper: normalize category field in response ──
// Handles both legacy string values and new ObjectId refs
const normalizeCategory = (item) => {
    const obj = item.toObject ? item.toObject() : { ...item };
    if (obj.category && typeof obj.category === 'object' && obj.category.name) {
        // Already populated ObjectId ref — keep as-is
        return obj;
    }
    if (typeof obj.category === 'string') {
        // Legacy string value — wrap in consistent shape
        obj.category = { _id: null, name: obj.category };
    }
    // Fallback if category is null (populate failed on old string)
    if (!obj.category) {
        obj.category = { _id: null, name: 'General' };
    }
    return obj;
};

// ──────────────────────────────────────────
// ADD MENU ITEM (Owner only)
// ──────────────────────────────────────────
export const addMenuItem = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            isVeg,
            isAvailable,
            isBestSeller,
            image
        } = req.body;

        // ─── Validate required fields ──────────
        if (!name || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Item name and price are required'
            });
        }

        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price cannot be negative'
            });
        }

        // ─── Get owner's cafe ──────────────────
        const cafe = await Cafe.findOne({ owner: req.user._id });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found. Please register your cafe first.'
            });
        }

        // ─── Only active cafes can add items ───
        if (cafe.status !== CAFE_STATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: 'Your cafe must be approved before adding menu items'
            });
        }

        // ─── Create menu item ──────────────────
        const menuItem = await MenuItem.create({
            cafe: cafe._id,
            name,
            description: description || '',
            price,
            image: image || '',
            category: category || 'General',
            isVeg: isVeg !== undefined ? isVeg : true,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            isBestSeller: isBestSeller !== undefined ? isBestSeller : false
        });

        // Populate category if it's an ObjectId
        if (mongoose.Types.ObjectId.isValid(menuItem.category)) {
            await menuItem.populate({ path: 'category', select: 'name', model: 'Category', strictPopulate: false });
        }

        res.status(201).json({
            success: true,
            message: 'Menu item added successfully',
            menuItem: normalizeCategory(menuItem)
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to add menu item',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET ALL MENU ITEMS OF A CAFE (Public)
// ──────────────────────────────────────────
export const getMenuByCafe = async (req, res) => {
    try {
        const { cafeId } = req.params;
        const { category, isVeg } = req.query;

        // ─── Base query ────────────────────────
        const query = { cafe: cafeId };

        // ─── Filter by category ────────────────
        if (category) {
            // Support filtering by category name — check if it's an ObjectId
            if (mongoose.Types.ObjectId.isValid(category)) {
                query.category = category;
            } else {
                query.category = { $regex: category, $options: 'i' };
            }
        }

        // ─── Filter by veg/non-veg ─────────────
        if (isVeg !== undefined) {
            query.isVeg = isVeg === 'true';
        }

        let menuItems = await MenuItem.find(query)
            .sort({ isBestSeller: -1, category: 1 });
        // best sellers first, then grouped by category

        // Populate category for items that have ObjectId refs
        await MenuItem.populate(menuItems, { path: 'category', select: 'name', model: 'Category', strictPopulate: false });

        // Normalize all categories to consistent { _id, name } shape
        const normalized = menuItems.map(normalizeCategory);

        res.status(200).json({
            success: true,
            count: normalized.length,
            menuItems: normalized
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET MY CAFE MENU ITEMS (Owner only)
// ──────────────────────────────────────────
export const getMyMenuItems = async (req, res) => {
    try {
        // ─── Get owner's cafe ──────────────────
        const cafe = await Cafe.findOne({ owner: req.user._id });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found'
            });
        }

        let menuItems = await MenuItem.find({ cafe: cafe._id })
            .sort({ category: 1, createdAt: -1 });

        // Populate category for items that have ObjectId refs
        await MenuItem.populate(menuItems, { path: 'category', select: 'name', model: 'Category', strictPopulate: false });

        // Normalize all categories
        const normalized = menuItems.map(normalizeCategory);

        res.status(200).json({
            success: true,
            count: normalized.length,
            menuItems: normalized
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu items',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// UPDATE MENU ITEM (Owner only)
// ──────────────────────────────────────────
export const updateMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const {
            name,
            description,
            price,
            category,
            isVeg,
            isAvailable,
            isBestSeller,
            image
        } = req.body;

        // ─── Get owner's cafe ──────────────────
        const cafe = await Cafe.findOne({ owner: req.user._id });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found'
            });
        }

        // ─── Find menu item ────────────────────
        const menuItem = await MenuItem.findOne({
            _id: itemId,
            cafe: cafe._id      // ensures owner can only edit their own items
        });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        // ─── Validate price if provided ────────
        if (price !== undefined && price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price cannot be negative'
            });
        }

        // ─── Update only provided fields ───────
        if (name) menuItem.name = name;
        if (description !== undefined) menuItem.description = description;
        if (price !== undefined) menuItem.price = price;
        if (category) menuItem.category = category;
        if (isVeg !== undefined) menuItem.isVeg = isVeg;
        if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
        if (isBestSeller !== undefined) menuItem.isBestSeller = isBestSeller;
        if (image !== undefined) menuItem.image = image;

        await menuItem.save();

        // Populate category if it's an ObjectId
        if (mongoose.Types.ObjectId.isValid(menuItem.category)) {
            await menuItem.populate({ path: 'category', select: 'name', model: 'Category', strictPopulate: false });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            menuItem: normalizeCategory(menuItem)
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update menu item',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// TOGGLE ITEM AVAILABILITY (Owner only)
// ──────────────────────────────────────────
export const toggleItemAvailability = async (req, res) => {
    try {
        const { itemId } = req.params;

        // ─── Get owner's cafe ──────────────────
        const cafe = await Cafe.findOne({ owner: req.user._id });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found'
            });
        }

        // ─── Find item ─────────────────────────
        const menuItem = await MenuItem.findOne({
            _id: itemId,
            cafe: cafe._id
        });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        // ─── Toggle availability ───────────────
        menuItem.isAvailable = !menuItem.isAvailable;
        await menuItem.save();

        res.status(200).json({
            success: true,
            message: `Item is now ${menuItem.isAvailable ? 'Available' : 'Unavailable'}`,
            isAvailable: menuItem.isAvailable
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to toggle item availability',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// DELETE MENU ITEM (Owner only)
// ──────────────────────────────────────────
export const deleteMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        // ─── Get owner's cafe ──────────────────
        const cafe = await Cafe.findOne({ owner: req.user._id });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found'
            });
        }

        // ─── Find and delete item ──────────────
        const menuItem = await MenuItem.findOneAndDelete({
            _id: itemId,
            cafe: cafe._id    // ensures owner can only delete their own items
        });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete menu item',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// MIGRATE CATEGORIES (One-time utility)
// ──────────────────────────────────────────
export const migrateCategories = async (req, res) => {
    try {
        const { cafeId } = req.body;

        if (!cafeId) {
            return res.status(400).json({ success: false, message: 'cafeId is required' });
        }

        // Find or create a "General" category for this cafe
        let generalCategory = await Category.findOne({ cafeId, name: 'General' });
        if (!generalCategory) {
            generalCategory = await Category.create({ cafeId, name: 'General' });
        }

        // Find all menu items where category is a string (not a valid ObjectId)
        const items = await MenuItem.find({ cafe: cafeId });
        let fixed = 0;

        for (const item of items) {
            const isObjectId = mongoose.Types.ObjectId.isValid(item.category) &&
                typeof item.category !== 'string';

            if (!isObjectId || typeof item.category === 'string') {
                // category is a plain string like "General" or null — fix it
                await MenuItem.findByIdAndUpdate(item._id, {
                    category: generalCategory._id
                });
                fixed++;
            }
        }

        res.json({ success: true, message: `Fixed ${fixed} items`, generalCategoryId: generalCategory._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};