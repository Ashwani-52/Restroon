import mongoose from 'mongoose';

const deliveryInviteSchema = new mongoose.Schema(
    {
        cafeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cafe',
            required: [true, 'Cafe is required']
        },
        phone: {
            type: String,
            trim: true,
            default: ''
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ''
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

deliveryInviteSchema.index({ cafeId: 1, status: 1 });
deliveryInviteSchema.index({ email: 1 });
deliveryInviteSchema.index({ phone: 1 });

export default mongoose.model('DeliveryInvite', deliveryInviteSchema);
