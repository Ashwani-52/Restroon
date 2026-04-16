// server/config/razorpay.js
// Dual Razorpay architecture — lazy initialization:
//   getAdminRazorpay()  → subscription fees from cafes to platform (admin account)
//   getCafeRazorpay()   → food order payments from customers to cafe (cafe account)
//
// Instances are created only on first call so missing env vars never crash
// the server on startup — the error is thrown at the call site instead.

import Razorpay from 'razorpay';

let _adminRazorpay = null;
let _cafeRazorpay  = null;

// ── Admin account — receives subscription fees from cafes ──────────────
export const getAdminRazorpay = () => {
    if (!_adminRazorpay) {
        if (!process.env.RAZORPAY_KEY_ID) {
            throw new Error('RAZORPAY_KEY_ID is not set in environment variables');
        }
        _adminRazorpay = new Razorpay({
            key_id:     process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return _adminRazorpay;
};

// ── Cafe account — receives food order payments from customers ─────────
export const getCafeRazorpay = () => {
    if (!_cafeRazorpay) {
        if (!process.env.CAFE_RAZORPAY_KEY_ID) {
            throw new Error('CAFE_RAZORPAY_KEY_ID is not set in environment variables');
        }
        _cafeRazorpay = new Razorpay({
            key_id:     process.env.CAFE_RAZORPAY_KEY_ID,
            key_secret: process.env.CAFE_RAZORPAY_KEY_SECRET,
        });
    }
    return _cafeRazorpay;
};

