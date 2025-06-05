import { Types } from 'mongoose';

// Re-export all types from individual files
export * from './user';
export * from './movie';
export * from './subscription';
export * from './device';
export * from './auth';
export * from './admin';

// Common utility types
export type ID = string | Types.ObjectId;
export type Status = 'active' | 'inactive' | 'pending' | 'blocked';
export type Role = 'admin' | 'subscriber' | 'guest';
export type DeviceType = 'web' | 'mobile' | 'tablet' | 'tv' | 'desktop' | 'other';
export type VideoQuality = 'auto' | '480p' | '720p' | '1080p' | '4k';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trial';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type Interval = 'month' | 'year';
export type Provider = 'google' | 'apple' | 'email';
export type S3Provider = 'aws' | 'digitalocean' | 'vultr' | 'wasabi' | 'other';
export type EmailProvider = 'smtp' | 'sendgrid' | 'mailgun' | 'aws-ses';

// Form types
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Component props types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps extends ComponentProps {
  isLoading: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface ErrorProps extends ComponentProps {
  error: Error | string;
  onRetry?: () => void;
}

// Hook return types
export interface UseApiResult<T = any> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export interface UsePaginationResult<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  isLoading: boolean;
  error: Error | null;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refetch: () => Promise<void>;
}

// Additional utility types
export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ServiceStatus {
  tmdb: boolean;
  stripe: boolean;
  s3: boolean;
  email: boolean;
}

export interface UserSession {
  deviceId: Types.ObjectId;
  deviceName: string;
  deviceType: DeviceType;
  location?: string;
  lastActivity: Date;
  isActive: boolean;
}

export interface PlayerState {
  currentTime: number;
  duration: number;
  paused: boolean;
  volume: number;
  quality: VideoQuality;
  subtitlesEnabled: boolean;
  subtitleLanguage?: string;
}

export interface WatchProgress {
  movieId: Types.ObjectId;
  progress: number; // 0-100
  lastPosition: number; // seconds
  updatedAt: Date;
}