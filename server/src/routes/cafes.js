const express = require('express');
const router = express.Router();
const Cafe = require('../models/Cafe');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/cafes - All cafes (admin) or public listing
router.get('/', authenticate, async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (req.user.role !== 'super_admin') query.isActive = true;

    const [cafes, total] = await Promise.all([
        Cafe.find(query).populate('owner', 'name email').skip((page - 1) * limit).limit(Number(limit)),
        Cafe.countDocuments(query),
    ]);
    res.json({ success: true, data: { data: cafes, total, page: Number(page), limit: Number(limit) } });
});

// GET /api/cafes/my-cafe - Get current owner's cafe
router.get('/my-cafe', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const cafe = await Cafe.findOne({ owner: req.user._id });
    if (!cafe) return res.status(404).json({ success: false, message: 'No cafe found' });
    res.json({ success: true, data: cafe });
});

// GET /api/cafes/:id
router.get('/:id', authenticate, async (req, res) => {
    const cafe = await Cafe.findById(req.params.id).populate('owner', 'name email');
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });
    res.json({ success: true, data: cafe });
});

// POST /api/cafes - Create cafe
router.post('/', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const existing = await Cafe.findOne({ owner: req.user._id });
    if (existing) return res.status(409).json({ success: false, message: 'You already have a cafe' });

    const cafe = await Cafe.create({ ...req.body, owner: req.user._id });
    // Link cafe to user
    await User.findByIdAndUpdate(req.user._id, { cafeId: cafe._id });
    res.status(201).json({ success: true, data: cafe });
});

// PUT /api/cafes/:id - Update cafe
router.put('/:id', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });
    if (req.user.role !== 'super_admin' && String(cafe.owner) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Cafe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
});

// DELETE /api/cafes/:id
router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
    await Cafe.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Cafe deleted' });
});

// PATCH /api/cafes/:id/toggle-status
router.patch('/:id/toggle-status', authenticate, authorize('super_admin'), async (req, res) => {
    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });
    cafe.isActive = !cafe.isActive;
    await cafe.save();
    res.json({ success: true, data: cafe });
});

// PUT /api/cafes/:id/settings
router.put('/:id/settings', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const cafe = await Cafe.findByIdAndUpdate(
        req.params.id, { settings: req.body }, { new: true }
    );
    res.json({ success: true, data: cafe });
});

// PUT /api/cafes/:id/payment-details
router.put('/:id/payment-details', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const cafe = await Cafe.findByIdAndUpdate(
        req.params.id, { paymentDetails: req.body }, { new: true }
    );
    res.json({ success: true, data: cafe });
});

// PATCH /api/cafes/:id/approve - Super admin approve cafe
router.patch('/:id/approve', authenticate, authorize('super_admin'), async (req, res) => {
    const cafe = await Cafe.findByIdAndUpdate(
        req.params.id, { status: 'approved', isActive: true }, { new: true }
    );
    res.json({ success: true, data: cafe });
});

// PATCH /api/cafes/:id/reject - Super admin reject cafe  
router.patch('/:id/reject', authenticate, authorize('super_admin'), async (req, res) => {
    const cafe = await Cafe.findByIdAndUpdate(
        req.params.id, { status: 'rejected', isActive: false }, { new: true }
    );
    res.json({ success: true, data: cafe });
});

module.exports = router;
