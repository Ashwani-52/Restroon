import mongoose from 'mongoose';
import {
    CAFE_STATUS,
    DEFAULT_DELIVERY_RADIUS,
    DEFAULT_OPENING_TIME,
    DEFAULT_CLOSING_TIME,
    CAFE_NAME_MAX,
    CAFE_DESC_MAX
} from '../utils/constants.js';

const cafeSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Owner is required']
        },
        name: {
            type: String,
            required: [true, 'Cafe name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [CAFE_NAME_MAX, `Name cannot exceed ${CAFE_NAME_MAX} characters`]
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
            maxlength: [CAFE_DESC_MAX, `Description cannot exceed ${CAFE_DESC_MAX} characters`],
            default: ''
        },
        logo: {
            type: String,
            default: ''
        },
        coverImage: {
            type: String,
            default: ''
        },
        cuisine: [
            {
                type: String,
                trim: true
            }
        ],
        status: {
            type: String,
            enum: Object.values(CAFE_STATUS),
            default: CAFE_STATUS.PENDING
        },
        phone: {
            type: String,
            trim: true
        },
        address: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            pincode: { type: String, trim: true },
            coordinates: {
                lat: { type: Number, required: [true, 'Latitude is required'] },
                lng: { type: Number, required: [true, 'Longitude is required'] }
            }
        },
        location: {
            type: { type: String, default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
        },
        deliveryRadius: {
            type: Number,
            default: DEFAULT_DELIVERY_RADIUS
        },
        isOpen: {
            type: Boolean,
            default: false
        },
        openingHours: {
            open: { type: String, default: DEFAULT_OPENING_TIME },
            close: { type: String, default: DEFAULT_CLOSING_TIME }
        },
        ratings: {
            average: { type: Number, default: 0, min: 0, max: 5 },
            count: { type: Number, default: 0 }
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        // Add to Cafe.model.js inside cafeSchema
        banking: {
            accountHolderName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            ifscCode: { type: String, default: '' },
            upiId: { type: String, default: '' },
            razorpayAccountId: { type: String, default: '' }, // linked account ID from Razorpay
            isVerified: { type: Boolean, default: false }
        },
        // Add to Cafe.model.js inside cafeSchema
        subscription: {
            plan: { type: String, enum: ['starter', 'growth', 'pro'], default: 'starter' },
            status: { type: String, enum: ['active', 'expired', 'trial'], default: 'trial' },
            startDate: { type: Date },
            endDate: { type: Date },
            razorpayPaymentId: { type: String, default: '' }
        },
    },
    { timestamps: true }
);

// ─── Indexes ───────────────────────────────
cafeSchema.index({ location: '2dsphere' });
cafeSchema.index({ 'subscription.status': 1, status: 1 });

// ─── Auto generate slug from name ──────────
cafeSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
    next();
});



export default mongoose.model('Cafe', cafeSchema);