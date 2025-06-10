// Load environment variables first, before anything else
try {
    require('dotenv').config({ path: '.env.local' });
  } catch (error) {
    // dotenv might not be available in production, that's ok
  }
  
  import mongoose from 'mongoose';
  
  // Now safely read the environment variable
  const MONGODB_URI = process.env.MONGODB_URI;
  
  // Check if MONGODB_URI exists
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
  
  interface MongooseConnection {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  }
  
  declare global {
    var mongoose: MongooseConnection | undefined;
  }
  
  let cached = global.mongoose;
  
  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }
  
  export async function connectToDatabase(): Promise<mongoose.Connection> {
    if (cached!.conn) {
      return cached!.conn;
    }
  
    if (!cached!.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      };
  
      cached!.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
        console.log('✅ Connected to MongoDB');
        return mongoose.connection;
      });
    }
  
    try {
      cached!.conn = await cached!.promise;
    } catch (e) {
      cached!.promise = null;
      throw e;
    }
  
    return cached!.conn;
  }
  
  export async function disconnectFromDatabase(): Promise<void> {
    if (cached?.conn) {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
      console.log('❌ Disconnected from MongoDB');
    }
  }
  
  // Database health check
  export async function checkDatabaseHealth(): Promise<boolean> {
    try {
      const connection = await connectToDatabase();
      return connection.readyState === 1;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }