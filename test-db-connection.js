// test-db-connection.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

console.log('Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.log('Please create a .env.local file with:');
  console.log('MONGODB_URI=mongodb://localhost:27017/moviestream');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();