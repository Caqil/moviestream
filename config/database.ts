import { ConnectOptions } from 'mongoose';

export interface DatabaseConfig {
  uri: string;
  options: ConnectOptions;
  collections: {
    users: string;
    movies: string;
    genres: string;
    subscriptions: string;
    devices: string;
    sessions: string;
    watchHistory: string;
    subtitles: string;
    settings: string;
  };
  indexes: {
    enabled: boolean;
    background: boolean;
  };
  monitoring: {
    enabled: boolean;
    slowOpThreshold: number;
    logSlowQueries: boolean;
  };
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const databaseConfig: DatabaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/moviestream',
  
  options: {
    // Connection pool settings
    maxPoolSize: isProduction ? 20 : 10,
    minPoolSize: isProduction ? 5 : 2,
    
    // Timeout settings
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    
    // Buffering
    bufferCommands: false,
    
    // Other settings
    family: 4, // Use IPv4
    retryWrites: true,
    writeConcern: {
      w: 'majority',
      j: true,
      wtimeout: 1000,
    },
    readPreference: 'primary',
    
    // Compression
    compressors: ['zstd', 'zlib'],
    
    // Authentication
    authSource: 'admin',
    
    // SSL/TLS
    ssl: isProduction,
  },
  
  collections: {
    users: 'users',
    movies: 'movies',
    genres: 'genres',
    subscriptions: 'subscription_plans',
    devices: 'devices',
    sessions: 'sessions',
    watchHistory: 'watch_history',
    subtitles: 'subtitles',
    settings: 'settings',
  },
  
  indexes: {
    enabled: true,
    background: true,
  },
  
  monitoring: {
    enabled: isProduction,
    slowOpThreshold: 100, // ms
    logSlowQueries: isDevelopment,
  },
};

// Database health check configuration
export const healthCheckConfig = {
  timeout: 5000,
  retries: 3,
  interval: 30000, // Check every 30 seconds
};

// Migration configuration
export const migrationConfig = {
  enabled: true,
  directory: './migrations',
  collectionName: 'migrations',
  lockCollection: 'migration_lock',
};

// Backup configuration
export const backupConfig = {
  enabled: isProduction,
  schedule: '0 2 * * *', // Daily at 2 AM
  retention: {
    daily: 7,
    weekly: 4,
    monthly: 12,
  },
  storage: {
    type: 's3',
    bucket: process.env.BACKUP_BUCKET || 'moviestream-backups',
    prefix: 'database/',
  },
};

