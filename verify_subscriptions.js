const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './server/.env' });

const User = require('./server/src/models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find the super_admin user
        const admin = await User.findOne({ email: 'ashwanikumar6064@gmail.com' });
        if (!admin) {
            console.log('Admin not found in DB');
            process.exit(1);
        }

        // Generate token
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('Seeding plans...');
        const fetch = require('node-fetch'); // Use dynamic import or standard if supported, node-fetch v2 works or fetch in node 18+

        const seedRes = await fetch('http://localhost:5050/api/admin/subscriptions/seed-plans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const seedData = await seedRes.json();
        console.log('Seed Plans Result:', seedData);

        // Fetch subscriptions
        console.log('Fetching subscriptions...');
        const subsRes = await fetch('http://localhost:5050/api/admin/subscriptions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const subsData = await subsRes.json();
        console.log('Subscriptions Result:', JSON.stringify(subsData, null, 2));

        console.log('Verification Complete');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
