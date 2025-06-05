import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { User } from '@/models/User';
import { Device } from '@/models/Device';
import { Session } from '@/models/Session';
import { Settings } from '@/models/Settings';
import { EncryptionUtils } from '@/utils/encryption';
import { ErrorHandler } from '@/utils/error-handling';
import { AuthUser } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user: AuthUser;
  device?: {
    _id: Types.ObjectId;
    deviceId: string;
    deviceType: string;
    isVerified: boolean;
    isTrusted: boolean;
  };
  session?: {
    _id: Types.ObjectId;
    sessionToken: string;
    expiresAt: Date;
  };
}

export class AuthMiddleware {
  // Main authentication middleware
  static async authenticate(request: NextRequest): Promise<{
    user: AuthUser | null;
    device: any | null;
    session: any | null;
    error: string | null;
  }> {
    try {
      // Extract token from Authorization header or cookies
      const authHeader = request.headers.get('authorization');
      const cookieToken = request.cookies.get('accessToken')?.value;
      
      const token = authHeader?.replace('Bearer ', '') || cookieToken;
      
      if (!token) {
        return { user: null, device: null, session: null, error: 'No token provided' };
      }

      // Verify and decode token
      const decoded = EncryptionUtils.verifyAccessToken(token);
      const userId = decoded.userId;

      // Get user from database
      const user = await User.findById(userId).select('-password');
      if (!user || !user.isActive) {
        return { user: null, device: null, session: null, error: 'User not found or inactive' };
      }

      // Get device information if available
      const deviceId = request.headers.get('x-device-id');
      let device = null;
      if (deviceId) {
        device = await Device.findOne({ 
          _id: deviceId, 
          userId: user._id,
          isBlocked: false 
        });
      }

      // Get session information if available
      const sessionToken = request.headers.get('x-session-token');
      let session = null;
      if (sessionToken && device) {
        session = await Session.findOne({
          sessionToken,
          userId: user._id,
          deviceId: device._id,
          isActive: true,
          expiresAt: { $gt: new Date() }
        });
      }

      return {
        user: {
          _id: user._id as unknown as Types.ObjectId,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isActive: user.isActive,
          subscription: user.subscription ? {
            status: user.subscription.status,
            planId: user.subscription.planId as unknown as Types.ObjectId,
            currentPeriodStart: user.subscription.currentPeriodStart,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            stripeCustomerId: user.subscription.stripeCustomerId,
            stripeSubscriptionId: user.subscription.stripeSubscriptionId,
          } : undefined
        },
        device,
        session,
        error: null
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return { 
        user: null, 
        device: null, 
        session: null, 
        error: 'Invalid token' 
      };
    }
  }

  // Middleware wrapper for API routes
  static requireAuth(handler: Function) {
    return async (request: NextRequest, context: any) => {
      const { user, device, session, error } = await this.authenticate(request);
      
      if (error || !user) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.unauthorized(error || 'Authentication required')
        );
      }

      // Attach user data to request
      (request as any).user = user;
      (request as any).device = device;
      (request as any).session = session;

      return handler(request, context);
    };
  }

  // Optional authentication (for public endpoints that can benefit from user context)
  static optionalAuth(handler: Function) {
    return async (request: NextRequest, context: any) => {
      const { user, device, session } = await this.authenticate(request);
      
      // Attach user data even if null
      (request as any).user = user;
      (request as any).device = device;
      (request as any).session = session;

      return handler(request, context);
    };
  }

  // Device verification middleware
  static requireVerifiedDevice(handler: Function) {
    return async (request: NextRequest, context: any) => {
      const authResult = await this.authenticate(request);
      
      if (authResult.error || !authResult.user) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.unauthorized('Authentication required')
        );
      }

      if (!authResult.device) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.badRequest('Device information required')
        );
      }

      if (!authResult.device.isVerified) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.forbidden('Device not verified')
        );
      }

      if (authResult.device.isBlocked) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.deviceBlocked()
        );
      }
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
      request.headers.get('x-real-ip') || 
      'unknown';
      // Update device last used
      await Device.findByIdAndUpdate(authResult.device._id, {
        lastUsed: new Date(),
        ipAddress: clientIp
      });

      (request as any).user = authResult.user;
      (request as any).device = authResult.device;
      (request as any).session = authResult.session;

      return handler(request, context);
    };
  }

  // Session validation middleware
  static requireActiveSession(handler: Function) {
    return async (request: NextRequest, context: any) => {
      const authResult = await this.authenticate(request);
      
      if (authResult.error || !authResult.user) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.unauthorized('Authentication required')
        );
      }

      if (!authResult.session) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.unauthorized('Active session required')
        );
      }

      // Update session activity
      await Session.findByIdAndUpdate(authResult.session._id, {
        lastActivity: new Date()
      });

      (request as any).user = authResult.user;
      (request as any).device = authResult.device;
      (request as any).session = authResult.session;

      return handler(request, context);
    };
  }
}