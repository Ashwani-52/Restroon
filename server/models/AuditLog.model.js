import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['customer', 'owner', 'admin']
        },
        action: {
            type: String,
            required: true
            // e.g. 'LOGIN', 'REGISTER', 'ORDER_PLACED',
            //      'CAFE_APPROVED', 'USER_SUSPENDED'
        },
        targetModel: {
            type: String,
            enum: ['User', 'Cafe', 'Order', 'MenuItem', '']
            // which collection was affected
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId
            // which document was affected
        },
        details: {
            type: String,
            default: ''
            // extra info about the action
        },
        ipAddress: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
