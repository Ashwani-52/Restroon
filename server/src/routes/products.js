const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { authenticate, authorize } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'products');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `product-${Date.now()}${ext}`);
    },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// GET /api/products
router.get('/', authenticate, async (req, res) => {
    const { cafeId, category, search, isAvailable } = req.query;
    const query = {};
    if (cafeId) query.cafe = cafeId;
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

    const products = await Product.find(query).populate('category', 'name');
    res.json({ success: true, data: products });
});

// GET /api/products/:id
router.get('/:id', authenticate, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
});

// POST /api/products
router.post('/', authenticate, authorize('cafe_owner', 'super_admin'), upload.single('image'), async (req, res) => {
    const productData = {
        ...req.body,
        price: Number(req.body.price),
    };
    if (req.file) {
        productData.image = `/uploads/products/${req.file.filename}`;
    }
    // Parse JSON fields if sent as strings
    if (typeof productData.variants === 'string') productData.variants = JSON.parse(productData.variants || '[]');
    if (typeof productData.addons === 'string') productData.addons = JSON.parse(productData.addons || '[]');
    if (typeof productData.tags === 'string') productData.tags = JSON.parse(productData.tags || '[]');

    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });
});

// PUT /api/products/:id
router.put('/:id', authenticate, authorize('cafe_owner', 'super_admin'), upload.single('image'), async (req, res) => {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/products/${req.file.filename}`;
    if (updateData.price) updateData.price = Number(updateData.price);
    if (typeof updateData.variants === 'string') updateData.variants = JSON.parse(updateData.variants || '[]');
    if (typeof updateData.addons === 'string') updateData.addons = JSON.parse(updateData.addons || '[]');

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
});

// PATCH /api/products/:id/toggle-availability
router.patch('/:id/toggle-availability', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.isAvailable = !product.isAvailable;
    await product.save();
    res.json({ success: true, data: product });
});

// PATCH /api/products/:id/stock
router.patch('/:id/stock', authenticate, authorize('cafe_owner', 'super_admin'), async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id, { $inc: { stock: req.body.quantity } }, { new: true }
    );
    res.json({ success: true, data: product });
});

module.exports = router;
