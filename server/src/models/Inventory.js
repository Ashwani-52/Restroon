const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    cafe: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafe', required: true },
    currentStock: { type: Number, required: true, default: 0 },
    minStock: { type: Number, required: true, default: 5 },
    maxStock: { type: Number },
    unit: { type: String, required: true, default: 'units' },
    category: String,
    supplier: String,
    costPerUnit: Number,
    lastRestockedAt: Date,
}, { timestamps: true });

// Virtual for low stock status
inventorySchema.virtual('isLowStock').get(function () {
    return this.currentStock <= this.minStock;
});

module.exports = mongoose.model('Inventory', inventorySchema);
