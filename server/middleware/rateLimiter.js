import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MS } from '../utils/constants.js';

// Skip rate limiting for OAuth callback routes
const skipOAuth = (req) => req.path.includes('/google') || req.path.includes('/callback');

export const authLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: 500,
    skip: skipOAuth,
    message: {
        success: false,
        message: 'Too many attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const generalLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: 1000,
    skip: skipOAuth,
    message: {
        success: false,
        message: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
});