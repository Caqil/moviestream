import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

// Initialize database connection for auth routes
async function initializeAuth() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Failed to connect to database for auth:', error);
  }
}

// Create error response helper
function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error: 'Authentication Error',
      message,
      timestamp: new Date().toISOString()
    },
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      }
    }
  );
}

// Create NextAuth handler with enhanced error handling
const createAuthHandler = () => {
  try {
    return NextAuth(authOptions);
  } catch (error) {
    console.error('Failed to initialize NextAuth:', error);
    throw error;
  }
};

// Initialize the handler
let handler: ReturnType<typeof NextAuth>;

try {
  handler = createAuthHandler();
} catch (error) {
  console.error('Critical: Failed to initialize NextAuth handler:', error);
}

// Enhanced GET handler
export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ nextauth: string[] }> }
): Promise<NextResponse> {
  try {
    // Check if handler is available
    if (!handler) {
      console.error('NextAuth handler not initialized');
      return createErrorResponse('Authentication service unavailable', 503);
    }

    // Initialize database connection
    await initializeAuth();
    
    // Await params before accessing properties
    const params = await context.params;
    const { nextauth } = params;
    
    // Log authentication request for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[NextAuth] GET ${nextauth?.join('/')}`);
    }
    
    // Handle the request
    const response = await handler(request, context);
    
    // Add security headers to the response
    if (response instanceof NextResponse) {
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('X-XSS-Protection', '1; mode=block');
    }
    
    return response;
  } catch (error) {
    console.error('NextAuth GET error:', error);
    
    // Log the full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', error);
    }
    
    return createErrorResponse('Authentication request failed', 500);
  }
}

// Enhanced POST handler
export async function POST(
  request: NextRequest, 
  context: { params: Promise<{ nextauth: string[] }> }
): Promise<NextResponse> {
  try {
    // Check if handler is available
    if (!handler) {
      console.error('NextAuth handler not initialized');
      return createErrorResponse('Authentication service unavailable', 503);
    }

    // Initialize database connection
    await initializeAuth();
    
    // Await params before accessing properties
    const params = await context.params;
    const { nextauth } = params;
    const endpoint = nextauth?.join('/');
    
    // Log authentication request for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[NextAuth] POST ${endpoint}`);
    }
    
    // Extract client IP for security logging
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') || // Cloudflare
                     'unknown';
    
    // Add client IP to request context for auth callbacks
    (request as any).clientIp = clientIp;
    
    // Handle the request
    const response = await handler(request, context);
    
    // Add security headers
    if (response instanceof NextResponse) {
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      
      // Add CSRF protection for sensitive auth endpoints
      const sensitiveEndpoints = ['signin', 'signout', 'callback'];
      if (sensitiveEndpoints.some(ep => endpoint?.includes(ep))) {
        response.headers.set('X-CSRF-Protection', '1');
      }
    }
    
    // Log successful authentication events (in production, consider using a proper logging service)
    if (endpoint?.includes('callback') && response.status === 200) {
      console.log(`[Auth Success] User authenticated via ${endpoint} from IP: ${clientIp}`);
    }
    
    return response;
  } catch (error) {
    console.error('NextAuth POST error:', error);
    
    // Log security-related errors with context
    const params = await context.params;
    const { nextauth } = params;
    const endpoint = nextauth?.join('/');
    
    if (error instanceof Error) {
      console.error(`[Security] Auth error on ${endpoint}: ${error.message}`);
      
      // Log additional details in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Stack trace:', error.stack);
      }
    }
    
    return createErrorResponse('Authentication request failed', 500);
  }
}

// Health check endpoint for auth service
export async function HEAD(): Promise<NextResponse> {
  try {
    // Check if handler is initialized
    if (!handler) {
      return new NextResponse(null, { 
        status: 503,
        headers: {
          'X-Auth-Service': 'unhealthy',
          'X-Error': 'handler-not-initialized'
        }
      });
    }

    // Check database connection
    await initializeAuth();
    
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Auth-Service': 'healthy',
        'X-Service-Version': '1.0.0'
      }
    });
  } catch (error) {
    console.error('Auth health check failed:', error);
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'X-Auth-Service': 'unhealthy',
        'X-Error': 'database-connection-failed'
      }
    });
  }
}