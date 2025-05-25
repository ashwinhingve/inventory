import mongoose from 'mongoose';
import { CachedConnection } from './mongodb';

// Define types for mock database
export interface MockUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockStore {
  _id: string;
  name: string;
  location: string;
  manager: string;
  contact: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockDatabase {
  users: MockUser[];
  stores: MockStore[];
}

interface MockModel<T> {
  findOne: (query: Record<string, unknown>) => Promise<T & { 
    select: () => T;
    toObject: () => T; 
    toJSON: () => T; 
  } | null>;
  find: () => Promise<T[]>;
  create: (data: Partial<T>) => Promise<T>;
}

export interface MockConnection {
  models: {
    User: MockModel<MockUser>;
    Store: MockModel<MockStore>;
  };
  mockDB?: MockDatabase;
  mockConn?: boolean;
  db: MockDatabase;
  close: () => Promise<void>;
}

// Define return type for dbConnect function
type DatabaseConnection = typeof mongoose | MockConnection;

declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;
const MOCK_DB = process.env.MOCK_DB === 'true' || process.env.NODE_ENV === 'development';

// Create an in-memory mock database as a fallback
const mockDB: MockDatabase = {
  users: [
    {
      _id: 'admin-user-id',
      name: 'Admin User',
      email: 'admin@example.com',
      // This is "password" hashed with bcrypt
      password: '$2a$10$GQF5K2hLy/BUX2yg5BZHi.4xtR3ZxC1NhwJK4Kl3qpQh6InQkJ9CS',
      role: 'store_admin',
      isActive: true,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'sales-user-id',
      name: 'Sales User',
      email: 'sales@example.com',
      // This is "password" hashed with bcrypt
      password: '$2a$10$GQF5K2hLy/BUX2yg5BZHi.4xtR3ZxC1NhwJK4Kl3qpQh6InQkJ9CS',
      role: 'sales_operator',
      isActive: true,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  stores: [
    {
      _id: 'default-store-id',
      name: 'Pro Store',
      location: 'Main Branch',
      manager: 'Admin User',
      contact: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, mockDB, mockConn: null };
}

interface ConnectionOptions {
  uri: string;
  options?: mongoose.ConnectOptions;
}

interface ConnectionState {
  isConnected: boolean;
  error?: Error;
}

let connectionState: ConnectionState = {
  isConnected: false
};

export async function connectToDatabase(uri?: string): Promise<void> {
  if (connectionState.isConnected) {
    return;
  }

  try {
    const options: ConnectionOptions = {
      uri: uri || process.env.MONGODB_URI || '',
      options: {
        // Remove deprecated options
      }
    };

    await mongoose.connect(options.uri, options.options);
    connectionState.isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    connectionState.error = error instanceof Error ? error : new Error('Unknown error occurred');
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export function getConnectionState(): ConnectionState {
  return connectionState;
}

export function resetConnectionState(): void {
  connectionState = {
    isConnected: false
  };
}

/**
 * Database connection function 
 * Returns a mongoose instance or a mock DB in development
 */
async function dbConnect(): Promise<DatabaseConnection> {
  // Ensure cached is defined
  let cached = globalThis.mongoose as CachedConnection | undefined;
  if (!cached) {
    globalThis.mongoose = { conn: null, promise: null };
    cached = globalThis.mongoose as CachedConnection;
  }

  // If MongoDB URI is not set and we're in development, use mock DB
  if ((!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/inventory-management') && MOCK_DB) {
    console.log('Using mock database for development');
    
    // If we already have the mock connection, return it
    if (cached.mockConn) {
      return cached.mockConn;
    }
    
    // Set up a mock "connection" that provides similar interfaces
    const mockConn: MockConnection = {
      models: {
        User: {
          findOne: async (query: Record<string, unknown>) => {
            console.log('Mock DB: Finding user with query:', query);
            const user = cached.mockDB!.users.find((u: MockUser) => 
              (query.email && u.email === query.email) || 
              (query._id && u._id === query._id)
            );
            if (!user) return null;
            // Create a mongoose-like document
            return {
              ...user,
              select: () => user,
              toObject: () => user,
              toJSON: () => user,
            };
          },
          find: async () => cached.mockDB!.users,
          create: async (data: Partial<MockUser>) => {
            const newUser = {
              _id: `user-${Date.now()}`,
              name: data.name || 'New User',
              email: data.email || 'user@example.com',
              password: data.password || '',
              role: data.role || 'user',
              isActive: data.isActive !== undefined ? data.isActive : true,
              lastActive: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            cached.mockDB!.users.push(newUser);
            return newUser;
          }
        },
        Store: {
          findOne: async (query: Record<string, unknown>) => {
            const store = cached.mockDB!.stores.find((s: MockStore) => 
              (query.name && s.name === query.name) || 
              (query._id && s._id === query._id)
            );
            if (!store) return null;
            return {
              ...store,
              select: () => store,
              toObject: () => store,
              toJSON: () => store,
            };
          },
          find: async () => cached.mockDB!.stores,
          create: async (data: Partial<MockStore>) => {
            const newStore = {
              _id: `store-${Date.now()}`,
              name: data.name || 'New Store',
              location: data.location || '',
              manager: data.manager || '',
              contact: data.contact || '',
              isActive: data.isActive !== undefined ? data.isActive : true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            cached.mockDB!.stores.push(newStore);
            return newStore;
          }
        }
      },
      mockDB: cached.mockDB!,
      mockConn: true,
      db: cached.mockDB!,
      close: async () => {
        // Implementation of close function
      }
    };
    
    cached.mockConn = mockConn;
    return mockConn;
  }

  // Use real MongoDB connection
  if (cached.conn) {
    if (cached.conn === null) {
      throw new Error('Database connection is null.');
    }
    return cached.conn as DatabaseConnection;
  }

  // Clear the promise if it's been more than 5 minutes since the last attempt
  if (cached.lastAttempt && Date.now() - cached.lastAttempt > 5 * 60 * 1000) {
    console.log('Clearing stale connection promise');
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      connectTimeoutMS: 10000, // Connection timeout
      socketTimeoutMS: 45000, // Socket timeout
    };

    // Save the attempt timestamp
    cached.lastAttempt = Date.now();

    try {
      console.log(`Connecting to MongoDB at: ${MONGODB_URI!.replace(/:([^:@]+)@/, ':****@')}`);
      
      cached.promise = mongoose.connect(MONGODB_URI!, opts)
        .then((mongoose) => {
          console.log('Connected to MongoDB successfully');
          return mongoose;
        })
        .catch((error) => {
          console.error('Error connecting to MongoDB:', error);
          // If in development, fall back to mock DB
          if (MOCK_DB) {
            console.log('Falling back to mock database');
            cached.promise = null;
            return dbConnect(); // Recursively call to use mock DB
          }
          // Clear the promise so next attempt can try again
          cached.promise = null;
          throw error;
        });
    } catch (initError) {
      console.error('Failed to initialize MongoDB connection:', initError);
      cached.promise = null;
      throw initError;
    }
  }

  try {
    cached.conn = await cached.promise;
    if (!cached.conn) {
      throw new Error('Failed to establish a database connection.');
    }
    return cached.conn as DatabaseConnection;
  } catch (e) {
    console.error('Error awaiting MongoDB connection:', e);
    cached.promise = null;
    throw e;
  }
}

export default dbConnect; 