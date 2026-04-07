// server/controllers/cafeRegistration.controller.js
// Handles the 3-step cafe registration + subscription payment flow

import Razorpay        from 'razorpay';
import crypto          from 'crypto';
import Cafe            from '../models/Cafe.model.js';
import Subscription    from '../models/Subscription.model.js';
import User            from '../models/User.model.js';
import { SUBSCRIPTION_PLANS } from '../utils/constants.js';

const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ─────────────────────────────────────────────────────────
   STEP 1 — Save temp cafe details
   POST /api/cafe-registration/save-details
───────────────────────────────────────────────────────── */
export const saveTempDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, address, city, state, pincode, phone, cuisine, lat, lng } = req.body;

        if (!name || !address || !lat || !lng) {
            return res.status(400).json({ success: false, message: 'Name, address and location are required' });
        }

        // Check if owner already has a cafe record
        let cafe = await Cafe.findOne({ owner: userId });

        const tempData = {
            tempDetails: {
                name, address, city, state, pincode, phone, cuisine,
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                }
            },
            registrationStep: 'subscription'
        };

        if (cafe) {
            Object.assign(cafe, tempData);
            await cafe.save();
        } else {
            // Minimal required fields to create a Cafe doc
            cafe = await Cafe.create({
                owner: userId,
                name,
                address: {
                    street: address,
                    city: city || '',
                    pincode: pincode || '',
                    coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) }
                },
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                isRegistered: false,
                ...tempData
            });
        }

        res.json({ success: true, cafeId: cafe._id, step: 'subscription' });
    } catch (err) {
        console.error('saveTempDetails error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ─────────────────────────────────────────────────────────
   STEP 2 — Create Razorpay order for chosen plan
   POST /api/cafe-registration/create-order
───────────────────────────────────────────────────────── */
export const createRegistrationOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { planId, cafeId } = req.body;

        const plan = SUBSCRIPTION_PLANS[planId];
        if (!plan) {
            return res.status(400).json({ success: false, message: 'Invalid plan selected' });
        }

        const cafe = await Cafe.findOne({ _id: cafeId, owner: userId });
        if (!cafe) {
            return res.status(404).json({ success: false, message: 'Cafe not found' });
        }

        // Free trial — no Razorpay order needed; activate directly
        if (plan.amount === 0) {
            return res.json({
                success: true,
                isFree: true,
                planId,
                cafeId,
                message: 'Free trial — no payment required'
            });
        }

        // Paid plan — create Razorpay order (amount must be in paise)
        const order = await razorpay.orders.create({
            amount:   plan.amount * 100, // rupees → paise
            currency: 'INR',
            receipt:  `cafe_reg_${cafeId}_${Date.now()}`,
            notes: {
                cafeId:  cafeId.toString(),
                ownerId: userId.toString(),
                planId
            }
        });

        res.json({
            success:  true,
            isFree:   false,
            orderId:  order.id,
            amount:   order.amount,
            currency: order.currency,
            planId,
            cafeId,
            keyId:    process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error('createRegistrationOrder error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ─────────────────────────────────────────────────────────
   STEP 3 — Verify payment & activate cafe
   POST /api/cafe-registration/verify-and-activate
───────────────────────────────────────────────────────── */
export const verifyAndActivate = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            cafeId,
            planId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            isFree
        } = req.body;

        const plan = SUBSCRIPTION_PLANS[planId];
        if (!plan) {
            return res.status(400).json({ success: false, message: 'Invalid plan' });
        }

        const cafe = await Cafe.findOne({ _id: cafeId, owner: userId });
        if (!cafe) {
            return res.status(404).json({ success: false, message: 'Cafe not found' });
        }

        // ── Verify Razorpay signature (skip for free trial) ──
        if (!isFree) {
            const body      = razorpay_order_id + '|' + razorpay_payment_id;
            const expected  = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body)
                .digest('hex');

            if (expected !== razorpay_signature) {
                return res.status(400).json({ success: false, message: 'Payment verification failed' });
            }
        }

        // ── Calculate subscription dates ──────────────────────
        const startDate = new Date();
        const endDate   = new Date(startDate);
        endDate.setDate(endDate.getDate() + (plan.days || 30));

        // ── Create Subscription record ─────────────────────────
        const subscription = await Subscription.create({
            user:        userId,
            cafe:        cafeId,
            planId:      planId,
            planLabel:   plan.label || planId,
            amount:      plan.amount,
            isTrial:     plan.amount === 0,
            status:      'active',
            startDate,
            endDate,
            razorpayOrderId:   razorpay_order_id   || null,
            razorpayPaymentId: razorpay_payment_id || null,
        });

        // ── Promote tempDetails → real cafe fields ─────────────
        const td = cafe.tempDetails || {};
        if (td.name) {
            cafe.name    = td.name;
            cafe.phone   = td.phone   || cafe.phone;
            cafe.cuisine = td.cuisine ? [td.cuisine] : cafe.cuisine;
            cafe.address = {
                street:  td.address  || '',
                city:    td.city     || '',
                pincode: td.pincode  || '',
                coordinates: {
                    lat: td.location?.coordinates?.[1] || 0,
                    lng: td.location?.coordinates?.[0] || 0,
                }
            };
            if (td.location?.coordinates) {
                cafe.location = td.location;
            }
        }

        cafe.isRegistered    = true;
        cafe.isSubscribed    = true;
        cafe.registrationStep = 'complete';
        cafe.subscriptionId  = subscription._id;
        cafe.status          = 'pending'; // still needs admin approval but is now registered
        cafe.subscription    = {
            plan:              planId,
            status:            'active',
            startDate,
            endDate,
            razorpayPaymentId: razorpay_payment_id || ''
        };
        await cafe.save();

        // ── Update User record ─────────────────────────────────
        await User.findByIdAndUpdate(userId, {
            subscriptionStatus:  'active',
            subscriptionEndDate: endDate,
            currentPlan:         planId
        });

        res.json({
            success:  true,
            message:  'Cafe registered and subscription activated!',
            cafeSlug: cafe.slug,
            endDate,
            planId
        });
    } catch (err) {
        console.error('verifyAndActivate error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ─────────────────────────────────────────────────────────
   GET registration status
   GET /api/cafe-registration/status
───────────────────────────────────────────────────────── */
export const getRegistrationStatus = async (req, res) => {
    try {
        const cafe = await Cafe.findOne({ owner: req.user._id })
            .select('isRegistered isSubscribed registrationStep subscription tempDetails name slug');

        res.json({ success: true, cafe });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
