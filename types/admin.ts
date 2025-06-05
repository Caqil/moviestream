

import { Types } from 'mongoose';

export interface AdminSettings {
  _id: Types.ObjectId;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  contactEmail: string;
  supportEmail: string;
  tmdb: TMDBSettings;
  stripe: StripeSettings;
  s3: S3Settings;
  email: EmailSettings;
  security: SecuritySettings;
  features: FeatureSettings;
  deviceManagement: DeviceManagementSettings;
  analytics: AnalyticsSettings;
  maintenance: MaintenanceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TMDBSettings {
  apiKey: string;
  isEnabled: boolean;
  lastSync?: Date;
}

export interface StripeSettings {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  isEnabled: boolean;
}

export interface S3Settings {
  provider: 'aws' | 'digitalocean' | 'vultr' | 'wasabi' | 'other';
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  endpoint?: string;
  forcePathStyle: boolean;
  isEnabled: boolean;
  cdnUrl?: string;
}

export interface EmailSettings {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'aws-ses';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  isEnabled: boolean;
}

export interface SecuritySettings {
  jwtSecret: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  requireEmailVerification: boolean;
  enableTwoFactor: boolean;
}

export interface FeatureSettings {
  userRegistration: boolean;
  guestAccess: boolean;
  downloadEnabled: boolean;
  offlineViewing: boolean;
  socialLogin: boolean;
  commentsEnabled: boolean;
  ratingsEnabled: boolean;
  watchlistEnabled: boolean;
}

export interface DeviceManagementSettings {
  globalDeviceLimit: number;
  enforceDeviceLimits: boolean;
  allowDeviceSharing: boolean;
  deviceInactivityDays: number;
  requireDeviceVerification: boolean;
  autoBlockSuspiciousDevices: boolean;
  enableGeolocationCheck: boolean;
  maxSessionDuration: number;
  allowSimultaneousStreams: boolean;
  kickPreviousSession: boolean;
  deviceTrustScoring: boolean;
  logDeviceActivity: boolean;
}

export interface AnalyticsSettings {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  enableTracking: boolean;
}

export interface MaintenanceSettings {
  isEnabled: boolean;
  message: string;
  allowedIPs: string[];
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    new: number;
    subscribers: number;
  };
  movies: {
    total: number;
    active: number;
    featured: number;
    premium: number;
  };
  devices: {
    total: number;
    active: number;
    verified: number;
    blocked: number;
  };
  revenue: {
    monthly: number;
    yearly: number;
    growth: number;
  };
  streaming: {
    activeSessions: number;
    totalViews: number;
    averageWatchTime: number;
  };
}

export interface AdminUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: 'admin';
  permissions: string[];
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface UpdateSettingsRequest {
  general?: {
    siteName?: string;
    siteDescription?: string;
    contactEmail?: string;
    supportEmail?: string;
  };
  tmdb?: Partial<TMDBSettings>;
  stripe?: Partial<StripeSettings>;
  s3?: Partial<S3Settings>;
  email?: Partial<EmailSettings>;
  security?: Partial<SecuritySettings>;
  features?: Partial<FeatureSettings>;
  deviceManagement?: Partial<DeviceManagementSettings>;
}
