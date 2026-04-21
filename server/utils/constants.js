// ─── TOKEN EXPIRY ─────────────────────────
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';

// ─── COOKIE OPTIONS ───────────────────────
export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 15 * 60 * 1000
};

export const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

// ─── SECURITY ─────────────────────────────
export const BCRYPT_SALT_ROUNDS = 12;
export const MAX_LOGIN_ATTEMPTS = 20;
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

// ─── ROLES ────────────────────────────────
export const ROLES = {
    ADMIN: 'admin',
    OWNER: 'owner',
    CUSTOMER: 'customer'
};

// ─── ORDER STATUS ─────────────────────────
export const ORDER_STATUS = {
    PLACED: 'placed',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    PREPARING: 'preparing',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

// ─── CAFE STATUS ──────────────────────────
export const CAFE_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    SUSPENDED: 'suspended'
};
// ─── CAFE DEFAULTS ────────────────────────
export const DEFAULT_DELIVERY_RADIUS = 5;      // km
export const DEFAULT_OPENING_TIME = '09:00';
export const DEFAULT_CLOSING_TIME = '22:00';

// ─── ORDER DEFAULTS ───────────────────────
export const DEFAULT_ESTIMATED_TIME = 30;     // minutes

// ─── VALIDATION LIMITS ────────────────────
export const USER_NAME_MIN = 2;
export const USER_NAME_MAX = 50;
export const CAFE_NAME_MAX = 100;
export const CAFE_DESC_MAX = 500;
export const MENU_ITEM_NAME_MAX = 100;
export const MENU_ITEM_DESC_MAX = 300;
export const ORDER_NOTE_MAX = 200;
export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT) || 5;
export const PLATFORM_FEE_FLAT = 15;
export const DELIVERY_CHARGE_FALLBACK = 35;
export const DELIVERY_TIERS = [
    { maxKm: 2, charge: 10 },
    { maxKm: 5, charge: 20 },
    { maxKm: 8, charge: 35 },
    { maxKm: Infinity, charge: 50 }
];

// server/utils/constants.js — subscription plans
// amounts are in RUPEES — the controller converts to paise (* 100)
export const SUBSCRIPTION_PLANS = {
    trial: {
        label: '1 Day Trial',
        amount: 1,        // ₹1 — card auth, refunded immediately
        days: 1
    },
    monthly: {
        label: 'Monthly',
        amount: 999,      // ₹999
        days: 30
    },
    quarterly: {
        label: 'Quarterly',
        amount: 2499,     // ₹2,499
        days: 90
    },
    biannual: {
        label: '6 Months',
        amount: 4999,     // ₹4,999
        days: 180
    },
    annual: {
        label: 'Annual',
        amount: 7999,     // ₹7,999
        days: 365
    }
};