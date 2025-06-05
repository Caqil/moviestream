
import { NextRequest } from 'next/server';
import { AuthMiddleware } from './auth-middleware';
import { ErrorHandler } from '@/utils/error-handling';
import { Types } from 'mongoose';
import { Settings } from '@/models/Settings';

export class AdminMiddleware {
  // Require admin role
  static requireAdmin(handler: Function) {
    return AuthMiddleware.requireAuth(async (request: NextRequest, context: any) => {
      const user = (request as any).user;
      
      if (user.role !== 'admin') {
        return ErrorHandler.createErrorResponse(
          ErrorHandler.forbidden('Admin access required')
        );
      }

      return handler(request, context);
    });
  }

  // Require admin or specific permissions
  static requirePermissions(permissions: string[]) {
    return (handler: Function) => {
      return AuthMiddleware.requireAuth(async (request: NextRequest, context: any) => {
        const user = (request as any).user;
        
        if (user.role !== 'admin') {
          return ErrorHandler.createErrorResponse(
            ErrorHandler.forbidden('Admin access required')
          );
        }

        // In a more complex system, you could check specific permissions
        // For now, all admins have all permissions
        return handler(request, context);
      });
    };
  }

  // Allow admin or resource owner
  static requireAdminOrOwner(getResourceUserId: (request: NextRequest, context: any) => Types.ObjectId | string) {
    return (handler: Function) => {
      return AuthMiddleware.requireAuth(async (request: NextRequest, context: any) => {
        const user = (request as any).user;
        
        // Admins can access anything
        if (user.role === 'admin') {
          return handler(request, context);
        }

        // Check if user owns the resource
        const resourceUserId = getResourceUserId(request, context);
        if (user._id.toString() === resourceUserId.toString()) {
          return handler(request, context);
        }

        return ErrorHandler.createErrorResponse(
          ErrorHandler.forbidden('Access denied')
        );
      });
    };
  }
  static checkMaintenanceMode(handler: Function) {
    return async (request: NextRequest, context: any) => {
      try {
        const settings = await Settings.findOne();
        
        if (settings?.maintenance.isEnabled) {
          // Safely get client IP from headers
          const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                           request.headers.get('x-real-ip') || 
                           'unknown';
          
          // Check if IP is in allowed list
          if (!settings.maintenance.allowedIPs.includes(clientIp)) {
            return ErrorHandler.createErrorResponse(
              new ErrorHandler.AppError(
                settings.maintenance.message || 'Site is under maintenance',
                503,
                true,
                'MAINTENANCE_MODE'
              )
            );
          }
        }
  
        return handler(request, context);
      } catch (error) {
        console.error('Maintenance check error:', error);
        return handler(request, context); // Continue if check fails
      }
    };
  }
}
