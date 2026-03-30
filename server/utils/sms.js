// server/utils/sms.js
// ── Twilio SMS helper (ES Module) ─────────────────────────────────────────
// Uses Twilio. If credentials missing → dev-logs only (never crashes server).

import twilio from 'twilio';

let _client = null;

function getClient() {
    if (_client) return _client;
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) return null;
    _client = twilio(sid, token);
    return _client;
}

/**
 * Convert any Indian phone to E.164 (+91XXXXXXXXXX).
 * Handles: '9876543210', '09876543210', '+919876543210'
 */
export function toE164(phone) {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length > 10) return `+${digits}`;
    return '';
}

/**
 * Send one SMS. Logs to console in dev if Twilio not configured.
 * Never throws — SMS failure must NOT break the order flow.
 */
export async function sendSMS(to, body) {
    try {
        const normalised = toE164(to);
        if (!normalised) {
            console.warn(`[SMS] Skipped — invalid number: "${to}"`);
            return;
        }

        const from   = process.env.TWILIO_PHONE;
        const client = getClient();

        if (!client || !from) {
            // Dev-safe fallback
            console.log(`\n[SMS-DEV] ── TO: ${normalised}\n[SMS-DEV] ── MSG: ${body}\n`);
            return;
        }

        const msg = await client.messages.create({ from, to: normalised, body });
        console.log(`[SMS] ✓ Sent to ${normalised} | SID: ${msg.sid}`);
    } catch (err) {
        console.error(`[SMS] ✗ Failed to ${to}: ${err.message}`);
    }
}

/**
 * Fire dual SMS after any confirmed order (COD or Online).
 *
 * @param {Object} order  Mongoose Order document (with .items, .deliveryAddress etc.)
 * @param {Object} cafe   Mongoose Cafe document  (with .name, .phone)
 */
export async function sendOrderSMSPair(order, cafe) {
    const shortId      = order._id.toString().slice(-6).toUpperCase();
    const total        = order.totalAmount;
    const customerName = order.customerName || 'Customer';
    const customerRaw  = order.customerPhone || '';
    const payMode      = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Paid)';

    // Build item list (truncate if too long so SMS stays under 160 chars)
    const items = order.items
        .map(i => `${i.name} x${i.quantity}`)
        .join(', ');

    const deliveryInfo = order.orderType === 'dine_in'
        ? 'Dine-in'
        : `Delivery to: ${[order.deliveryAddress?.street, order.deliveryAddress?.city]
              .filter(Boolean).join(', ') || 'Address on file'}`;

    // ── SMS 1: Customer ──────────────────────────────────────────────────
    const customerPhone = toE164(customerRaw);
    if (customerPhone) {
        const msg =
            `Hi ${customerName}! ✅ Order #${shortId} confirmed at ${cafe.name}.\n` +
            `Items: ${items}.\n` +
            `Total: Rs.${total} | ${payMode}.\n` +
            `${deliveryInfo}.\n` +
            `Track on Restroon app. ~Restroon`;

        await sendSMS(customerPhone, msg);
    } else {
        console.warn(`[SMS] Customer phone missing for order ${shortId}`);
    }

    // ── SMS 2: Cafe Owner ────────────────────────────────────────────────
    const cafePhone = toE164(cafe.phone || '');
    if (cafePhone) {
        const msg =
            `🔔 New Order #${shortId} on Restroon!\n` +
            `Items: ${items}.\n` +
            `Total: Rs.${total} | ${payMode}.\n` +
            `Customer: ${customerName} | Ph: ${customerRaw || 'N/A'}.\n` +
            `${deliveryInfo}.\n` +
            `Login to Restroon to accept. ~Restroon`;

        await sendSMS(cafePhone, msg);
    } else {
        console.warn(`[SMS] Cafe phone missing for cafe ${cafe.name}`);
    }
}
