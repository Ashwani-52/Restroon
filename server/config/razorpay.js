// server/config/razorpay.js
// Dual Razorpay architecture:
//   adminRazorpay  → subscription fees from cafes to platform (admin account)
//   cafeRazorpay   → food order payments from customers to cafe (cafe account)

import Razorpay from 'razorpay';

// ── Admin account — receives subscription fees from cafes ──────────────
export const adminRazorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Cafe account — receives food order payments from customers ─────────
export const cafeRazorpay = new Razorpay({
    key_id:     process.env.CAFE_RAZORPAY_KEY_ID,
    key_secret: process.env.CAFE_RAZORPAY_KEY_SECRET,
});
