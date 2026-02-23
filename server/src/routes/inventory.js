const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/inventory?cafeId=xxx
router.get('/', authenticate, async (req, res) => {
    const { cafeId } = req.query;
    const query = cafeId ? { cafe: cafeId } : {};
    const items = await Inventory.find(query).sort('name');
    res.json({ success: true, data: items });
});

// GET /api/inventory/low-stock?cafeId=xxx
router.get('/low-stock', authenticate, async (req, res) => {
    const { cafeId } = req.query;
    const query = cafeId ? { cafe: cafeId } : {};
    const items = await Inventory.find({ ...query, $expr: { $lte: ['$currentStock', '$minStock'] } });
    res.json({ success: true, data: items });
});

// GET /api/inventory/:id
router.get('/:id', authenticate, async (req, res) => {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
});

// POST /api/inventory
router.post('/', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
});

// PUT /api/inventory/:id
router.put('/:id', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
});

// DELETE /api/inventory/:id
router.delete('/:id', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
});

// POST /api/inventory/add-stock
router.post('/add-stock', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const { itemId, quantity } = req.body;
    const item = await Inventory.findByIdAndUpdate(
        itemId, { $inc: { currentStock: quantity }, lastRestockedAt: new Date() }, { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const io = req.app.get('io');
    if (io && item.cafe) io.to(String(item.cafe)).emit('inventory-update', item);

    res.json({ success: true, data: item });
});

// POST /api/inventory/remove-stock
router.post('/remove-stock', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const { itemId, quantity } = req.body;
    const item = await Inventory.findByIdAndUpdate(
        itemId, { $inc: { currentStock: -quantity } }, { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const io = req.app.get('io');
    if (io && item.cafe) io.to(String(item.cafe)).emit('inventory-update', item);

    res.json({ success: true, data: item });
});

// GET /api/inventory/:id/logs (stub)
router.get('/:id/logs', authenticate, async (req, res) => {
    res.json({ success: true, data: [] });
});

module.exports = router;
