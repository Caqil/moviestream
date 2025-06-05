// config/api.ts
import { databaseConfig } from './database';
import { storageConfig } from './storage';
import { authConfig } from './auth';

export interface APIConfig {
  version: string;
  baseUrl: string;
  timeout: number;
  rateLimit: RateLimitConfig;
  cors: CORSConfig;
  validation: ValidationConfig;
  caching: CachingConfig;
  monitoring: MonitoringConfig;
  security: APISecurityConfig;
  external: ExternalAPIConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  global: {
    windowMs: number;
    max: number;
  };
  endpoints: {
    auth: { windowMs: number; max: number };
    upload: { windowMs: number; max: number };
    streaming: { windowMs: number; max: number };
    search: { windowMs: number; max: number };
  };
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

export interface CORSConfig {
  enabled: boolean;
  origins: string[];
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

export interface ValidationConfig {
  enabled: boolean;
  strict: boolean;
  removeAdditional: boolean;
  coerceTypes: boolean;
  formats: Record<string, RegExp>;
}

export interface CachingConfig {
  enabled: boolean;
  defaultTTL: number;
  endpoints: Record<string, number>;
  invalidation: {
    patterns: string[];
    webhooks: string[];
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: {
    responseTime: boolean;
    throughput: boolean;
    errorRate: boolean;
    uptime: boolean;
  };
  logging: {
    level: string;
    format: string;
    destinations: string[];
  };
  alerting: {
    enabled: boolean;
    thresholds: {
      responseTime: number;
      errorRate: number;
      uptime: number;
    };
  };
}

export interface APISecurityConfig {
  helmet: {
    enabled: boolean;
    options: Record<string, any>;
  };
  apiKeys: {
    enabled: boolean;
    header: string;
    validation: RegExp;
  };
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyRotation: number;
  };
}

export interface ExternalAPIConfig {
  tmdb: {
    baseUrl: string;
    version: string;
    timeout: number;
    rateLimit: number;
    retries: number;
  };
  stripe: {
    apiVersion: string;
    timeout: number;
    retries: number;
    webhookTolerance: number;
  };
  email: {
    timeout: number;
    retries: number;
    batchSize: number;
  };
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const apiConfig: APIConfig = {
  version: '1.0.0',
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
  
  rateLimit: {
    enabled: true,
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isProduction ? 1000 : 10000,
    },
    endpoints: {
      auth: { windowMs: 15 * 60 * 1000, max: 5 },
      upload: { windowMs: 60 * 60 * 1000, max: 50 },
      streaming: { windowMs: 5 * 60 * 1000, max: 10 },
      search: { windowMs: 60 * 1000, max: 100 },
    },
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  
  cors: {
    enabled: true,
    origins: isProduction 
      ? [process.env.FRONTEND_URL || 'https://moviestream.com']
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Device-ID',
      'X-Session-Token',
      'X-API-Key',
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  },
  
  validation: {
    enabled: true,
    strict: isProduction,
    removeAdditional: true,
    coerceTypes: true,
    formats: {
      objectId: /^[0-9a-fA-F]{24}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\/.+/,
    },
  },
  
  caching: {
    enabled: true,
    defaultTTL: 300, // 5 minutes
    endpoints: {
      '/api/movies': 600, // 10 minutes
      '/api/genres': 3600, // 1 hour
      '/api/settings': 1800, // 30 minutes
    },
    invalidation: {
      patterns: ['/api/movies/*', '/api/genres/*'],
      webhooks: ['/api/webhooks/cache-invalidation'],
    },
  },
  
  monitoring: {
    enabled: isProduction,
    metrics: {
      responseTime: true,
      throughput: true,
      errorRate: true,
      uptime: true,
    },
    logging: {
      level: isDevelopment ? 'debug' : 'info',
      format: 'json',
      destinations: ['console', 'file'],
    },
    alerting: {
      enabled: isProduction,
      thresholds: {
        responseTime: 2000, // 2 seconds
        errorRate: 0.05, // 5%
        uptime: 0.99, // 99%
      },
    },
  },
  
  security: {
    helmet: {
      enabled: isProduction,
      options: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            mediaSrc: ["'self'", 'https:'],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      },
    },
    apiKeys: {
      enabled: isProduction,
      header: 'X-API-Key',
      validation: /^mk_[a-zA-Z0-9]{32}$/,
    },
    encryption: {
      enabled: isProduction,
      algorithm: 'aes-256-gcm',
      keyRotation: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  },
  
  external: {
    tmdb: {
      baseUrl: 'https://api.themoviedb.org/3',
      version: '3',
      timeout: 10000,
      rateLimit: 40, // requests per 10 seconds
      retries: 3,
    },
    stripe: {
      apiVersion: '2023-10-16',
      timeout: 15000,
      retries: 3,
      webhookTolerance: 300, // 5 minutes
    },
    email: {
      timeout: 10000,
      retries: 3,
      batchSize: 100,
    },
  },
};

// Export environment-specific configurations
export const getConfig = () => {
  return {
    database: databaseConfig,
    storage: storageConfig,
    auth: authConfig,
    api: apiConfig,
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
  };
};

// Configuration validation
export const validateConfig = () => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  const conditionalEnvVars = [
    { condition: authConfig.providers.google.enabled, vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] },
    { condition: authConfig.providers.apple.enabled, vars: ['APPLE_CLIENT_ID', 'APPLE_CLIENT_SECRET'] },
    { condition: storageConfig.default === 's3', vars: ['S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME'] },
  ];

  const missing: string[] = [];

  // Check required variables
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  // Check conditional variables
  conditionalEnvVars.forEach(({ condition, vars }) => {
    if (condition) {
      vars.forEach(envVar => {
        if (!process.env[envVar]) {
          missing.push(envVar);
        }
      });
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
};