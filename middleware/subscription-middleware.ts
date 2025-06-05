import { NextRequest } from 'next/server';
import { AuthMiddleware } from './auth-middleware';
import { User } from '@/models/User';
import { SubscriptionPlan } from '@/models/Subscription';
import { Device } from '@/models/Device';
import { Session } from '@/models/Session';
import { ErrorHandler } from '@/utils/error-handling';
import { ISubscriptionPlan } from '@/models/Subscription';

export class SubscriptionMiddleware {
  // Require active subscription
  static requireSubscription(handler: Function) {
    return AuthMiddleware.requireAuth(async (request: NextRequest, context: any) => {
      const user = (request as any).user;
      
      // Admins bypass subscription checks
      if (user.role === 'admin') {
        return handler(request, context);
      }

      if (!user.subscription || user.subscription.status !== 'active') {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.subscriptionRequired()
        );
      }

      // Check if subscription has expired
      if (user.subscription.currentPeriodEnd < new Date()) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.subscriptionRequired()
        );
      }

      return handler(request, context);
    });
  }

  // Check device limits
  static checkDeviceLimit(handler: Function) {
    return AuthMiddleware.requireAuth(async (request: NextRequest, context: any) => {
      const user = (request as any).user;
      const device = (request as any).device;
      
      // Admins bypass device limits
      if (user.role === 'admin') {
        return handler(request, context);
      }

      if (!user.subscription || user.subscription.status !== 'active') {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.subscriptionRequired()
        );
      }

      // Get subscription plan
      const plan = await SubscriptionPlan.findById(user.subscription.planId);
      if (!plan) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.badRequest('Subscription plan not found')
        );
      }

      // Check device limit
      const deviceCount = await Device.countDocuments({
        userId: user._id,
        isBlocked: false
      });

      if (plan.deviceLimit !== 999 && deviceCount >= plan.deviceLimit) {
        // If this is an existing device, allow it
        if (device && await Device.findOne({ _id: device._id, userId: user._id })) {
          return handler(request, context);
        }
        
        return ErrorHandler.createErrorResponse(
          ErrorHandler.deviceLimitExceeded()
        );
      }

      return handler(request, context);
    });
  }

  // Check simultaneous stream limits
  static checkStreamLimit(handler: Function) {
    return AuthMiddleware.requireActiveSession(async (request: NextRequest, context: any) => {
      const user = (request as any).user;
      const session = (request as any).session;
      
      // Admins bypass stream limits
      if (user.role === 'admin') {
        return handler(request, context);
      }

      if (!user.subscription || user.subscription.status !== 'active') {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.subscriptionRequired()
        );
      }

      // Get subscription plan
      const plan = await SubscriptionPlan.findById(user.subscription.planId);
      if (!plan) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.badRequest('Subscription plan not found')
        );
      }

      // Count active streaming sessions
      const activeStreams = await Session.countDocuments({
        userId: user._id,
        isActive: true,
        movieId: { $exists: true, $ne: null },
        _id: { $ne: session._id } // Exclude current session
      });

      if (activeStreams >= plan.simultaneousStreams) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.sessionLimitExceeded()
        );
      }

      return handler(request, context);
    });
  }

  // Check content access (premium content)
  static checkContentAccess(handler: Function) {
    return AuthMiddleware.requireAuth(async (request: NextRequest, context: any) => {
      const user = (request as any).user;
      
      // Get movie ID from request (adjust based on your routing)
      const movieId = context.params?.id || request.nextUrl.searchParams.get('movieId');
      
      if (!movieId) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.badRequest('Movie ID required')
        );
      }

      // Get movie details to check if it's premium
      const Movie = (await import('@/models/Movie')).Movie;
      const movie = await Movie.findById(movieId);
      
      if (!movie) {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.notFound('Movie')
        );
      }

      // If content is not premium, allow access
      if (!movie.isPremium) {
        return handler(request, context);
      }

      // Admins can access premium content
      if (user.role === 'admin') {
        return handler(request, context);
      }

      // Check subscription for premium content
      if (!user.subscription || user.subscription.status !== 'active') {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.subscriptionRequired()
        );
      }

      return handler(request, context);
    });
  }

  // Check plan features
  static requirePlanFeature(feature: keyof ISubscriptionPlan['deviceFeatures']) {
    return (handler: Function) => {
      return AuthMiddleware.requireAuth(async (request: NextRequest, context: any) => {
        const user = (request as any).user;
        const device = (request as any).device;
        
        // Admins bypass feature checks
        if (user.role === 'admin') {
          return handler(request, context);
        }

        if (!user.subscription || user.subscription.status !== 'active') {
          return ErrorHandler.createErrorResponse(
            ErrorHandler.subscriptionRequired()
          );
        }

        // Get subscription plan
        const plan = await SubscriptionPlan.findById(user.subscription.planId);
        if (!plan) {
          return ErrorHandler.createErrorResponse(
            ErrorHandler.badRequest('Subscription plan not found')
          );
        }

        // Check if feature is enabled for this plan
        if (!plan.deviceFeatures[feature]) {
          return ErrorHandler.createErrorResponse(
            ErrorHandler.forbidden(`Feature not available in your plan`)
          );
        }

        // Check device type compatibility
        if (device) {
          const deviceTypeFeature = `allow${device.deviceType.charAt(0).toUpperCase() + device.deviceType.slice(1)}` as keyof ISubscriptionPlan['deviceFeatures'];
          if (plan.deviceFeatures[deviceTypeFeature] === false) {
            return ErrorHandler.createErrorResponse(
              ErrorHandler.forbidden(`Device type not supported by your plan`)
            );
          }
        }

        return handler(request, context);
      });
    };
  }
}