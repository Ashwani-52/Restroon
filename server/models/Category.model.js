import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        cafeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cafe',
            required: [true, 'Cafe is required']
        },
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

export default mongoose.model('Category', categorySchema);
