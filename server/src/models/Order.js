const mongoose = require('mongoose');
// DSA: Schema fields act as a Hash Map
// Each key-value pair allows constant-time data access
const orderItemSchema = new mongoose.Schema({
    // DSA: Graph relationship
    // Order node references Product node via ObjectId
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: String,
    addons: [String],
    notes: String,
});

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    cafe: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafe', required: true },
    //DSA Concept
    // Tree / Hierarchical structure
    // Parent → Child nodes
    // DSA: Tree-like hierarchical structure
    // Customer is a nested object under order
    customer: {
        name: String,
        phone: String,
        email: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    // DSA: Array data structure
    // Stores multiple order items in sequential form
    // Traversed linearly during processing
    items: [orderItemSchema],

    // DSA: Finite State Machine (FSM)
    //Set of allowed values
    // Prevents invalid state transitions
    // Order status restricted to a fixed set of valid states
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending',
    },

    // DSA: Set-based state validation
    // Ensures payment stays in valid predefined states
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    paymentMethod: { type: String },
    transactionId: { type: String },
    orderType: {
        type: String,
        enum: ['dine_in', 'takeaway', 'delivery'],
        default: 'dine_in',
    },
    tableNumber: String,
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    notes: String,
    cancellationReason: String,
}, { timestamps: true });

// Auto-generate order number before save
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
