import express from 'express';
import passport from 'passport';
import {
    register,
    login,
    logout,
    refreshAccessToken,
    getMe
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { setTokenCookies } from '../utils/generateToken.js';
import User from '../models/User.model.js';

const router = express.Router();

// ─── Email/Password Auth ────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshAccessToken);
router.get('/me', protect, getMe);

// ─── Google OAuth ───────────────────────────
router.get('/google', (req, res, next) => {
    const role = req.query.role || 'customer';
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        state: role
    })(req, res, next);
});

router.get('/google/callback',
    (req, res, next) => {
        passport.authenticate('google', {
            session: false,
            failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
            passReqToCallback: true
        })(req, res, next);
    },
    async (req, res) => {
        try {
            const user = req.user;

            // ─── Generate tokens + set cookies ─────
            const { accessToken, refreshToken } = setTokenCookies(res, user);

            // ─── Save refresh token in DB ───────────
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });

            // ─── Redirect based on role ─────────────
            const redirectMap = {
                admin: `${process.env.CLIENT_URL}/dashboard/admin`,
                owner: `${process.env.CLIENT_URL}/dashboard/owner`,
                customer: `${process.env.CLIENT_URL}/cafes`
            };

            const redirectUrl = redirectMap[user.role] || `${process.env.CLIENT_URL}/cafes`;
            res.redirect(`${redirectUrl}?token=${accessToken}`);

        } catch (err) {
            console.error('Google callback error:', err);
            res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
        }
    }
);

export default router;