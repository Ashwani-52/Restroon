const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Server will continue without DB. Fix Atlas credentials or IP whitelist.');
    console.error('   Fix: Go to MongoDB Atlas → Database Access → Edit User → Reset Password');
    console.error('   Fix: Go to MongoDB Atlas → Network Access → Add IP Address → 0.0.0.0/0 (Allow All)');
  }
};

module.exports = connectDB;
