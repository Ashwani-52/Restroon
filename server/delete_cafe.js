import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri).then(async () => {
    console.log('Connected to MongoDB');
    // We need to use raw collection or model. Our model is 'Cafe' in mongoose but let's just delete directly to be safe.
    const result = await mongoose.connection.collection('caves').deleteOne({ slug: 'oven-express' });
    console.log('Deleted oven-express:', result);
    process.exit(0);
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
});
