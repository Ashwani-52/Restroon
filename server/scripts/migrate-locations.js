import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Cafe from '../models/Cafe.model.js';
import { geocodeAddress } from '../utils/geocode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function migrateLocations() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all cafes
        const cafes = await Cafe.find({});
        console.log(`Found ${cafes.length} cafes to process.`);

        let updatedCount = 0;
        let failedCount = 0;

        for (const cafe of cafes) {
            console.log(`Processing cafe: ${cafe.name}...`);
            const { street, city, pincode } = cafe.address || {};
            
            // Wait a second between requests to respect Nominatim rate limit
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            const coords = await geocodeAddress([street, city, pincode, 'India']);

            if (coords) {
                // Update coordinates
                cafe.address.coordinates = { lat: coords.lat, lng: coords.lng };
                cafe.location = {
                    type: 'Point',
                    coordinates: [coords.lng, coords.lat]
                };

                await cafe.save();
                console.log(`✅ Successfully geocoded and updated ${cafe.name} (${coords.lat}, ${coords.lng}).`);
                updatedCount++;
            } else {
                console.log(`❌ Failed to geocode ${cafe.name}. Skipped.`);
                failedCount++;
            }
        }

        console.log(`Migration Complete. Updated ${updatedCount} cafes. Failed ${failedCount} cafes.`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

migrateLocations();
