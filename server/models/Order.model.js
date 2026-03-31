import mongoose from 'mongoose';
import {
    ORDER_STATUS,
    DEFAULT_ESTIMATED_TIME,
    ORDER_NOTE_MAX
} from '../utils/constants.js';

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Customer is required']
        },
        cafe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cafe',
            required: [true, 'Cafe is required']
        },
        items: [
            {
                menuItem: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'MenuItem'
                },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true, min: 1 },
                image: { type: String, default: '' }
            }
        ],
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total amount cannot be negative']
        },
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PLACED
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending'
        },
        paymentMethod: {
            type: String,
            enum: ['cod', 'online'],
            default: 'cod'
        },
        razorpayOrderId: { type: String, default: '' },
        razorpayPaymentId: { type: String, default: '' },
        deliveryAddress: {
            street: { type: String },
            city: { type: String },
            pincode: { type: String },
            coordinates: {
                lat: { type: Number },
                lng: { type: Number }
            }
        },
        estimatedTime: {
            type: Number,
            default: DEFAULT_ESTIMATED_TIME
        },
        note: {
            type: String,
            maxlength: [ORDER_NOTE_MAX, `Note cannot exceed ${ORDER_NOTE_MAX} characters`],
            default: ''
        },
        orderType: {
            type: String,
            enum: ['delivery', 'dine_in'],
            default: 'delivery'
        },
        customerName: { type: String, default: '' },
        customerPhone: { type: String, default: '' },
        customerEmail: { type: String, default: '' },
        paymentConfirmed: { type: Boolean, default: false },
        platformFee: { type: Number, default: 0 },
        totalCharged: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model('Order', orderSchema);