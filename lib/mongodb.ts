import mongoose from 'mongoose';
import { MockDatabase, MockConnection } from './dbConnect';

export type DatabaseConnection = typeof mongoose | MockConnection;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable in .env.local'
  );
}

export interface CachedConnection {
  conn: typeof mongoose | MockConnection | null;
  promise: Promise<DatabaseConnection> | null;
  mockDB?: MockDatabase;
  mockConn?: MockConnection | null;
  lastAttempt?: number;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
const cached: CachedConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function disconnectFromDatabase() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('Disconnected from MongoDB');
  }
}

// Simplified connection function for API routes
export async function connectToDB() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

// Default export for backwards compatibility 
export default connectToDB; 