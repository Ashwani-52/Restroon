import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
    try {
        // ─── Get token from cookie ──────────────
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login.'
            });
        }

        // ─── Verify token ───────────────────────
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // ─── Get user from DB ───────────────────
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended'
            });
        }

        // ─── Attach user to request ─────────────
        req.user = user;
        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.'
        });
    }
};