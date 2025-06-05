import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/subscription',
  '/devices',
  '/watchlist',
  '/history',
  '/downloads',
  '/notifications'
];

// Define admin-only routes
const adminRoutes = [
  '/admin'
];

// Define API routes that need authentication
const protectedApiRoutes = [
  '/api/user',
  '/api/movies/rate',
  '/api/devices',
  '/api/sessions',
  '/api/watchlist',
  '/api/history',
  '/api/subscriptions'
];

// Define admin-only API routes
const adminApiRoutes = [
  '/api/admin'
];

// Define auth routes (redirect if already logged in)
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes that don't need auth, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/api/health' ||
    pathname === '/api/auth' ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/api/public' ||
    pathname.startsWith('/api/public/')
  ) {
    return NextResponse.next();
  }

  try {
    // Get the session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuthenticated = !!token;
    const isAdmin = token?.role === 'admin';
    const isSubscriber = token?.role === 'subscriber' || token?.role === 'admin';

    // Handle auth routes (login, register, etc.)
    if (authRoutes.some(route => pathname.startsWith(route))) {
      if (isAuthenticated) {
        // Redirect to dashboard if already logged in
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Handle admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(pathname), request.url));
      }
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      return NextResponse.next();
    }

    // Handle admin API routes
    if (adminApiRoutes.some(route => pathname.startsWith(route))) {
      if (!isAuthenticated || !isAdmin) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
      return NextResponse.next();
    }

    // Handle protected routes
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(pathname), request.url));
      }
      return NextResponse.next();
    }

    // Handle protected API routes
    if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    // Handle subscription-required routes
    if (pathname.startsWith('/premium') || pathname.startsWith('/watch')) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(pathname), request.url));
      }
      
      // Check subscription for premium content
      if (pathname.startsWith('/premium') && !isSubscriber) {
        return NextResponse.redirect(new URL('/pricing', request.url));
      }
      
      return NextResponse.next();
    }

    // Add security headers to all responses
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Add CSP header
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.google-analytics.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https://image.tmdb.org https://www.gravatar.com https://lh3.googleusercontent.com;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://api.stripe.com https://api.themoviedb.org;
      media-src 'self' blob:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();
    
    response.headers.set('Content-Security-Policy', cspHeader);

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};