import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema({
    cafe: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cafe', 
        required: true 
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    orders: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order' 
    }],
    orderCount: { 
        type: Number, 
        required: true 
    },
    amountPaid: { 
        type: Number, 
        required: true 
    },
    razorpayOrderId: { 
        type: String, 
        required: true 
    },
    razorpayPaymentId: { 
        type: String, 
        required: true 
    },
    razorpaySignature: { 
        type: String, 
        required: true 
    },
    paidAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Indexes for fast admin queries
commissionSchema.index({ cafe: 1 });
commissionSchema.index({ paidAt: -1 });

export default mongoose.model('Commission', commissionSchema);
