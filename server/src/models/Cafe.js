const mongoose = require('mongoose');

const cafeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    logo: { type: String },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' },
    },
    contact: {
        phone: String,
        email: String,
        website: String,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    settings: {
        openingTime: { type: String, default: '09:00' },
        closingTime: { type: String, default: '22:00' },
        currency: { type: String, default: 'INR' },
        taxRate: { type: Number, default: 5 },
    },
    paymentDetails: {
        upiId: String,
        bankDetails: {
            accountNumber: String,
            ifscCode: String,
            accountName: String,
            bankName: String,
        }
    },
}, { timestamps: true });

module.exports = mongoose.model('Cafe', cafeSchema);
