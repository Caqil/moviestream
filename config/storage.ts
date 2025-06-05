export interface StorageConfig {
  default: 'local' | 's3';
  providers: {
    local: LocalStorageConfig;
    s3: S3StorageConfig;
  };
  upload: UploadConfig;
  cdn: CDNConfig;
  security: StorageSecurityConfig;
}

export interface LocalStorageConfig {
  enabled: boolean;
  path: string;
  maxSize: number;
  permissions: string;
}

export interface S3StorageConfig {
  providers: {
    aws: S3ProviderConfig;
    digitalocean: S3ProviderConfig;
    vultr: S3ProviderConfig;
    wasabi: S3ProviderConfig;
  };
  default: string;
  multipart: {
    enabled: boolean;
    threshold: number;
    partSize: number;
  };
  encryption: {
    enabled: boolean;
    type: 'AES256' | 'aws:kms';
    kmsKeyId?: string;
  };
}

export interface S3ProviderConfig {
  enabled: boolean;
  region: string;
  endpoint?: string;
  forcePathStyle: boolean;
  maxRetries: number;
  timeout: number;
}

export interface UploadConfig {
  maxFileSize: {
    video: number;
    image: number;
    subtitle: number;
    document: number;
  };
  allowedTypes: {
    video: string[];
    image: string[];
    subtitle: string[];
    document: string[];
  };
  virus: {
    scanning: boolean;
    quarantine: boolean;
  };
  processing: {
    video: {
      enabled: boolean;
      formats: string[];
      qualities: string[];
      thumbnails: boolean;
    };
    image: {
      enabled: boolean;
      optimization: boolean;
      formats: string[];
      sizes: number[];
    };
  };
}

export interface CDNConfig {
  enabled: boolean;
  provider: 'cloudflare' | 'aws' | 'custom';
  baseUrl: string;
  purging: {
    enabled: boolean;
    apiKey?: string;
    zoneId?: string;
  };
  caching: {
    ttl: {
      images: number;
      videos: number;
      subtitles: number;
    };
    headers: Record<string, string>;
  };
}

export interface StorageSecurityConfig {
  encryption: {
    atRest: boolean;
    inTransit: boolean;
    algorithm: string;
  };
  access: {
    presignedUrls: boolean;
    urlExpiration: number;
    ipRestrictions: string[];
  };
  monitoring: {
    accessLogs: boolean;
    anomalyDetection: boolean;
    alerts: boolean;
  };
}

const isProduction = process.env.NODE_ENV === 'production';

export const storageConfig: StorageConfig = {
  default: process.env.STORAGE_PROVIDER as 'local' | 's3' || 's3',
  
  providers: {
    local: {
      enabled: !isProduction,
      path: process.env.LOCAL_STORAGE_PATH || './uploads',
      maxSize: 100 * 1024 * 1024 * 1024, // 100GB
      permissions: '755',
    },
    
    s3: {
      providers: {
        aws: {
          enabled: true,
          region: 'us-east-1',
          forcePathStyle: false,
          maxRetries: 3,
          timeout: 30000,
        },
        digitalocean: {
          enabled: true,
          region: 'nyc3',
          endpoint: 'https://nyc3.digitaloceanspaces.com',
          forcePathStyle: false,
          maxRetries: 3,
          timeout: 30000,
        },
        vultr: {
          enabled: true,
          region: 'ewr1',
          endpoint: 'https://ewr1.vultrobjects.com',
          forcePathStyle: false,
          maxRetries: 3,
          timeout: 30000,
        },
        wasabi: {
          enabled: true,
          region: 'us-east-1',
          endpoint: 'https://s3.wasabisys.com',
          forcePathStyle: true,
          maxRetries: 3,
          timeout: 30000,
        },
      },
      default: 'aws',
      multipart: {
        enabled: true,
        threshold: 100 * 1024 * 1024, // 100MB
        partSize: 10 * 1024 * 1024, // 10MB
      },
      encryption: {
        enabled: isProduction,
        type: 'AES256',
      },
    },
  },
  
  upload: {
    maxFileSize: {
      video: 5 * 1024 * 1024 * 1024, // 5GB
      image: 50 * 1024 * 1024, // 50MB
      subtitle: 5 * 1024 * 1024, // 5MB
      document: 100 * 1024 * 1024, // 100MB
    },
    
    allowedTypes: {
      video: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska',
        'video/webm',
      ],
      image: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/gif',
      ],
      subtitle: [
        'text/vtt',
        'application/x-subrip',
        'text/plain',
      ],
      document: [
        'application/pdf',
        'text/plain',
        'application/json',
      ],
    },
    
    virus: {
      scanning: isProduction,
      quarantine: isProduction,
    },
    
    processing: {
      video: {
        enabled: true,
        formats: ['mp4', 'webm'],
        qualities: ['480p', '720p', '1080p', '4k'],
        thumbnails: true,
      },
      image: {
        enabled: true,
        optimization: true,
        formats: ['webp', 'avif', 'jpeg'],
        sizes: [150, 300, 600, 1200, 1920],
      },
    },
  },
  
  cdn: {
    enabled: isProduction,
    provider: 'cloudflare',
    baseUrl: process.env.CDN_BASE_URL || '',
    purging: {
      enabled: isProduction,
      apiKey: process.env.CLOUDFLARE_API_KEY,
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
    },
    caching: {
      ttl: {
        images: 31536000, // 1 year
        videos: 31536000, // 1 year
        subtitles: 86400, // 1 day
      },
      headers: {
        'Cache-Control': 'public, max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  },
  
  security: {
    encryption: {
      atRest: isProduction,
      inTransit: true,
      algorithm: 'AES-256-GCM',
    },
    access: {
      presignedUrls: true,
      urlExpiration: 3600, // 1 hour
      ipRestrictions: [],
    },
    monitoring: {
      accessLogs: isProduction,
      anomalyDetection: isProduction,
      alerts: isProduction,
    },
  },
};
