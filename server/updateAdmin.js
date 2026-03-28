import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';

dotenv.config();

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            admin.email = 'ashwanikumar6064@gmail.com';
            // The pre-save hook in User model will hash this automatically if modified
            admin.password = 'Rishab@892005';
            await admin.save();
            console.log('Successfully updated super admin email and password!');
            console.log('Email: ashwanikumar6064@gmail.com');
            console.log('Password: Rishab@892005');
        } else {
            console.log('No super admin found in the database. Please register one first.');
        }
    } catch (err) {
        console.error('Error updating admin:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

updateAdmin();
