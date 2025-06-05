
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiResponse, ErrorResponse, ValidationError } from '@/types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorHandler {
  static AppError: any;
  static handleError(error: Error | AppError): ErrorResponse {
    console.error('Error:', error);

    if (error instanceof AppError) {
      return {
        success: false,
        error: error.code || 'APP_ERROR',
        message: error.message,
        statusCode: error.statusCode,
        timestamp: new Date(),
        details: error.details
      };
    }

    if (error instanceof ZodError) {
      const validationErrors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));

      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        statusCode: 400,
        timestamp: new Date(),
        details: { validationErrors }
      };
    }

    // MongoDB errors
    if (error.name === 'ValidationError') {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Database validation failed',
        statusCode: 400,
        timestamp: new Date(),
        details: { errorMessage: error.message, errorDetails: error }
      };
    }

    if (error.name === 'CastError') {
      return {
        success: false,
        error: 'INVALID_ID',
        message: 'Invalid ID format',
        statusCode: 400,
        timestamp: new Date()
      };
    }

    if (error.message.includes('duplicate key')) {
      return {
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: 'Resource already exists',
        statusCode: 409,
        timestamp: new Date()
      };
    }

    // Default error
    return {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date(),
      details: { errorMessage: error.message, errorDetails: error }
    };
  }

  static createResponse<T>(data?: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date(),
      requestId: crypto.randomUUID()
    };
  }

  static createErrorResponse(error: Error | AppError): NextResponse {
    const errorResponse = this.handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }

  static createSuccessResponse<T>(data?: T, message?: string, status: number = 200): NextResponse {
    const response = this.createResponse(data, message);
    return NextResponse.json(response, { status });
  }

  // Common error creators
  static notFound(resource: string = 'Resource'): AppError {
    return new AppError(`${resource} not found`, 404, true, 'NOT_FOUND');
  }

  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(message, 401, true, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(message, 403, true, 'FORBIDDEN');
  }

  static badRequest(message: string = 'Bad request'): AppError {
    return new AppError(message, 400, true, 'BAD_REQUEST');
  }

  static deviceLimitExceeded(): AppError {
    return new AppError('Device limit exceeded for this subscription plan', 429, true, 'DEVICE_LIMIT_EXCEEDED');
  }

  static sessionLimitExceeded(): AppError {
    return new AppError('Maximum simultaneous streams exceeded', 429, true, 'SESSION_LIMIT_EXCEEDED');
  }

  static deviceBlocked(): AppError {
    return new AppError('This device has been blocked', 403, true, 'DEVICE_BLOCKED');
  }

  static subscriptionRequired(): AppError {
    return new AppError('Active subscription required to access this content', 402, true, 'SUBSCRIPTION_REQUIRED');
  }
}
