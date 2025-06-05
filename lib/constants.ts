
export const APP_CONFIG = {
  name: 'MovieStream',
  description: 'Your ultimate movie streaming platform',
  version: '1.0.0',
  url: process.env.APP_URL || 'http://localhost:3000',
  supportEmail: 'support@moviestream.com',
};

export const SUBSCRIPTION_PLANS = {
  BASIC: 'basic',
  STANDARD: 'standard',
  PREMIUM: 'premium',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  SUBSCRIBER: 'subscriber',
  GUEST: 'guest',
} as const;

export const DEVICE_TYPES = {
  WEB: 'web',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  TV: 'tv',
  DESKTOP: 'desktop',
  OTHER: 'other',
} as const;

export const VIDEO_QUALITIES = {
  AUTO: 'auto',
  HD: '720p',
  FULL_HD: '1080p',
  FOUR_K: '4k',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  EXPIRED: 'expired',
  TRIAL: 'trial',
} as const;

export const FILE_LIMITS = {
  VIDEO: {
    MAX_SIZE: 5 * 1024 * 1024 * 1024, // 5GB
    ALLOWED_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
    ALLOWED_EXTENSIONS: ['.mp4', '.mov', '.avi', '.mkv'],
  },
  IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  SUBTITLE: {
    MAX_SIZE: 1024 * 1024, // 1MB
    ALLOWED_TYPES: ['text/vtt', 'application/x-subrip'],
    ALLOWED_EXTENSIONS: ['.vtt', '.srt'],
  },
} as const;

export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_ATTEMPTS: 5,
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 1000,
  },
  UPLOAD: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_UPLOADS: 50,
  },
  STREAMING: {
    WINDOW_MS: 5 * 60 * 1000, // 5 minutes
    MAX_STREAMS: 10,
  },
} as const;

export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  MOVIE: (id: string) => `movie:${id}`,
  GENRE: (id: string) => `genre:${id}`,
  SUBSCRIPTION_PLAN: (id: string) => `plan:${id}`,
  SETTINGS: 'settings',
  POPULAR_MOVIES: 'popular_movies',
  FEATURED_MOVIES: 'featured_movies',
} as const;

export const CACHE_TTL = {
  USER: 60 * 15, // 15 minutes
  MOVIE: 60 * 60, // 1 hour
  SETTINGS: 60 * 60 * 24, // 24 hours
  POPULAR_MOVIES: 60 * 30, // 30 minutes
} as const;
