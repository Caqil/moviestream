
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { UploadResponse, FileUploadRequest, S3Settings } from '@/types';
import { ErrorHandler, AppError } from './error-handling';

export class FileUploadUtils {
  private static s3Client: S3Client | null = null;
  private static settings: S3Settings | null = null;

  static initializeS3(settings: S3Settings): void {
    this.settings = settings;
    
    const config: any = {
      region: settings.region,
      credentials: {
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
      },
    };

    if (settings.endpoint) {
      config.endpoint = settings.endpoint;
      config.forcePathStyle = settings.forcePathStyle;
    }

    this.s3Client = new S3Client(config);
  }

  // File validation
  static validateFile(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): void {
    const {
      maxSize = 100 * 1024 * 1024, // 100MB default
      allowedTypes = [],
      allowedExtensions = []
    } = options;

    if (file.size > maxSize) {
      throw new AppError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`, 400, true, 'FILE_TOO_LARGE');
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new AppError(`File type ${file.type} not allowed`, 400, true, 'INVALID_FILE_TYPE');
    }

    if (allowedExtensions.length > 0) {
      const ext = path.extname(file.name).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        throw new AppError(`File extension ${ext} not allowed`, 400, true, 'INVALID_FILE_EXTENSION');
      }
    }
  }

  // Generate unique filename
  static generateFileName(originalName: string, folder?: string): string {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);
    const fileName = `${name}-${timestamp}-${uuid}${ext}`;
    
    return folder ? `${folder}/${fileName}` : fileName;
  }

  // Upload file to S3
  static async uploadFile(
    file: Buffer | Uint8Array,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<UploadResponse> {
    if (!this.s3Client || !this.settings) {
      throw new AppError('S3 not initialized', 500, true, 'S3_NOT_INITIALIZED');
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.settings.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.s3Client.send(command);

      const url = this.settings.cdnUrl 
        ? `${this.settings.cdnUrl}/${key}`
        : `https://${this.settings.bucketName}.s3.${this.settings.region}.amazonaws.com/${key}`;

      return {
        success: true,
        url,
        key,
        bucket: this.settings.bucketName,
        size: file.length,
        contentType,
        filename: path.basename(key)
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new AppError('Failed to upload file', 500, true, 'UPLOAD_FAILED');
    }
  }

  // Delete file from S3
  static async deleteFile(key: string): Promise<void> {
    if (!this.s3Client || !this.settings) {
      throw new AppError('S3 not initialized', 500, true, 'S3_NOT_INITIALIZED');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.settings.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new AppError('Failed to delete file', 500, true, 'DELETE_FAILED');
    }
  }

  // Generate presigned URL for uploads
  static async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    if (!this.s3Client || !this.settings) {
      throw new AppError('S3 not initialized', 500, true, 'S3_NOT_INITIALIZED');
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.settings.bucketName,
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Presigned URL error:', error);
      throw new AppError('Failed to generate upload URL', 500, true, 'PRESIGNED_URL_FAILED');
    }
  }

  // Upload handlers for different file types
  static async uploadVideo(file: Buffer, originalName: string): Promise<UploadResponse> {
    this.validateFile(new File([file], originalName), {
      maxSize: 2 * 1024 * 1024 * 1024, // 2GB
      allowedExtensions: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
      allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm']
    });

    const key = this.generateFileName(originalName, 'videos');
    return this.uploadFile(file, key, 'video/mp4');
  }

  static async uploadImage(file: Buffer, originalName: string, folder: string = 'images'): Promise<UploadResponse> {
    this.validateFile(new File([file], originalName), {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    const key = this.generateFileName(originalName, folder);
    return this.uploadFile(file, key, 'image/jpeg');
  }

  static async uploadSubtitle(file: Buffer, originalName: string): Promise<UploadResponse> {
    this.validateFile(new File([file], originalName), {
      maxSize: 1024 * 1024, // 1MB
      allowedExtensions: ['.vtt', '.srt'],
      allowedTypes: ['text/vtt', 'application/x-subrip']
    });

    const key = this.generateFileName(originalName, 'subtitles');
    return this.uploadFile(file, key, 'text/vtt');
  }
}

// utils/format.ts
export class FormatUtils {
  // Date formatting
  static formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
    const d = new Date(date);
    
    if (format === 'relative') {
      return this.getRelativeTime(d);
    }
    
    if (format === 'long') {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }

  // Duration formatting
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    }
    
    return `${hours}h ${mins}m`;
  }

  static formatVideoDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // File size formatting
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Currency formatting
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Number formatting
  static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Device type formatting
  static formatDeviceType(type: string): string {
    const types: Record<string, string> = {
      web: 'Web Browser',
      mobile: 'Mobile Device',
      tablet: 'Tablet',
      tv: 'Smart TV',
      desktop: 'Desktop App',
      other: 'Other Device'
    };
    return types[type] || type;
  }

  // Quality badge formatting
  static getQualityBadge(quality: string): { text: string; color: string } {
    const qualities: Record<string, { text: string; color: string }> = {
      'HD': { text: 'HD', color: 'bg-blue-100 text-blue-800' },
      'Full HD': { text: 'FHD', color: 'bg-green-100 text-green-800' },
      '4K': { text: '4K', color: 'bg-purple-100 text-purple-800' },
      'auto': { text: 'AUTO', color: 'bg-gray-100 text-gray-800' }
    };
    return qualities[quality] || { text: quality, color: 'bg-gray-100 text-gray-800' };
  }

  // Subscription status formatting
  static getStatusBadge(status: string): { text: string; color: string } {
    const statuses: Record<string, { text: string; color: string }> = {
      active: { text: 'Active', color: 'bg-green-100 text-green-800' },
      canceled: { text: 'Canceled', color: 'bg-red-100 text-red-800' },
      expired: { text: 'Expired', color: 'bg-gray-100 text-gray-800' },
      trial: { text: 'Trial', color: 'bg-yellow-100 text-yellow-800' },
      pending: { text: 'Pending', color: 'bg-blue-100 text-blue-800' }
    };
    return statuses[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  }

  // Progress formatting
  static formatProgress(progress: number): string {
    return `${Math.round(progress)}%`;
  }

  // URL slug formatting
  static createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  }

  // Text truncation
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
