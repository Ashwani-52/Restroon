import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            required: true,
            enum: ['COMMISSION_REMINDER', 'SYSTEM']
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        read: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1 });

export default mongoose.model('Notification', notificationSchema);
