const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate, generateTokens } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============ POST /api/auth/google-login ============
router.post('/google-login', async (req, res) => {
    try {
        const { idToken, role } = req.body;
        if (!idToken) return res.status(400).json({ success: false, message: 'idToken is required' });

        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Security check for super_admin role
        if (role === 'super_admin') {
            if (email !== 'ashwanikumar6064@gmail.com' && googleId !== '100777321801817756379') {
                return res.status(403).json({
                    success: false,
                    message: 'you have not any access to login as admin. only i can access the admin role.'
                });
            }
        }

        // Find or create user
        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        if (!user) {
            user = await User.create({
                googleId,
                email,
                name,
                avatar: picture,
                role: role || 'customer', // Use requested role or default
            });
        } else {
            let needsSave = false;
            if (!user.googleId) {
                user.googleId = googleId;
                needsSave = true;
            }
            if (picture && user.avatar !== picture) {
                user.avatar = picture;
                needsSave = true;
            }
            if (role && user.role !== role) {
                user.role = role;
                needsSave = true;
            }

            if (needsSave) {
                await user.save();
            }
        }

        const { accessToken, refreshToken } = generateTokens(user._id);
        res.json({ success: true, data: { user, accessToken, refreshToken } });
    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Google verification failed' });
    }
});

// ============ POST /api/auth/register ============
router.post('/register', async (req, res) => {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    if (role === 'super_admin') {
        return res.status(403).json({ success: false, message: 'Cannot register directly as Super Admin.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
        name, email, password, phone,
        role: role || 'customer',
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    res.status(201).json({ success: true, data: { user, accessToken, refreshToken } });
});

// ============ POST /api/auth/login ============
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Block ANY email/password attempt to log in as Super Admin
    if (user.role === 'super_admin' || role === 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'you have not any access to login as admin. only i can access the admin role.'
        });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (role && user.role !== role && user.role !== 'super_admin') {
        return res.status(401).json({ success: false, message: `Access denied. Registered role is ${user.role}.` });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    const userObj = user.toJSON();
    res.json({ success: true, data: { user: userObj, accessToken, refreshToken } });
});

// ============ POST /api/auth/refresh-token ============
router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const tokens = generateTokens(user._id);
    res.json({ success: true, data: { ...tokens } });
});

// ============ POST /api/auth/logout ============
router.post('/logout', authenticate, (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// ============ GET /api/auth/me ============
router.get('/me', authenticate, (req, res) => {
    res.json({ success: true, data: req.user });
});

// ============ PUT /api/auth/profile ============
router.put('/profile', authenticate, async (req, res) => {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, avatar },
        { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
});

module.exports = router;
