// server/controllers/user.controller.js
import User from '../models/User.model.js';

// ──────────────────────────────────────────
// UPDATE PROFILE (Customer)
// Saves: phone, defaultAddress
// So CafePage can auto-fill on next visit.
// ──────────────────────────────────────────
export const updateProfile = async (req, res) => {
    try {
        const { phone, defaultAddress, name } = req.body;

        const updates = {};

        if (name && name.trim()) updates.name = name.trim();

        if (phone && phone.trim()) {
            // Basic phone validation (8–15 digits with optional +)
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length < 8 || cleaned.length > 15) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number'
                });
            }
            updates.phone = phone.trim();
        }

        if (defaultAddress) {
            const { street, city, pincode } = defaultAddress;
            if (street || city || pincode) {
                updates.defaultAddress = {
                    street: street?.trim() || '',
                    city: city?.trim() || '',
                    pincode: pincode?.trim() || ''
                };
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated',
            user
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET PROFILE (returns saved address + phone)
// ──────────────────────────────────────────
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
