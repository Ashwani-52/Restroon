import mongoose from 'mongoose';

const deliveryInviteSchema = new mongoose.Schema(
    {
        cafeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cafe',
            required: [true, 'Cafe is required']
        },
        cafeName: {
            type: String,
            default: ''
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
        inviteCode: {
            type: String,
            unique: true,
            required: [true, 'Invite code is required']
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'expired'],
            default: 'pending'
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

deliveryInviteSchema.index({ cafeId: 1, status: 1 });
deliveryInviteSchema.index({ inviteCode: 1 });
deliveryInviteSchema.index({ email: 1 });
deliveryInviteSchema.index({ phone: 1 });

export default mongoose.model('DeliveryInvite', deliveryInviteSchema);
