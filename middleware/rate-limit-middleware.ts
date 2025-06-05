
import { NextRequest } from 'next/server';
import { ErrorHandler } from '@/utils/error-handling';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimitMiddleware {
  private static store: RateLimitStore = {};
  private static cleanupInterval: NodeJS.Timeout | null = null;

  // Initialize cleanup interval
  static init(): void {
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 60000); // Cleanup every minute
    }
  }

  // Basic rate limiting
  static rateLimit(options: {
    windowMs: number; // Time window in milliseconds
    max: number; // Maximum requests per window
    keyGenerator?: (request: NextRequest) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  }) {
    return (handler: Function) => {
      return async (request: NextRequest, context: any) => {
        this.init();

        const {
          windowMs = 15 * 60 * 1000, // 15 minutes
          max = 100,
          keyGenerator = (req) => this.getClientIdentifier(req),
          skipSuccessfulRequests = false,
          skipFailedRequests = false
        } = options;

        const key = keyGenerator(request);
        const now = Date.now();
        const resetTime = now + windowMs;

        // Get or create rate limit entry
        let entry = this.store[key];
        if (!entry || now > entry.resetTime) {
          entry = { count: 0, resetTime };
          this.store[key] = entry;
        }

        // Check if limit exceeded
        if (entry.count >= max) {
          return ErrorHandler.createErrorResponse(
            new ErrorHandler.AppError(
              'Too many requests, please try again later',
              429,
              true,
              'RATE_LIMIT_EXCEEDED',
              {
                retryAfter: Math.ceil((entry.resetTime - now) / 1000)
              }
            )
          );
        }

        // Execute handler
        const response = await handler(request, context);

        // Update count based on response status
        const shouldCount = this.shouldCountRequest(response, skipSuccessfulRequests, skipFailedRequests);
        if (shouldCount) {
          entry.count++;
        }

        // Add rate limit headers
        const headers = new Headers(response.headers);
        headers.set('X-RateLimit-Limit', max.toString());
        headers.set('X-RateLimit-Remaining', Math.max(0, max - entry.count).toString());
        headers.set('X-RateLimit-Reset', entry.resetTime.toString());

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      };
    };
  }

  // Stricter rate limiting for auth endpoints
  static authRateLimit(handler: Function) {
    return this.rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 login attempts per 15 minutes
      skipSuccessfulRequests: true
    })(handler);
  }

  // API rate limiting
  static apiRateLimit(handler: Function) {
    return this.rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // 1000 API calls per 15 minutes
    })(handler);
  }

  // Upload rate limiting
  static uploadRateLimit(handler: Function) {
    return this.rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50, // 50 uploads per hour
      keyGenerator: (req) => this.getUserIdentifier(req)
    })(handler);
  }

  // Streaming rate limiting
  static streamRateLimit(handler: Function) {
    return this.rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 10, // 10 stream requests per 5 minutes
      keyGenerator: (req) => this.getUserIdentifier(req)
    })(handler);
  }

  // Device registration rate limiting
  static deviceRegistrationRateLimit(handler: Function) {
    return this.rateLimit({
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      max: 10, // 10 device registrations per day per IP
      skipSuccessfulRequests: false
    })(handler);
  }

  // Get client identifier (IP-based)
  private static getClientIdentifier(request: NextRequest): string {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
      request.headers.get('x-real-ip') || 
      'unknown';
    return `ip:${clientIp}`;
  }

  // Get user identifier (user-based)
  private static getUserIdentifier(request: NextRequest): string {
    const user = (request as any).user;
    if (user) {
      return `user:${user._id}`;
    }
    return this.getClientIdentifier(request);
  }

  // Check if request should be counted
  private static shouldCountRequest(
    response: Response,
    skipSuccessfulRequests: boolean,
    skipFailedRequests: boolean
  ): boolean {
    const status = response.status;
    
    if (skipSuccessfulRequests && status >= 200 && status < 300) {
      return false;
    }
    
    if (skipFailedRequests && (status >= 400 || status >= 500)) {
      return false;
    }
    
    return true;
  }

  // Cleanup expired entries
  private static cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }

  // Manual cleanup (for testing or manual triggers)
  static manualCleanup(): void {
    this.cleanup();
  }

  // Get current rate limit status
  static getRateLimitStatus(request: NextRequest): {
    count: number;
    resetTime: number;
    remaining: number;
  } | null {
    const key = this.getClientIdentifier(request);
    const entry = this.store[key];
    
    if (!entry) {
      return null;
    }
    
    return {
      count: entry.count,
      resetTime: entry.resetTime,
      remaining: Math.max(0, 100 - entry.count) // Assuming default max of 100
    };
  }
}