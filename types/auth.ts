// types/auth.ts
import { Types } from 'mongoose';

export interface AuthUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  image?: string;
  role: 'admin' | 'subscriber' | 'guest';
  isActive: boolean;
  watchlist: Types.ObjectId[]; // Add this property
  subscription?: {
    status: 'active' | 'canceled' | 'expired' | 'trial';
    planId: Types.ObjectId;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: {
    deviceName: string;
    deviceType: string;
    platform: string;
    userAgent: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  deviceInfo?: {
    deviceName: string;
    deviceType: string;
    platform: string;
    userAgent: string;
  };
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  deviceId?: Types.ObjectId;
  expiresAt: Date;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  provider: 'google' | 'apple';
  verified: boolean;
}

export interface TwoFactorRequest {
  code: string;
  deviceTrust?: boolean;
}

export interface SessionInfo {
  deviceId: Types.ObjectId;
  deviceName: string;
  deviceType: string;
  location?: string;
  lastActivity: Date;
  isActive: boolean;
}