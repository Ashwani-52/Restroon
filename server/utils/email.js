// server/utils/email.js
// ── Nodemailer email helper (ES Module) ────────────────────────────────────
// Uses Gmail via Nodemailer. Up to 500 free emails/day.
// If EMAIL_USER / EMAIL_PASS not set → logs to console (dev-safe).

import nodemailer from 'nodemailer';

// ─── Always create a fresh transporter (no stale cache) ─────────────────────
function createTransporter() {
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_PASS?.trim();

    if (!user || !pass) {
        console.warn('[EMAIL] ⚠️  EMAIL_USER or EMAIL_PASS not set — emails disabled');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        pool: false   // disable connection pool so each send uses fresh credentials
    });
}

// ─── Shared colour tokens ────────────────────────────────────────────────────
const ORANGE  = '#FF6B35';
const DARK    = '#1A1A1A';
const CREAM   = '#FFFBEF';
const GREEN   = '#22C55E';
const GREY    = '#6B7280';

// ── Low-level send ───────────────────────────────────────────────────────────
async function sendMail({ to, subject, html }) {
    try {
        const from = process.env.EMAIL_USER?.trim();
        const transporter = createTransporter();

        if (!transporter || !from) {
            console.log(`\n[EMAIL-DEV] TO: ${to}\n[EMAIL-DEV] SUBJECT: ${subject}\n[EMAIL-DEV] (Set EMAIL_USER + EMAIL_PASS to send real emails)\n`);
            return;
        }

        // ── Sanity check: verify SMTP auth before sending ──────────────────
        try {
            await transporter.verify();
        } catch (verifyErr) {
            console.error(`[EMAIL] ✗ SMTP auth failed — check EMAIL_USER/EMAIL_PASS: ${verifyErr.message}`);
            return;
        }

        const info = await transporter.sendMail({
            from: `"Restroon 🍕" <${from}>`,
            to,
            subject,
            html
        });
        console.log(`[EMAIL] ✓ Sent to ${to} | msgId: ${info.messageId}`);
    } catch (err) {
        // Never throw — email failure must NOT break order flow
        console.error(`[EMAIL] ✗ Failed to send to ${to}: ${err.message}`);
    }
}

// ── HTML template builder ───────────────────────────────────────────────────
function buildTemplate({ title, preheader, bodyHtml }) {
    return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#F4F4F5; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; }
    .wrapper { max-width:600px; margin:32px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.10); }
    .header { background:${DARK}; padding:28px 32px; text-align:center; }
    .header h1 { color:#fff; font-size:28px; letter-spacing:1px; }
    .header span { color:${ORANGE}; }
    .banner { background:${ORANGE}; padding:20px 32px; text-align:center; }
    .banner h2 { color:#fff; font-size:22px; font-weight:700; }
    .preheader { color:#fff; font-size:14px; margin-top:6px; opacity:.85; }
    .body { padding:28px 32px; background:#fff; }
    .order-id-box { background:${CREAM}; border:2px solid ${DARK}; border-radius:12px; padding:16px 20px; margin-bottom:24px; }
    .order-id-box .label { font-size:11px; text-transform:uppercase; color:${GREY}; letter-spacing:1px; }
    .order-id-box .value { font-size:26px; font-weight:800; color:${DARK}; letter-spacing:2px; margin-top:4px; }
    .section-title { font-size:13px; font-weight:700; text-transform:uppercase; color:${GREY}; letter-spacing:.8px; margin-bottom:12px; }
    .items-table { width:100%; border-collapse:collapse; margin-bottom:24px; }
    .items-table th { text-align:left; font-size:12px; color:${GREY}; text-transform:uppercase; padding-bottom:8px; border-bottom:2px solid #F3F4F6; }
    .items-table td { padding:10px 0; border-bottom:1px solid #F3F4F6; font-size:15px; color:${DARK}; vertical-align:top; }
    .items-table td.price { text-align:right; font-weight:700; color:${ORANGE}; white-space:nowrap; }
    .total-row { display:flex; justify-content:space-between; align-items:center; background:${DARK}; color:#fff; border-radius:10px; padding:14px 20px; margin-bottom:24px; }
    .total-row .total-label { font-size:16px; font-weight:600; }
    .total-row .total-amount { font-size:22px; font-weight:800; color:${ORANGE}; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; }
    .info-card { background:#F9FAFB; border-radius:10px; padding:14px 16px; }
    .info-card .lbl { font-size:11px; color:${GREY}; text-transform:uppercase; letter-spacing:.7px; margin-bottom:4px; }
    .info-card .val { font-size:14px; font-weight:600; color:${DARK}; }
    .status-badge { display:inline-block; background:${GREEN}; color:#fff; border-radius:20px; padding:4px 14px; font-size:13px; font-weight:700; margin-bottom:24px; }
    .cta { text-align:center; margin:24px 0 8px; }
    .cta a { background:${ORANGE}; color:#fff; text-decoration:none; border-radius:10px; padding:14px 36px; font-weight:700; font-size:16px; display:inline-block; }
    .footer { background:#F9FAFB; text-align:center; padding:20px 32px; font-size:12px; color:${GREY}; }
    .footer strong { color:${DARK}; }
    @media(max-width:480px){
      .info-grid { grid-template-columns:1fr; }
      .body,.header,.banner { padding:20px 18px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🍕 <span>Restro</span>on</h1>
    </div>
    <div class="banner">
      <h2>${title}</h2>
      <div class="preheader">${preheader}</div>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>You're receiving this because you placed an order on <strong>Restroon</strong>.</p>
      <p style="margin-top:6px">© ${new Date().getFullYear()} Restroon. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Public function: fire email pair ────────────────────────────────────────
/**
 * Sends a beautifully designed confirmation email to the customer
 * and an order-alert email to the cafe owner.
 *
 * @param {Object} order  Mongoose Order document
 * @param {Object} cafe   Mongoose Cafe document
 * @param {string} customerEmail  Customer's email (from User doc or order)
 */
export async function sendOrderEmailPair(order, cafe, customerEmail) {
    const shortId      = order._id.toString().slice(-8).toUpperCase();
    const total        = order.totalAmount;
    const customerName = order.customerName || 'Valued Customer';
    const payMode      = order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '✅ Paid Online';
    const orderTypeLbl = order.orderType === 'dine_in' ? 'Dine-in' : 'Home Delivery';

    const deliveryAddr = order.orderType === 'dine_in'
        ? 'Dine-in at cafe'
        : [order.deliveryAddress?.street, order.deliveryAddress?.city, order.deliveryAddress?.pincode]
              .filter(Boolean).join(', ') || 'Address on file';

    // Build items rows
    const itemRows = order.items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align:center;color:#6B7280;">× ${item.quantity}</td>
          <td class="price">₹${(item.price * item.quantity).toFixed(0)}</td>
        </tr>`).join('');

    // ── CUSTOMER EMAIL ──────────────────────────────────────────────────────
    if (customerEmail) {
        const customerBody = /* html */ `
          <div class="order-id-box">
            <div class="label">Order ID</div>
            <div class="value">#${shortId}</div>
          </div>

          <p style="font-size:16px;color:#1A1A1A;margin-bottom:20px;">
            Hey <strong>${customerName}</strong> 👋 — your order at <strong>${cafe.name}</strong> is confirmed!
            We'll keep you updated as it progresses.
          </p>

          <span class="status-badge">✔ Order Confirmed</span>

          <p class="section-title">Your Items</p>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:center">Qty</th>
                <th style="text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <div class="total-row">
            <span class="total-label">Total Payable</span>
            <span class="total-amount">₹${total}</span>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <div class="lbl">Payment</div>
              <div class="val">${payMode}</div>
            </div>
            <div class="info-card">
              <div class="lbl">Order Type</div>
              <div class="val">${orderTypeLbl}</div>
            </div>
            <div class="info-card" style="grid-column:1/-1">
              <div class="lbl">${order.orderType === 'dine_in' ? 'Table Info' : 'Delivery Address'}</div>
              <div class="val">${deliveryAddr}</div>
            </div>
          </div>

          ${order.note ? `
          <div class="info-card" style="margin-bottom:24px;">
            <div class="lbl">Your Note</div>
            <div class="val">${order.note}</div>
          </div>` : ''}

          <div class="cta">
            <a href="${process.env.CLIENT_URL}/order/${order._id}">Track Your Order →</a>
          </div>`;

        await sendMail({
            to: customerEmail,
            subject: `✅ Order #${shortId} Confirmed — ${cafe.name}`,
            html: buildTemplate({
                title: 'Order Confirmed! 🎉',
                preheader: `Your order at ${cafe.name} is placed. Total: ₹${total}`,
                bodyHtml: customerBody
            })
        });
    } else {
        console.warn(`[EMAIL] Customer email missing for order ${shortId}`);
    }

    // ── CAFE OWNER EMAIL ────────────────────────────────────────────────────
    const cafeOwnerEmail = cafe.ownerEmail || process.env.EMAIL_USER;
    if (cafeOwnerEmail) {
        const cafeBody = /* html */ `
          <div class="order-id-box">
            <div class="label">New Order ID</div>
            <div class="value">#${shortId}</div>
          </div>

          <p style="font-size:16px;color:#1A1A1A;margin-bottom:20px;">
            🔔 You have a <strong>new order</strong> on Restroon!
            Login to your dashboard to accept and prepare it.
          </p>

          <p class="section-title">Order Items</p>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:center">Qty</th>
                <th style="text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <div class="total-row">
            <span class="total-label">Order Total</span>
            <span class="total-amount">₹${total}</span>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <div class="lbl">Customer</div>
              <div class="val">${customerName}</div>
            </div>
            <div class="info-card">
              <div class="lbl">Phone</div>
              <div class="val">${order.customerPhone || 'N/A'}</div>
            </div>
            <div class="info-card">
              <div class="lbl">Payment</div>
              <div class="val">${payMode}</div>
            </div>
            <div class="info-card">
              <div class="lbl">Type</div>
              <div class="val">${orderTypeLbl}</div>
            </div>
            <div class="info-card" style="grid-column:1/-1">
              <div class="lbl">${order.orderType === 'dine_in' ? 'Table Info' : 'Deliver To'}</div>
              <div class="val">${deliveryAddr}</div>
            </div>
          </div>

          ${order.note ? `
          <div class="info-card" style="margin-bottom:24px;">
            <div class="lbl">Customer Note</div>
            <div class="val">${order.note}</div>
          </div>` : ''}

          <div class="cta">
            <a href="${process.env.CLIENT_URL}/owner/orders">View in Dashboard →</a>
          </div>`;

        await sendMail({
            to: cafeOwnerEmail,
            subject: `🔔 New Order #${shortId} — Action Required`,
            html: buildTemplate({
                title: 'New Order Received!',
                preheader: `${customerName} placed an order. Total: ₹${total}. Accept now.`,
                bodyHtml: cafeBody
            })
        });
    }
}

// ── NEW CONTACT FORM EMAIL ───────────────────────────────────────────────────
export async function sendContactEmail(contactData) {
    const { name, email, subject, message } = contactData;
    
    const supportEmail = process.env.EMAIL_USER;
    if (!supportEmail) {
        console.warn('[EMAIL] Support mapped email not found, skipping contact email');
        return;
    }

    const htmlBody = /* html */ `
        <p style="font-size:16px;color:#1A1A1A;margin-bottom:20px;">
          You have received a new message from the Restroon Contact Form:
        </p>

        <div style="background:#FFFBEF;border:2px solid #FF6B35;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 10px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin:0 0 10px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin:0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
          <hr style="border:none;border-top:1px solid #FF6B35;margin:15px 0;" />
          <p style="margin:0;white-space:pre-wrap;">${message}</p>
        </div>
        
        <p style="font-size:14px;color:#6B7280;">Reply directly to ${email} to answer.</p>
    `;

    await sendMail({
        to: supportEmail,
        subject: `[Contact] ${subject}`,
        html: buildTemplate({
            title: 'New Contact Inquiry 📬',
            preheader: `From: ${name}`,
            bodyHtml: htmlBody
        })
    });
}

// ── DELIVERY PARTNER INVITE EMAIL (via Resend — works on Render free tier) ──
/**
 * Sends a branded invite email using Resend (HTTP API, no SMTP needed).
 * Gmail SMTP is blocked on Render free tier (ports 465/587 firewalled).
 * Resend sends over HTTPS so it works everywhere.
 *
 * Requires RESEND_API_KEY env var. Uses onboarding@resend.dev as sender
 * until a custom domain is verified on Resend.
 *
 * @param {Object} params
 * @param {string} params.to         - Recipient email
 * @param {string} params.cafeName   - Name of the inviting cafe
 * @param {string} params.inviteCode - 8-char invite code
 */
export async function sendDeliveryInviteEmail({ to, cafeName, inviteCode }) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const clientUrl = process.env.CLIENT_URL || 'https://restroon.vercel.app';

    if (!apiKey) {
        console.warn(`[EMAIL] ⚠️  RESEND_API_KEY not set — invite email to ${to} skipped`);
        console.log(`[EMAIL-DEV] INVITE CODE for ${to}: ${inviteCode}`);
        return;
    }

    // Dynamic import — Resend is only needed for invite emails
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
                  background:#fdf6e3;border-radius:16px;padding:32px;
                  border:2px solid #f5c518;">
        <h2 style="font-size:22px;font-weight:900;text-transform:uppercase;
                   color:#1a1a1a;margin:0 0 4px;">🛵 Restroon</h2>
        <p style="color:#888;margin:0 0 20px;font-size:13px;">
          Delivery Partner Invitation
        </p>
        <p style="font-size:15px;color:#333;margin:0 0 20px;">
          <strong>${cafeName}</strong> has invited you to join Restroon
          as a <strong>Delivery Partner</strong>.
        </p>
        <div style="background:#f5c518;border-radius:12px;padding:24px;
                    text-align:center;margin:0 0 20px;">
          <p style="margin:0;font-size:11px;color:#666;
                    text-transform:uppercase;letter-spacing:3px;">
            Your Invite Code
          </p>
          <p style="margin:12px 0 0;font-size:44px;font-weight:900;
                    letter-spacing:10px;color:#1a1a1a;font-family:monospace;">
            ${inviteCode}
          </p>
        </div>
        <div style="background:#fff;border-radius:10px;padding:16px;
                    border:1px solid #e8d07a;margin:0 0 16px;">
          <p style="margin:0 0 10px;font-weight:bold;color:#333;font-size:14px;">
            How to get started:
          </p>
          <ol style="margin:0;padding-left:20px;color:#555;
                     line-height:2;font-size:14px;">
            <li>Go to
              <a href="${clientUrl}/register"
                 style="color:#c8a000;font-weight:bold;">
                ${clientUrl.replace('https://', '')}/register
              </a>
            </li>
            <li>Select the <strong>Delivery Partner</strong> tile</li>
            <li>Enter code:
              <strong style="font-family:monospace;font-size:16px;
                             background:#f5f5f5;padding:2px 8px;
                             border-radius:4px;">${inviteCode}</strong>
            </li>
            <li>Fill in your name, phone and password</li>
            <li>Start delivering! 🎉</li>
          </ol>
        </div>
        <p style="font-size:11px;color:#bbb;text-align:center;margin:0;">
          Invite expires in 7 days · Do not share this code
        </p>
      </div>`;

    const { data, error } = await resend.emails.send({
        from: 'Restroon <onboarding@resend.dev>',
        to,
        subject: `🛵 You're invited to join ${cafeName} on Restroon`,
        html
    });

    if (error) {
        console.error(`[EMAIL] ✗ Resend error for ${to}:`, error);
        throw new Error(error.message || 'Resend email failed');
    }

    console.log(`[EMAIL] ✓ Invite email sent to ${to} via Resend | code: ${inviteCode} | id: ${data.id}`);
}
