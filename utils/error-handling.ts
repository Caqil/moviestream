import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ErrorHandler {
  /**
   * Custom application error class
   */
  static AppError = class extends Error {
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
  };

  /**
   * Create standardized error response
   */
  static createErrorResponse(error: any): NextResponse {
    let statusCode = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = undefined;

    // Handle custom AppError
    if (error instanceof this.AppError) {
      statusCode = error.statusCode;
      message = error.message;
      code = error.code || 'APP_ERROR';
      details = error.details;
    }
    // Handle Zod validation errors
    else if (error instanceof ZodError) {
      statusCode = 400;
      message = 'Validation failed';
      code = 'VALIDATION_ERROR';
      details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
    }
    // Handle MongoDB duplicate key errors
    else if (error.code === 11000) {
      statusCode = 409;
      message = 'Resource already exists';
      code = 'DUPLICATE_ERROR';
      const field = Object.keys(error.keyPattern || {})[0];
      details = { field, value: error.keyValue?.[field] };
    }
    // Handle MongoDB cast errors
    else if (error.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
      code = 'INVALID_ID';
      details = { field: error.path, value: error.value };
    }
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
      code = 'INVALID_TOKEN';
    }
    else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
      code = 'TOKEN_EXPIRED';
    }
    // Handle generic errors
    else if (error instanceof Error) {
      message = error.message;
      // Don't expose internal error details in production
      if (process.env.NODE_ENV === 'development') {
        details = { stack: error.stack };
      }
    }

    const response = {
      success: false,
      error: message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    };

    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Common error factory methods
   */
  static badRequest(message: string = 'Bad request', details?: any) {
    return new this.AppError(message, 400, true, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized', details?: any) {
    return new this.AppError(message, 401, true, 'UNAUTHORIZED', details);
  }

  static forbidden(message: string = 'Forbidden', details?: any) {
    return new this.AppError(message, 403, true, 'FORBIDDEN', details);
  }

  static notFound(resource: string = 'Resource') {
    return new this.AppError(`${resource} not found`, 404, true, 'NOT_FOUND');
  }

  static conflict(message: string = 'Conflict', details?: any) {
    return new this.AppError(message, 409, true, 'CONFLICT', details);
  }

  static validationError(message: string = 'Validation failed', details?: any) {
    return new this.AppError(message, 422, true, 'VALIDATION_ERROR', details);
  }

  static tooManyRequests(message: string = 'Too many requests') {
    return new this.AppError(message, 429, true, 'RATE_LIMIT_EXCEEDED');
  }

  static internalError(message: string = 'Internal server error', details?: any) {
    return new this.AppError(message, 500, false, 'INTERNAL_ERROR', details);
  }

  static serviceUnavailable(message: string = 'Service unavailable') {
    return new this.AppError(message, 503, true, 'SERVICE_UNAVAILABLE');
  }

  /**
   * Business logic specific errors
   */
  static subscriptionRequired() {
    return new this.AppError(
      'Active subscription required to access this content',
      402,
      true,
      'SUBSCRIPTION_REQUIRED'
    );
  }

  static deviceLimitExceeded() {
    return new this.AppError(
      'Device limit exceeded for your subscription plan',
      403,
      true,
      'DEVICE_LIMIT_EXCEEDED'
    );
  }

  static sessionLimitExceeded() {
    return new this.AppError(
      'Maximum concurrent streams reached for your subscription',
      403,
      true,
      'SESSION_LIMIT_EXCEEDED'
    );
  }

  static deviceBlocked() {
    return new this.AppError(
      'This device has been blocked',
      403,
      true,
      'DEVICE_BLOCKED'
    );
  }

  static deviceNotVerified() {
    return new this.AppError(
      'Device verification required',
      403,
      true,
      'DEVICE_NOT_VERIFIED'
    );
  }

  static contentNotAvailable() {
    return new this.AppError(
      'Content is not available in your region',
      451,
      true,
      'CONTENT_NOT_AVAILABLE'
    );
  }

  static paymentRequired() {
    return new this.AppError(
      'Payment is required to access this content',
      402,
      true,
      'PAYMENT_REQUIRED'
    );
  }

  /**
   * Validation error helpers
   */
  static invalidCredentials() {
    return new this.AppError(
      'Invalid email or password',
      401,
      true,
      'INVALID_CREDENTIALS'
    );
  }

  static emailAlreadyExists() {
    return new this.AppError(
      'An account with this email already exists',
      409,
      true,
      'EMAIL_EXISTS'
    );
  }

  static invalidToken() {
    return new this.AppError(
      'Invalid or expired token',
      401,
      true,
      'INVALID_TOKEN'
    );
  }

  static accountDeactivated() {
    return new this.AppError(
      'Account has been deactivated',
      403,
      true,
      'ACCOUNT_DEACTIVATED'
    );
  }

  static passwordTooWeak() {
    return new this.AppError(
      'Password does not meet security requirements',
      400,
      true,
      'PASSWORD_TOO_WEAK'
    );
  }

  /**
   * File upload errors
   */
  static fileTooLarge(maxSize: string) {
    return new this.AppError(
      `File size exceeds maximum allowed size of ${maxSize}`,
      413,
      true,
      'FILE_TOO_LARGE'
    );
  }

  static invalidFileType(allowedTypes: string[]) {
    return new this.AppError(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      400,
      true,
      'INVALID_FILE_TYPE'
    );
  }

  static uploadFailed() {
    return new this.AppError(
      'File upload failed',
      500,
      true,
      'UPLOAD_FAILED'
    );
  }

  /**
   * External service errors
   */
  static tmdbError() {
    return new this.AppError(
      'Failed to fetch data from TMDB',
      503,
      true,
      'TMDB_ERROR'
    );
  }

  static stripeError(message: string = 'Payment processing failed') {
    return new this.AppError(
      message,
      402,
      true,
      'STRIPE_ERROR'
    );
  }

  static s3Error() {
    return new this.AppError(
      'File storage service error',
      503,
      true,
      'S3_ERROR'
    );
  }

  static emailServiceError() {
    return new this.AppError(
      'Email service is unavailable',
      503,
      true,
      'EMAIL_SERVICE_ERROR'
    );
  }

  /**
   * Database errors
   */
  static databaseError() {
    return new this.AppError(
      'Database operation failed',
      503,
      false,
      'DATABASE_ERROR'
    );
  }

  static connectionError() {
    return new this.AppError(
      'Database connection failed',
      503,
      false,
      'CONNECTION_ERROR'
    );
  }

  /**
   * Log error for monitoring
   */
  static logError(error: any, context?: any) {
    // In production, you might want to use a proper logging service
    // like Winston, Pino, or send to external services like Sentry
    
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      code: error.code,
      timestamp: new Date().toISOString(),
      context,
    };

    if (process.env.NODE_ENV === 'production') {
      // Only log operational errors in production
      if (error.isOperational !== false) {
        console.error('Application Error:', errorInfo);
      }
    } else {
      // Log all errors in development
      console.error('Error Details:', errorInfo);
    }

    // TODO: Send to external monitoring service
    // Example: Sentry.captureException(error, { extra: context });
  }

  /**
   * Handle async errors in route handlers
   */
  static asyncHandler(fn: Function) {
    return async (req: any, res: any, next?: any) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        this.logError(error, { url: req.url, method: req.method });
        return this.createErrorResponse(error);
      }
    };
  }

  /**
   * Validate required environment variables
   */
  static validateEnvironment(requiredVars: string[]) {
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new this.AppError(
        `Missing required environment variables: ${missingVars.join(', ')}`,
        500,
        false,
        'MISSING_ENV_VARS'
      );
    }
  }

  /**
   * Create user-friendly error message
   */
  static getUserFriendlyMessage(error: any): string {
    const userFriendlyMessages: Record<string, string> = {
      'INVALID_CREDENTIALS': 'Please check your email and password and try again.',
      'EMAIL_EXISTS': 'An account with this email already exists. Please sign in instead.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'SUBSCRIPTION_REQUIRED': 'This feature requires an active subscription. Please upgrade your plan.',
      'DEVICE_LIMIT_EXCEEDED': 'You\'ve reached the maximum number of devices for your plan.',
      'SESSION_LIMIT_EXCEEDED': 'You\'ve reached the maximum number of concurrent streams.',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
      'FILE_TOO_LARGE': 'The file you\'re trying to upload is too large.',
      'INVALID_FILE_TYPE': 'Please select a valid file type.',
    };

    const code = error.code || 'UNKNOWN_ERROR';
    return userFriendlyMessages[code] || error.message || 'Something went wrong. Please try again.';
  }
}