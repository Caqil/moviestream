import { Types } from 'mongoose';

export interface Device {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  deviceName: string;
  deviceType: 'web' | 'mobile' | 'tablet' | 'tv' | 'desktop' | 'other';
  deviceId: string;
  platform: string;
  browser?: string;
  osVersion?: string;
  ipAddress: string;
  userAgent: string;
  isVerified: boolean;
  isTrusted: boolean;
  isBlocked: boolean;
  lastUsed: Date;
  registeredAt: Date;
  location?: DeviceLocation;
  metadata: DeviceMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceLocation {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
}

export interface DeviceMetadata {
  screenResolution?: string;
  colorDepth?: number;
  language?: string;
  cookiesEnabled?: boolean;
  javaEnabled?: boolean;
}

export interface Session {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  deviceId: Types.ObjectId;
  sessionToken: string;
  movieId?: Types.ObjectId;
  isActive: boolean;
  startTime: Date;
  lastActivity: Date;
  endTime?: Date;
  ipAddress: string;
  userAgent: string;
  location?: SessionLocation;
  streamingData?: StreamingData;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionLocation {
  country?: string;
  city?: string;
  region?: string;
}

export interface StreamingData {
  quality: string;
  bitrate: number;
  bufferHealth: number;
  errors: number;
  startupTime: number;
}

export interface WatchHistory {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  deviceId: Types.ObjectId;
  sessionId: Types.ObjectId;
  watchedAt: Date;
  progress: number;
  duration: number;
  watchTime: number;
  completed: boolean;
  lastPosition: number;
  device: string;
  ipAddress?: string;
  userAgent?: string;
  quality: string;
  subtitleLanguage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDeviceRequest {
  deviceName: string;
  deviceType: 'web' | 'mobile' | 'tablet' | 'tv' | 'desktop' | 'other';
  platform: string;
  browser?: string;
  osVersion?: string;
  metadata?: Partial<DeviceMetadata>;
}

export interface DeviceVerificationRequest {
  deviceId: string;
  verificationCode: string;
}

export interface CreateSessionRequest {
  deviceId: Types.ObjectId;
  movieId?: Types.ObjectId;
}

export interface UpdateSessionRequest {
  movieId?: Types.ObjectId;
  streamingData?: Partial<StreamingData>;
  lastActivity?: Date;
}

export interface DeviceStats {
  totalDevices: number;
  activeDevices: number;
  verifiedDevices: number;
  blockedDevices: number;
  devicesByType: Record<string, number>;
  devicesByPlatform: Record<string, number>;
  averageDevicesPerUser: number;
}