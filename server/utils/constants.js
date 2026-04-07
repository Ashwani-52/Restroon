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
// server/utils/constants.js — add this
export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT) || 4;
// server/utils/constants.js — add these
export const SUBSCRIPTION_PLANS = {
    trial: {
        label: '1-Day Free Trial',
        amount: 0,        // ₹0 — free
        days: 1
    },
    monthly: {
        label: '1 Month',
        amount: 1500,     // ₹1,500
        days: 30
    },
    quarterly: {
        label: '3 Months',
        amount: 3999,     // ₹3,999
        days: 90
    },
    biannual: {
        label: '6 Months',
        amount: 6999,     // ₹6,999
        days: 180
    },
    annual: {
        label: '12 Months',
        amount: 11999,    // ₹11,999
        days: 365
    }
};