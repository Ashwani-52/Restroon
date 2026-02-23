const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Plan name is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['starter', 'professional', 'enterprise'],
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        monthly: { type: Number, required: true },
        yearly: { type: Number, required: true }
    },
    features: [{
        type: String
    }],
    limits: {
        maxProducts: { type: Number, default: -1 }, // -1 means unlimited
        maxOrders: { type: Number, default: -1 },
        maxStaff: { type: Number, default: -1 }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
