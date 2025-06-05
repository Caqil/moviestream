
import { z } from 'zod';

// Re-export validation schemas from utils for convenience
export { ValidationUtils } from '@/utils/validation';

// Additional API-specific validations
export const apiValidations = {
  // Pagination
  pagination: z.object({
    page: z.string().transform(val => parseInt(val) || 1),
    limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),

  // Search
  search: z.object({
    query: z.string().min(1).max(100),
    type: z.enum(['movie', 'genre', 'user']).optional(),
    filters: z.record(z.any()).optional(),
  }),

  // File upload
  fileUpload: z.object({
    filename: z.string().min(1),
    contentType: z.string().min(1),
    size: z.number().positive(),
    folder: z.string().optional(),
  }),

  // Device registration
  deviceRegistration: z.object({
    deviceName: z.string().min(1).max(100),
    deviceType: z.enum(['web', 'mobile', 'tablet', 'tv', 'desktop', 'other']),
    platform: z.string().min(1).max(50),
    userAgent: z.string().min(1),
    fingerprint: z.string().optional(),
  }),

  // Session creation
  sessionCreation: z.object({
    deviceId: z.string().min(1),
    movieId: z.string().optional(),
    quality: z.string().optional(),
  }),

  // Subscription checkout
  checkoutSession: z.object({
    planId: z.string().min(1),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
  }),

  // Settings update
  settingsUpdate: z.object({
    section: z.enum(['general', 'tmdb', 'stripe', 's3', 'email', 'security', 'features']),
    data: z.record(z.any()),
  }),
};