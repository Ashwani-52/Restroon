import Cafe from '../models/Cafe.model.js';
import User from '../models/User.model.js';
import {
    CAFE_STATUS,
    ROLES
} from '../utils/constants.js';
import { geocodeAddress } from '../utils/geocode.js';

// ──────────────────────────────────────────
// REGISTER CAFE (Owner only)
// ──────────────────────────────────────────
export const registerCafe = async (req, res) => {
    try {
        const {
            name,
            description,
            cuisine,
            phone,
            address,
            deliveryRadius,
            openingHours
        } = req.body;

        // ─── Validate required fields ──────────
        // Instead of demanding frontend GPS lat/lng, we only demand name and address parts
        if (!name || !address || !address.street || !address.city) {
            return res.status(400).json({
                success: false,
                message: 'Cafe name and complete address fields (street, city) are required'
            });
        }

        // ─── Check if owner already has a cafe ─
        const existingCafe = await Cafe.findOne({ owner: req.user._id });
        if (existingCafe) {
            return res.status(409).json({
                success: false,
                message: 'You already have a registered cafe'
            });
        }
        
        // ─── Geocode Address ───────────────────
        let coords = null;
        if (address.coordinates && address.coordinates.lat && address.coordinates.lng && address.coordinates.lat !== 0) {
            coords = address.coordinates;
        } else {
            coords = await geocodeAddress([
                address.street,
                address.city,
                address.pincode,
                'India'
            ]);
        }

        if (!coords) {
            return res.status(400).json({
                success: false,
                message: 'Location could not be verified automatically. Please select your exact location on the map.'
            });
        }

        const cafe = await Cafe.create({
            owner: req.user._id,
            name,
            description: description || '',
            cuisine: cuisine || [],
            phone: phone || '',
            address: { 
                ...address, 
                coordinates: { lat: coords.lat, lng: coords.lng } 
            },
            deliveryRadius,
            openingHours,
            location: {
                type: 'Point',
                coordinates: [coords.lng, coords.lat]
            }
        });

        res.status(201).json({
            success: true,
            message: 'Cafe registered successfully. Waiting for admin approval.',
            cafe
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to register cafe',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET MY CAFE (Owner only)
// ──────────────────────────────────────────
export const getMyCafe = async (req, res) => {
    try {
        const cafe = await Cafe.findOne({ owner: req.user._id });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'No cafe found. Please register your cafe first.'
            });
        }

        res.status(200).json({ success: true, cafe });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cafe',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// UPDATE MY CAFE (Owner only)
// ──────────────────────────────────────────
export const updateMyCafe = async (req, res) => {
    try {
        const {
            name,
            description,
            cuisine,
            phone,
            address,
            deliveryRadius,
            openingHours,
            isOpen
        } = req.body;

        // ─── Find cafe owned by this user ──────
        const cafe = await Cafe.findOne({ owner: req.user._id });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'Cafe not found'
            });
        }

        // ─── Update only provided fields ───────
        if (name) cafe.name = name;
        if (description) cafe.description = description;
        if (cuisine) cafe.cuisine = cuisine;
        if (phone) cafe.phone = phone;
        if (address) {
            // Geocode the updated address
            const coords = await geocodeAddress([
                address.street || cafe.address.street,
                address.city || cafe.address.city,
                address.pincode || cafe.address.pincode,
                'India'
            ]);
            
            if (coords) {
                cafe.address = {
                    ...cafe.address,
                    ...address,
                    coordinates: { lat: coords.lat, lng: coords.lng }
                };
                cafe.location = {
                    type: 'Point',
                    coordinates: [coords.lng, coords.lat]
                };
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Location couldn't be verified. Keeping old address."
                });
            }
        }
        if (deliveryRadius !== undefined) cafe.deliveryRadius = deliveryRadius;
        if (openingHours) cafe.openingHours = openingHours;
        if (isOpen !== undefined) cafe.isOpen = isOpen;

        await cafe.save();

        res.status(200).json({
            success: true,
            message: 'Cafe updated successfully',
            cafe
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update cafe',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// TOGGLE CAFE OPEN/CLOSED (Owner only)
// ──────────────────────────────────────────
export const toggleCafeStatus = async (req, res) => {
    try {
        const cafe = await Cafe.findOne({ owner: req.user._id });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'Cafe not found'
            });
        }

        // ─── Only active cafes can toggle (Disabled for testing) ──────
        // if (cafe.status !== CAFE_STATUS.ACTIVE) {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Cafe must be approved by admin before opening'
        //     });
        // }

        cafe.isOpen = !cafe.isOpen;
        await cafe.save();

        res.status(200).json({
            success: true,
            message: `Cafe is now ${cafe.isOpen ? 'Open' : 'Closed'}`,
            isOpen: cafe.isOpen
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to toggle cafe status',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET ALL ACTIVE CAFES (Customer)
// ──────────────────────────────────────────
export const getActiveCafes = async (req, res) => {
    try {
        const { lat, lng, search } = req.query;

        // ─── Base query — only active cafes ────
        const query = { status: CAFE_STATUS.ACTIVE };

        // ─── Search by name ────────────────────
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const cafes = await Cafe.find(query)
            .select('-totalRevenue')     // hide revenue from customers
            .sort({ 'ratings.average': -1 });

        res.status(200).json({
            success: true,
            count: cafes.length,
            cafes
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cafes',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// GET NEARBY CAFES (Public)
// ──────────────────────────────────────────
export const getNearbyCafes = async (req, res) => {
    try {
        const { lat, lng, radiusInKm = 5 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid lat and lng coordinates"
            });
        }

        const cafes = await Cafe.find({
            status: CAFE_STATUS.ACTIVE,
            'subscription.status': { $in: ['active', 'trial'] },
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseFloat(radiusInKm) * 1000 // Convert km to meters
                }
            }
        }).select('-totalRevenue');

        res.status(200).json({
            success: true,
            count: cafes.length,
            cafes
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nearby cafes',
            error: err.message
        });
    }
};


// ──────────────────────────────────────────
// GET SINGLE CAFE BY SLUG (Public)
// ──────────────────────────────────────────
export const getCafeBySlug = async (req, res) => {
    try {
        const cafe = await Cafe.findOne({
            slug: req.params.slug,
            status: CAFE_STATUS.ACTIVE
        }).select('-totalRevenue');

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'Cafe not found'
            });
        }

        res.status(200).json({ success: true, cafe });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cafe',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// ADMIN — GET ALL CAFES
// ──────────────────────────────────────────
export const adminGetAllCafes = async (req, res) => {
    try {
        const { status } = req.query;

        const query = {};
        if (status) query.status = status;

        const cafes = await Cafe.find(query)
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: cafes.length,
            cafes
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cafes',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// ADMIN — APPROVE OR SUSPEND CAFE
// ──────────────────────────────────────────
export const adminUpdateCafeStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { cafeId } = req.params;

        // ─── Validate status ───────────────────
        if (!Object.values(CAFE_STATUS).includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${Object.values(CAFE_STATUS).join(', ')}`
            });
        }

        const cafe = await Cafe.findByIdAndUpdate(
            cafeId,
            { status },
            { new: true }
        ).populate('owner', 'name email');

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'Cafe not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Cafe ${status} successfully`,
            cafe
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update cafe status',
            error: err.message
        });
    }
};

// ──────────────────────────────────────────
// UPDATE UPI ID (Owner only)
// ──────────────────────────────────────────
export const updateUpiSettings = async (req, res) => {
    try {
        const { upiId, upiName } = req.body;

        // Basic UPI ID validation — must contain @
        if (!upiId || !upiId.includes('@')) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid UPI ID. Format: yourname@upi' 
            });
        }

        const cafe = await Cafe.findOneAndUpdate(
            { owner: req.user._id },
            { upiId: upiId.trim(), upiName: upiName?.trim() || '' },
            { new: true }
        );

        res.json({ success: true, message: 'UPI ID saved ✅', cafe });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ──────────────────────────────────────────
// GET UPI ID (Owner only)
// ──────────────────────────────────────────
export const getUpiSettings = async (req, res) => {
    try {
        const cafe = await Cafe.findOne({ owner: req.user._id }).select('upiId upiName');
        res.json({ success: true, upiId: cafe?.upiId || null, upiName: cafe?.upiName || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};