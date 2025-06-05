import { Types } from 'mongoose';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
  requestId?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  timestamp: Date;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: Date;
  requestId?: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface UploadResponse {
  success: boolean;
  url: string;
  key: string;
  bucket: string;
  size: number;
  contentType: string;
  filename: string;
}

export interface FileUploadRequest {
  file: File;
  folder?: string;
  filename?: string;
}

export interface BulkActionRequest {
  ids: Types.ObjectId[];
  action: string;
  data?: Record<string, any>;
}

export interface BulkActionResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{
    id: Types.ObjectId;
    error: string;
  }>;
}

export interface SearchRequest {
  query: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  services: {
    database: 'connected' | 'disconnected';
    storage: 'connected' | 'disconnected';
    stripe: 'connected' | 'disconnected';
    tmdb: 'connected' | 'disconnected';
  };
  version: string;
  uptime: number;
}

export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: {
    name: string;
    value: number;
    change?: number;
    changePercent?: number;
  }[];
  charts: {
    name: string;
    type: 'line' | 'bar' | 'pie' | 'area';
    data: Array<{
      label: string;
      value: number;
      date?: Date;
    }>;
  }[];
}