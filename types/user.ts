import { Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  email: string;
  name: string;
  image?: string;
  password?: string;
  role: 'admin' | 'subscriber' | 'guest';
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  preferences: UserPreferences;
  subscription?: UserSubscription;
  watchlist: Types.ObjectId[];
  devices: Types.ObjectId[];
  activeSessions: number;
  deviceSettings: UserDeviceSettings;
  profile: UserProfile;
}

export interface UserPreferences {
  language: string;
  autoplay: boolean;
  videoQuality: 'auto' | '480p' | '720p' | '1080p' | '4k';
  subtitleLanguage?: string;
}

export interface UserSubscription {
  planId: Types.ObjectId;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserDeviceSettings {
  autoApproveNewDevices: boolean;
  maxDeviceInactivityDays: number;
  requireDeviceVerification: boolean;
  allowDeviceSharing: boolean;
}

export interface UserProfile {
  avatar?: string;
  bio?: string;
  country?: string;
  dateOfBirth?: Date;
  phone?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password?: string;
  role?: 'admin' | 'subscriber' | 'guest';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  image?: string;
  preferences?: Partial<UserPreferences>;
  profile?: Partial<UserProfile>;
  deviceSettings?: Partial<UserDeviceSettings>;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  subscriberUsers: number;
  guestUsers: number;
  newUsersThisMonth: number;
  averageSessionDuration: number;
}