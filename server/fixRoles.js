import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';

dotenv.config();

const fixRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        // List all users so we can see the problem
        const allUsers = await User.find({}, 'name email role');
        console.log('\n📋 All users in database:');
        allUsers.forEach(u => {
            console.log(`  ${u.name} | ${u.email} | role: ${u.role}`);
        });

        // Find users that likely should be owners
        // Rishab Singh and Subhash Kumar are mentioned as cafe owners
        const ownerNames = ['rishab singh', 'subhash kumar'];
        
        for (const name of ownerNames) {
            const user = await User.findOne({ 
                name: { $regex: new RegExp(name, 'i') } 
            });
            
            if (user) {
                if (user.role !== 'owner') {
                    user.role = 'owner';
                    await user.save({ validateBeforeSave: false });
                    console.log(`\n✅ Updated ${user.name} (${user.email}) role to: owner`);
                } else {
                    console.log(`\n✓ ${user.name} already has owner role`);
                }
            } else {
                console.log(`\n⚠️  User "${name}" not found`);
            }
        }

        console.log('\n📋 Updated user list:');
        const updatedUsers = await User.find({}, 'name email role');
        updatedUsers.forEach(u => {
            console.log(`  ${u.name} | ${u.email} | role: ${u.role}`);
        });
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fixRoles();
