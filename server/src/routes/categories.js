const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/categories?cafeId=xxx
router.get('/', authenticate, async (req, res) => {
    const { cafeId } = req.query;
    const query = cafeId ? { cafe: cafeId } : {};
    const categories = await Category.find(query).sort('sortOrder name');
    res.json({ success: true, data: categories });
});

// GET /api/categories/:id
router.get('/:id', authenticate, async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
});

// POST /api/categories
router.post('/', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
});

// PUT /api/categories/:id
router.put('/:id', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
});

// DELETE /api/categories/:id
router.delete('/:id', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
});

// PUT /api/categories/reorder
router.put('/reorder', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const { categoryIds } = req.body;
    await Promise.all(categoryIds.map((id, index) =>
        Category.findByIdAndUpdate(id, { sortOrder: index })
    ));
    res.json({ success: true, message: 'Categories reordered' });
});

module.exports = router;
