const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { authenticate } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/upload/image
router.post('/image', authenticate, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const folder = req.body.folder || 'misc';
        const uploadDir = path.join(process.cwd(), 'uploads', folder);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const filename = `img-${Date.now()}.webp`;
        const outputPath = path.join(uploadDir, filename);

        // Process image: resize to 4:3 ratio, compress to webp
        await sharp(req.file.buffer)
            .resize(800, 600, {
                fit: sharp.fit.cover,
                position: sharp.strategy.entropy
            })
            .webp({ quality: 80 })
            .toFile(outputPath);

        const url = `/uploads/${folder}/${filename}`;
        res.json({ success: true, data: { url } });
    } catch (error) {
        console.error('Image processing error:', error);
        res.status(500).json({ success: false, message: 'Error processing image' });
    }
});

// POST /api/upload/delete
router.post('/delete', authenticate, (req, res) => {
    const { url } = req.body;
    if (url) {
        const filePath = path.join(process.cwd(), url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: 'File deleted' });
});

module.exports = router;
