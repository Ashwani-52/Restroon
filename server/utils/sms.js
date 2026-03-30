// server/utils/sms.js
// ── SMS helper — provider-agnostic wrapper ─────────────────────────────────
// Currently uses Twilio. To swap to MSG91/Fast2SMS, only change this file.
// If no SMS credentials are set, messages are just logged (dev-safe).

let twilioClient = null;

function getTwilioClient() {
    if (twilioClient) return twilioClient;
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token || sid === 'YOUR_TWILIO_SID') return null;
    const Twilio = require('twilio'); // dynamic require so server doesn't crash without package
    twilioClient = Twilio(sid, token);
    return twilioClient;
}

/**
 * Send an SMS to a single phone number.
 * @param {string} to   E.164 format, e.g. '+919876543210'
 * @param {string} body The message text (keep < 160 chars for 1 segment)
 */
export async function sendSMS(to, body) {
    try {
        if (!to || to.length < 8) return; // skip empty numbers silently

        const from = process.env.TWILIO_PHONE;
        const client = getTwilioClient();

        if (!client || !from) {
            // Dev mode — just log
            console.log(`[SMS-DEV] TO: ${to}\nMSG: ${body}\n`);
            return;
        }

        await client.messages.create({ from, to, body });
        console.log(`[SMS] Sent to ${to}`);
    } catch (err) {
        // Never throw — SMS failure must not break the order flow
        console.error('[SMS] Failed:', err.message);
    }
}

/**
 * Format a phone number to E.164 (+91XXXXXXXXXX for India).
 * Handles: '9876543210', '09876543210', '+919876543210'
 */
export function toE164(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
}

/**
 * Send the dual SMS pair after a confirmed order.
 * @param {Object} order  Mongoose Order document (populated: cafe)
 * @param {Object} cafe   Mongoose Cafe document
 */
export async function sendOrderSMSPair(order, cafe) {
    const orderId = order._id.toString().slice(-6).toUpperCase();
    const total = order.totalAmount;
    const customerName = order.customerName || 'Customer';
    const customerPhone = toE164(order.customerPhone || '');
    const itemList = order.items
        .map(i => `${i.name} x${i.quantity}`)
        .join(', ');
    const address = order.orderType === 'dine_in'
        ? 'Dine-in'
        : `${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''}`.trim();

    // ── SMS 1: Customer confirmation ─────────────────
    if (customerPhone) {
        const customerMsg =
            `Hi ${customerName}! Your order #${orderId} at ${cafe.name} is confirmed. ` +
            `Total: Rs.${total}. ${order.orderType === 'dine_in' ? 'Dine-in order.' : `Delivery to: ${address}.`} ` +
            `Track your order in the Restroon app. ~Restroon`;

        await sendSMS(customerPhone, customerMsg);
    }

    // ── SMS 2: Cafe notification ──────────────────────
    const cafePhone = toE164(cafe.phone || '');
    if (cafePhone) {
        const cafeMsg =
            `New Order #${orderId}! Items: ${itemList}. Total: Rs.${total}. ` +
            `Customer: ${customerName} (${order.customerPhone || 'N/A'}). ` +
            `${order.orderType === 'dine_in' ? 'Dine-in.' : `Deliver to: ${address}.`} ~Restroon`;

        await sendSMS(cafePhone, cafeMsg);
    }
}
