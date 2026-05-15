import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import DeliveryInvite from '../models/DeliveryInvite.model.js';
import {
    generateAccessToken,
    generateRefreshToken
} from '../utils/generateToken.js';
import {
    COOKIE_OPTIONS,
    REFRESH_COOKIE_OPTIONS,
    ROLES
} from '../utils/constants.js';

// ──────────────────────────────────────────
// REGISTER
// ──────────────────────────────────────────
export const register = async (req, res) => {
    try {
        const { name, email, password, role, phone, inviteCode } = req.body;

        // ─── Validate fields ───────────────────
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required'
            });
        }

        // ─── Prevent self-registering as admin ─
        let safeRole = role === ROLES.OWNER
            ? ROLES.OWNER
            : ROLES.CUSTOMER;

        // ─── Handle delivery_partner registration via invite code ─
        let assignedCafe = null;
        if (role === 'delivery_partner') {
            if (!inviteCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Invite code is required for delivery partner registration'
                });
            }

            // Verify invite code
            const invite = await DeliveryInvite.findOne({
                inviteCode: inviteCode.toUpperCase().trim(),
                status: 'pending',
                expiresAt: { $gt: new Date() }
            });

            if (!invite) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired invite code. Please ask your cafe owner for a valid code.'
                });
            }

            safeRole = 'delivery_partner';
            assignedCafe = invite.cafeId;

            // Mark invite as accepted
            invite.status = 'accepted';
            await invite.save();
        }

        // ─── Check existing user ───────────────
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // ─── Create user ───────────────────────
        const user = await User.create({
            name,
            email,
            password,
            role: safeRole,
            phone: phone || '',
            ...(assignedCafe ? { assignedCafe } : {})
        });

        // ─── Generate tokens ───────────────────
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // ─── Save refresh token in DB ──────────
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // ─── Set cookies ───────────────────────
        res.cookie('accessToken', accessToken, COOKIE_OPTIONS);
        res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

        res.status(201).json({
            success: true,
            message: 'Registered successfully',
            accessToken,
            user
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// VERIFY INVITE CODE (Public — before registration)
// ──────────────────────────────────────────
export const verifyInvite = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: 'Invite code is required'
            });
        }

        const invite = await DeliveryInvite.findOne({
            inviteCode: code.toUpperCase().trim(),
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });

        if (!invite) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: 'Invalid or expired invite code'
            });
        }

        res.status(200).json({
            success: true,
            valid: true,
            email: invite.email,
            cafeId: invite.cafeId,
            cafeName: invite.cafeName
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            valid: false,
            message: 'Failed to verify invite code',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ─── Validate fields ───────────────────
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // ─── Find user + include password ──────
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // ─── Check account active ──────────────
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended'
            });
        }

        // ─── Verify password ───────────────────
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // ─── Generate tokens ───────────────────
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // ─── Save refresh token in DB ──────────
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // ─── Set cookies ───────────────────────
        res.cookie('accessToken', accessToken, COOKIE_OPTIONS);
        res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            accessToken,
            user
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// LOGOUT
// ──────────────────────────────────────────
export const logout = async (req, res) => {
    try {
        // ─── Clear refresh token from DB ───────
        await User.findByIdAndUpdate(
            req.user._id,
            { refreshToken: null },
            { new: true }
        );

        // ─── Clear cookies ─────────────────────
        res.clearCookie('accessToken', COOKIE_OPTIONS);
        res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// REFRESH ACCESS TOKEN
// ──────────────────────────────────────────
export const refreshAccessToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No refresh token found'
            });
        }

        // ─── Verify refresh token ──────────────
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        // ─── Find user + check token matches DB─
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== token) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token. Please login again.'
            });
        }

        // ─── Issue new access token ────────────
        const newAccessToken = generateAccessToken(user._id, user.role);
        res.cookie('accessToken', newAccessToken, COOKIE_OPTIONS);

        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            message: 'Token refreshed'
        });

    } catch (err) {
        res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.'
        });
    }
};

// ──────────────────────────────────────────
// GET CURRENT USER
// ──────────────────────────────────────────
export const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};