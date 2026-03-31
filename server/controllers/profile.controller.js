// server/controllers/profile.controller.js
import User  from '../models/User.model.js';
import Order from '../models/Order.model.js';
import Cafe  from '../models/Cafe.model.js';

// ──────────────────────────────────────────
// GET PROFILE
// ──────────────────────────────────────────
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password -refreshToken -googleId')
            .populate('favourites', 'name logo address.city slug');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to get profile', error: err.message });
    }
};

// ──────────────────────────────────────────
// UPDATE PROFILE (name, phone)
// ──────────────────────────────────────────
export const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        const updates = {};
        if (name && name.trim()) updates.name  = name.trim();
        if (phone !== undefined)  updates.phone = phone.trim();

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password -refreshToken -googleId');

        res.status(200).json({ success: true, message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update profile', error: err.message });
    }
};

// ──────────────────────────────────────────
// ADD ADDRESS
// ──────────────────────────────────────────
export const addAddress = async (req, res) => {
    try {
        const { label, street, city, pincode } = req.body;

        if (!street || !city) {
            return res.status(400).json({ success: false, message: 'Street and city are required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $push: {
                    addresses: { label: label || 'Home', street, city, pincode: pincode || '' }
                }
            },
            { new: true }
        ).select('addresses');

        res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to add address', error: err.message });
    }
};

// ──────────────────────────────────────────
// DELETE ADDRESS
// ──────────────────────────────────────────
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { addresses: { _id: addressId } } },
            { new: true }
        ).select('addresses');

        res.status(200).json({ success: true, message: 'Address removed', addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete address', error: err.message });
    }
};

// ──────────────────────────────────────────
// TOGGLE FAVOURITE CAFE
// ──────────────────────────────────────────
export const toggleFavourite = async (req, res) => {
    try {
        const { cafeId } = req.params;

        const cafe = await Cafe.findById(cafeId);
        if (!cafe) {
            return res.status(404).json({ success: false, message: 'Cafe not found' });
        }

        const user = await User.findById(req.user._id).select('favourites');
        const isFav = user.favourites.some(id => id.toString() === cafeId);

        const update = isFav
            ? { $pull: { favourites: cafeId } }
            : { $addToSet: { favourites: cafeId } };

        await User.findByIdAndUpdate(req.user._id, update);

        res.status(200).json({
            success: true,
            message: isFav ? 'Removed from favourites' : 'Added to favourites',
            isFavourite: !isFav
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to toggle favourite', error: err.message });
    }
};

// ──────────────────────────────────────────
// GET ORDER HISTORY (all customer orders)
// ──────────────────────────────────────────
export const getOrderHistory = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ customer: req.user._id })
                .populate('cafe', 'name logo address.city slug')
                .populate('items.menuItem', 'name image price')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments({ customer: req.user._id })
        ]);

        res.status(200).json({
            success: true,
            orders,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
    }
};
