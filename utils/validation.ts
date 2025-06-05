
import { z } from 'zod';
import { Types } from 'mongoose';

export class ValidationUtils {
  // Common schemas
  static readonly objectIdSchema = z.string().refine(
    (val) => Types.ObjectId.isValid(val),
    { message: 'Invalid ObjectId format' }
  );

  static readonly emailSchema = z.string().email('Invalid email format');
  
  static readonly passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number');

  // User validation schemas
  static readonly createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: this.emailSchema,
    password: this.passwordSchema,
    role: z.enum(['admin', 'subscriber', 'guest']).optional(),
  });

  static readonly updateUserSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    email: this.emailSchema.optional(),
    image: z.string().url().optional(),
    preferences: z.object({
      language: z.string().optional(),
      autoplay: z.boolean().optional(),
      videoQuality: z.enum(['auto', '480p', '720p', '1080p', '4k']).optional(),
      subtitleLanguage: z.string().optional(),
    }).optional(),
  });

  // Movie validation schemas
  static readonly createMovieSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    overview: z.string().min(10, 'Overview must be at least 10 characters').max(2000),
    poster: z.string().url('Invalid poster URL'),
    backdrop: z.string().url('Invalid backdrop URL'),
    videoUrl: z.string().url('Invalid video URL'),
    genres: z.array(this.objectIdSchema).min(1, 'At least one genre required'),
    releaseDate: z.string().or(z.date()),
    duration: z.number().min(1, 'Duration must be positive'),
    language: z.string().min(2).max(10).optional(),
    country: z.string().min(2).max(10).optional(),
    isPremium: z.boolean().optional(),
  });

  static readonly updateMovieSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    overview: z.string().min(10).max(2000).optional(),
    poster: z.string().url().optional(),
    backdrop: z.string().url().optional(),
    trailer: z.string().url().optional(),
    genres: z.array(this.objectIdSchema).optional(),
    director: z.string().max(100).optional(),
    cast: z.array(z.string().max(100)).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isPremium: z.boolean().optional(),
  });

  // Subscription plan validation schemas
  static readonly createPlanSchema = z.object({
    name: z.string().min(2, 'Plan name required').max(50),
    description: z.string().min(10).max(500),
    price: z.number().min(0, 'Price must be positive'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    interval: z.enum(['month', 'year']),
    features: z.array(z.string()).min(1, 'At least one feature required'),
    deviceLimit: z.number().min(1, 'Device limit must be positive').max(999),
    simultaneousStreams: z.number().min(1).max(10),
    videoQuality: z.enum(['HD', 'Full HD', '4K']),
    deviceFeatures: z.object({
      allowMobile: z.boolean(),
      allowTV: z.boolean(),
      allowWeb: z.boolean(),
      allowTablet: z.boolean(),
      allowDesktop: z.boolean(),
      deviceKickEnabled: z.boolean(),
      autoVerifyTrusted: z.boolean(),
    }),
  });

  // Device validation schemas
  static readonly registerDeviceSchema = z.object({
    deviceName: z.string().min(1, 'Device name required').max(100),
    deviceType: z.enum(['web', 'mobile', 'tablet', 'tv', 'desktop', 'other']),
    platform: z.string().min(1).max(50),
    browser: z.string().max(50).optional(),
    osVersion: z.string().max(20).optional(),
    metadata: z.object({
      screenResolution: z.string().optional(),
      colorDepth: z.number().optional(),
      language: z.string().optional(),
      cookiesEnabled: z.boolean().optional(),
      javaEnabled: z.boolean().optional(),
    }).optional(),
  });

  // Settings validation schemas
  static readonly updateSettingsSchema = z.object({
    general: z.object({
      siteName: z.string().min(1).max(100).optional(),
      siteDescription: z.string().max(500).optional(),
      contactEmail: this.emailSchema.optional(),
      supportEmail: this.emailSchema.optional(),
    }).optional(),
    tmdb: z.object({
      apiKey: z.string().min(1).optional(),
      isEnabled: z.boolean().optional(),
    }).optional(),
    stripe: z.object({
      publicKey: z.string().min(1).optional(),
      secretKey: z.string().min(1).optional(),
      webhookSecret: z.string().min(1).optional(),
      isEnabled: z.boolean().optional(),
    }).optional(),
    s3: z.object({
      provider: z.enum(['aws', 'digitalocean', 'vultr', 'wasabi', 'other']).optional(),
      accessKeyId: z.string().min(1).optional(),
      secretAccessKey: z.string().min(1).optional(),
      bucketName: z.string().min(1).optional(),
      region: z.string().min(1).optional(),
      endpoint: z.string().url().optional(),
      isEnabled: z.boolean().optional(),
    }).optional(),
  });

  // File validation
  static validateVideoFile(file: File): boolean {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  static validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  static validateSubtitleFile(file: File): boolean {
    const allowedTypes = ['text/vtt', 'application/x-subrip'];
    const maxSize = 1024 * 1024; // 1MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  // Custom validation helpers
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidIpAddress(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  static sanitizeHtml(html: string): string {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '');
  }
}

// utils/video-processing.ts
export class VideoProcessingUtils {
  // Extract video metadata (would typically use ffprobe in production)
  static async extractVideoMetadata(file: File | Buffer): Promise<{
    duration: number;
    resolution: string;
    format: string;
    codec: string;
    bitrate: number;
    fileSize: number;
  }> {
    // This is a simplified version - in production you'd use ffprobe
    return {
      duration: 7200, // 2 hours in seconds
      resolution: '1920x1080',
      format: 'mp4',
      codec: 'h264',
      bitrate: 5000, // kbps
      fileSize: file instanceof File ? file.size : file.length
    };
  }

  // Generate video thumbnail (would use ffmpeg in production)
  static async generateThumbnail(videoPath: string, timeOffset: number = 30): Promise<Buffer> {
    // This is a placeholder - in production you'd use ffmpeg
    // Return a default thumbnail or generate one using ffmpeg
    throw new Error('Thumbnail generation not implemented - use ffmpeg in production');
  }

  // Convert video formats (would use ffmpeg in production)
  static async convertVideo(
    inputPath: string,
    outputPath: string,
    options: {
      format?: string;
      quality?: string;
      resolution?: string;
    } = {}
  ): Promise<void> {
    // This is a placeholder - in production you'd use ffmpeg
    throw new Error('Video conversion not implemented - use ffmpeg in production');
  }

  // Generate multiple quality versions
  static async generateMultipleQualities(videoPath: string): Promise<{
    '480p': string;
    '720p': string;
    '1080p': string;
  }> {
    // This would generate different quality versions of the video
    throw new Error('Multi-quality generation not implemented - use ffmpeg in production');
  }

  // Extract audio track
  static async extractAudio(videoPath: string, outputPath: string): Promise<void> {
    // Extract audio track from video
    throw new Error('Audio extraction not implemented - use ffmpeg in production');
  }

  // Validate video file
  static async validateVideoFile(file: File): Promise<boolean> {
    try {
      const metadata = await this.extractVideoMetadata(file);
      
      // Check if video meets requirements
      const maxDuration = 4 * 60 * 60; // 4 hours
      const maxFileSize = 2 * 1024 * 1024 * 1024; // 2GB
      
      return metadata.duration <= maxDuration && metadata.fileSize <= maxFileSize;
    } catch (error) {
      return false;
    }
  }

  // Generate HLS playlist (for adaptive streaming)
  static async generateHLSPlaylist(videoPath: string, outputDir: string): Promise<string> {
    // Generate HLS playlist for adaptive streaming
    throw new Error('HLS generation not implemented - use ffmpeg in production');
  }

  // Calculate video hash for duplicate detection
  static async calculateVideoHash(file: Buffer): Promise<string> {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(file).digest('hex');
  }
}