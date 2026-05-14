import Category from '../models/Category.model.js';
import MenuItem from '../models/MenuItem.model.js';
import Cafe from '../models/Cafe.model.js';

// ──────────────────────────────────────────
// GET ALL CATEGORIES FOR A CAFE
// ──────────────────────────────────────────
export const getCategories = async (req, res) => {
    try {
        const { cafeId } = req.params;
        const categories = await Category.find({ cafeId }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            categories
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// CREATE A NEW CATEGORY (Owner only)
// ──────────────────────────────────────────
export const createCategory = async (req, res) => {
    try {
        const { cafeId, name } = req.body;

        if (!cafeId || !name) {
            return res.status(400).json({
                success: false,
                message: 'cafeId and name are required'
            });
        }

        // Verify the cafe belongs to this owner
        const cafe = await Cafe.findOne({ _id: cafeId, owner: req.user._id });
        if (!cafe) {
            return res.status(403).json({
                success: false,
                message: 'You can only add categories to your own cafe'
            });
        }

        const category = await Category.create({ cafeId, name: name.trim() });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// RENAME A CATEGORY (Owner only)
// ──────────────────────────────────────────
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        // Find category and verify ownership
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const cafe = await Cafe.findOne({ _id: category.cafeId, owner: req.user._id });
        if (!cafe) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit categories of your own cafe'
            });
        }

        category.name = name.trim();
        await category.save();

        res.status(200).json({
            success: true,
            message: 'Category renamed successfully',
            category
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// DELETE A CATEGORY (Owner only)
// ──────────────────────────────────────────
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Find category and verify ownership
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const cafe = await Cafe.findOne({ _id: category.cafeId, owner: req.user._id });
        if (!cafe) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete categories of your own cafe'
            });
        }

        // Check if any menu items use this category
        const itemCount = await MenuItem.countDocuments({ category: id });
        if (itemCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete: ${itemCount} menu item(s) still use this category. Reassign them first.`
            });
        }

        await Category.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: err.message
        });
    }
};
