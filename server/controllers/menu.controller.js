import MenuItem from '../models/MenuItem.model.js';
import Cafe from '../models/Cafe.model.js';
import {
    CAFE_STATUS,
    MENU_ITEM_NAME_MAX,
    MENU_ITEM_DESC_MAX
} from '../utils/constants.js';

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

        res.status(201).json({
            success: true,
            message: 'Menu item added successfully',
            menuItem
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
            query.category = { $regex: category, $options: 'i' };
        }

        // ─── Filter by veg/non-veg ─────────────
        if (isVeg !== undefined) {
            query.isVeg = isVeg === 'true';
        }

        const menuItems = await MenuItem.find(query)
            .sort({ isBestSeller: -1, category: 1 });
        // best sellers first, then grouped by category

        res.status(200).json({
            success: true,
            count: menuItems.length,
            menuItems
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

        const menuItems = await MenuItem.find({ cafe: cafe._id })
            .sort({ category: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: menuItems.length,
            menuItems
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
            isBestSeller
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

        await menuItem.save();

        res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            menuItem
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