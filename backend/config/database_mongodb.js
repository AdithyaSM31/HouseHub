/**
 * MongoDB Database Connection
 * Uses Mongoose to connect to MongoDB Atlas
 */

const mongoose = require('mongoose');

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Test connection
const testConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB connection is active');
    return true;
  } else {
    console.log('❌ MongoDB connection is not active');
    return false;
  }
};

module.exports = { connectDB, testConnection };
