
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  _id: string;
  // General Settings
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  contactEmail: string;
  supportEmail: string;
  
  // TMDB API Settings
  tmdb: {
    apiKey: string;
    isEnabled: boolean;
    lastSync?: Date;
  };
  
  // Stripe Settings
  stripe: {
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
    isEnabled: boolean;
  };
  
  // S3 Storage Settings
  s3: {
    provider: 'aws' | 'digitalocean' | 'vultr' | 'wasabi' | 'other';
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    region: string;
    endpoint?: string;
    forcePathStyle: boolean;
    isEnabled: boolean;
    cdnUrl?: string;
  };
  
  // Email Settings
  email: {
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'aws-ses';
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    apiKey?: string;
    fromEmail: string;
    fromName: string;
    isEnabled: boolean;
  };
  
  // Security Settings
  security: {
    jwtSecret: string;
    sessionTimeout: number; // in minutes
    maxLoginAttempts: number;
    lockoutDuration: number; // in minutes
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
  };
  
  // Device Management Settings
  deviceManagement: {
    globalDeviceLimit: {
      type: Number,
      default: 0 // 0 means use plan limits
    },
    enforceDeviceLimits: {
      type: Boolean,
      default: true
    },
    allowDeviceSharing: {
      type: Boolean,
      default: false
    },
    deviceInactivityDays: {
      type: Number,
      default: 90,
      min: 1
    },
    requireDeviceVerification: {
      type: Boolean,
      default: true
    },
    autoBlockSuspiciousDevices: {
      type: Boolean,
      default: true
    },
    enableGeolocationCheck: {
      type: Boolean,
      default: false
    },
    maxSessionDuration: {
      type: Number,
      default: 24, // 24 hours
      min: 1
    },
    allowSimultaneousStreams: {
      type: Boolean,
      default: true
    },
    kickPreviousSession: {
      type: Boolean,
      default: false
    },
    deviceTrustScoring: {
      type: Boolean,
      default: false
    },
    logDeviceActivity: {
      type: Boolean,
      default: true
    }
  },
  
  // Features Settings
  features: {
    userRegistration: boolean;
    guestAccess: boolean;
    downloadEnabled: boolean;
    offlineViewing: boolean;
    socialLogin: boolean;
    commentsEnabled: boolean;
    ratingsEnabled: boolean;
    watchlistEnabled: boolean;
  };
  
  // Analytics Settings
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    enableTracking: boolean;
  };
  
  // Maintenance Settings
  maintenance: {
    isEnabled: boolean;
    message: string;
    allowedIPs: string[];
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  // General Settings
  siteName: {
    type: String,
    required: true,
    default: 'MovieStream'
  },
  siteDescription: {
    type: String,
    required: true,
    default: 'Your ultimate movie streaming platform'
  },
  siteUrl: {
    type: String,
    required: true,
    default: 'http://localhost:3000'
  },
  logo: {
    type: String,
    default: null
  },
  favicon: {
    type: String,
    default: null
  },
  contactEmail: {
    type: String,
    required: true,
    default: 'contact@moviestream.com'
  },
  supportEmail: {
    type: String,
    required: true,
    default: 'support@moviestream.com'
  },
  
  // TMDB API Settings
  tmdb: {
    apiKey: {
      type: String,
      default: ''
    },
    isEnabled: {
      type: Boolean,
      default: false
    },
    lastSync: {
      type: Date,
      default: null
    }
  },
  
  // Stripe Settings
  stripe: {
    publicKey: {
      type: String,
      default: ''
    },
    secretKey: {
      type: String,
      default: ''
    },
    webhookSecret: {
      type: String,
      default: ''
    },
    isEnabled: {
      type: Boolean,
      default: false
    }
  },
  
  // S3 Storage Settings
  s3: {
    provider: {
      type: String,
      enum: ['aws', 'digitalocean', 'vultr', 'wasabi', 'other'],
      default: 'aws'
    },
    accessKeyId: {
      type: String,
      default: ''
    },
    secretAccessKey: {
      type: String,
      default: ''
    },
    bucketName: {
      type: String,
      default: ''
    },
    region: {
      type: String,
      default: 'us-east-1'
    },
    endpoint: {
      type: String,
      default: null
    },
    forcePathStyle: {
      type: Boolean,
      default: false
    },
    isEnabled: {
      type: Boolean,
      default: false
    },
    cdnUrl: {
      type: String,
      default: null
    }
  },
  
  // Email Settings
  email: {
    provider: {
      type: String,
      enum: ['smtp', 'sendgrid', 'mailgun', 'aws-ses'],
      default: 'smtp'
    },
    host: {
      type: String,
      default: null
    },
    port: {
      type: Number,
      default: 587
    },
    username: {
      type: String,
      default: null
    },
    password: {
      type: String,
      default: null
    },
    apiKey: {
      type: String,
      default: null
    },
    fromEmail: {
      type: String,
      required: true,
      default: 'noreply@moviestream.com'
    },
    fromName: {
      type: String,
      required: true,
      default: 'MovieStream'
    },
    isEnabled: {
      type: Boolean,
      default: false
    }
  },
  
  // Security Settings
  security: {
    jwtSecret: {
      type: String,
      required: true,
      default: 'your-jwt-secret-key'
    },
    sessionTimeout: {
      type: Number,
      default: 1440 // 24 hours
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 30 // 30 minutes
    },
    requireEmailVerification: {
      type: Boolean,
      default: false
    },
    enableTwoFactor: {
      type: Boolean,
      default: false
    }
  },
  
  // Features Settings
  features: {
    userRegistration: {
      type: Boolean,
      default: true
    },
    guestAccess: {
      type: Boolean,
      default: true
    },
    downloadEnabled: {
      type: Boolean,
      default: false
    },
    offlineViewing: {
      type: Boolean,
      default: false
    },
    socialLogin: {
      type: Boolean,
      default: true
    },
    commentsEnabled: {
      type: Boolean,
      default: true
    },
    ratingsEnabled: {
      type: Boolean,
      default: true
    },
    watchlistEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  // Analytics Settings
  analytics: {
    googleAnalyticsId: {
      type: String,
      default: null
    },
    facebookPixelId: {
      type: String,
      default: null
    },
    enableTracking: {
      type: Boolean,
      default: false
    }
  },
  
  // Maintenance Settings
  maintenance: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'Site is under maintenance. Please check back later.'
    },
    allowedIPs: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

export const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);