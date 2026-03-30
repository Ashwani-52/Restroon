import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
    BCRYPT_SALT_ROUNDS,
    USER_NAME_MIN,
    USER_NAME_MAX
} from '../utils/constants.js';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [USER_NAME_MIN, `Name must be at least ${USER_NAME_MIN} characters`],
            maxlength: [USER_NAME_MAX, `Name cannot exceed ${USER_NAME_MAX} characters`]
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
        },
        password: {
            type: String,
            // ← Remove required: true
            minlength: [8, 'Password must be at least 8 characters'],
            select: false
        },
        role: {
            type: String,
            enum: ['customer', 'owner', 'admin'],
            default: 'customer'
        },
        phone: {
            type: String,
            trim: true
        },
        avatar: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true
        },
        refreshToken: {
            type: String,
            select: false
        },
        googleId: {
            type: String,
            select: false
        },
        addresses: [
            {
                label: {
                    type: String,
                    enum: ['Home', 'Work', 'Other'],
                    default: 'Home'
                },
                street: { type: String, trim: true },
                city: { type: String, trim: true },
                pincode: { type: String, trim: true },
                coordinates: {
                    lat: { type: Number },
                    lng: { type: Number }
                }
            }
        ],
        // ─── Quick-access default address for checkout auto-fill ───
        defaultAddress: {
            street: { type: String, trim: true, default: '' },
            city: { type: String, trim: true, default: '' },
            pincode: { type: String, trim: true, default: '' }
        }
    },
    { timestamps: true }
);

// ─── Hash password before save ─────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    if (!this.password) return next();       // ← Skip if no password (Google users)
    this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
    next();
});

// ─── Compare password ──────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Remove sensitive fields ───────────────
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    return obj;
};

export default mongoose.model('User', userSchema);
