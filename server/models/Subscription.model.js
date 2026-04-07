import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        cafe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cafe',
            default: null
        },
        planId: {
            type: String,
            required: true
        },
        planLabel: {
            type: String,
            default: ''
        },
        isTrial: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active'
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        amount: {
            type: Number,
            default: 0
        },
        razorpayOrderId: {
            type: String,
            default: null
        },
        razorpayPaymentId: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model('Subscription', subscriptionSchema);
