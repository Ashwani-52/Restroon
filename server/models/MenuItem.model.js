import mongoose from 'mongoose';
import {
    MENU_ITEM_NAME_MAX,
    MENU_ITEM_DESC_MAX
} from '../utils/constants.js';

const menuItemSchema = new mongoose.Schema(
    {
        cafe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cafe',
            required: [true, 'Cafe is required']
        },
        name: {
            type: String,
            required: [true, 'Item name is required'],
            trim: true,
            maxlength: [MENU_ITEM_NAME_MAX, `Name cannot exceed ${MENU_ITEM_NAME_MAX} characters`]
        },
        description: {
            type: String,
            maxlength: [MENU_ITEM_DESC_MAX, `Description cannot exceed ${MENU_ITEM_DESC_MAX} characters`],
            default: ''
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        image: {
            type: String,
            default: ''
        },
        category: {
            type: String,
            trim: true,
            default: 'General'
        },
        isVeg: {
            type: Boolean,
            default: true
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        isBestSeller: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);