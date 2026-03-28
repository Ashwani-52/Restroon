// server/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── Storage for cafe images ────────────────
const cafeStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'restroon/cafes',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 600, crop: 'fill', quality: 'auto' }]
    }
});

// ─── Storage for menu item images ───────────
const menuStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'restroon/menu',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 600, height: 600, crop: 'fill', quality: 'auto' }]
    }
});

// ─── Storage for logos ──────────────────────
const logoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'restroon/logos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 300, height: 300, crop: 'fill', quality: 'auto' }]
    }
});

export const uploadCafeCover = multer({ storage: cafeStorage });
export const uploadMenuImage = multer({ storage: menuStorage });
export const uploadLogo = multer({ storage: logoStorage });
export { cloudinary };