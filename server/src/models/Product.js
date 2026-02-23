const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    cafe: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafe', required: true },
    isAvailable: { type: Boolean, default: true },
    variants: [{
        name: String,
        price: Number,
    }],
    addons: [{
        name: String,
        price: Number,
    }],
    preparationTime: { type: Number, default: 10 }, // in minutes
    tags: [String],
    isVeg: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
