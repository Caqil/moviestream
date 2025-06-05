import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Types } from 'mongoose';
import { AuthUser, LoginRequest, RegisterRequest, AuthResponse } from '@/types';

// Extended session user type to match our NextAuth configuration
interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'admin' | 'subscriber' | 'guest';
  subscription?: {
    status: 'active' | 'canceled' | 'expired' | 'trial';
    planId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cast session user to our extended type
  const sessionUser = session?.user as ExtendedUser | undefined;

  // Convert NextAuth session user to AuthUser format
  const user: AuthUser | null = sessionUser ? {
    _id: new Types.ObjectId(sessionUser.id),
    email: sessionUser.email,
    name: sessionUser.name,
    image: sessionUser.image,
    role: sessionUser.role,
    isActive: true, // Assume active if session exists
    subscription: sessionUser.subscription ? {
      status: sessionUser.subscription.status,
      planId: new Types.ObjectId(sessionUser.subscription.planId),
      currentPeriodStart: new Date(sessionUser.subscription.currentPeriodStart),
      currentPeriodEnd: new Date(sessionUser.subscription.currentPeriodEnd),
      stripeCustomerId: sessionUser.subscription.stripeCustomerId,
      stripeSubscriptionId: sessionUser.subscription.stripeSubscriptionId,
    } : undefined
  } : null;

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isSubscriber = user?.role === 'subscriber' || user?.role === 'admin';

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
        return false;
      }

      // Register device if device info provided
      if (credentials.deviceInfo) {
        await fetch('/api/devices/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials.deviceInfo),
        });
      }

      return true;
    } catch (error) {
      setError('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.message || 'Registration failed');
        return false;
      }

      // Auto login after registration
      return await login({
        email: data.email,
        password: data.password,
        deviceInfo: data.deviceInfo,
      });
    } catch (error) {
      setError('Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const loginWithGoogle = useCallback(() => {
    signIn('google', { callbackUrl: '/dashboard' });
  }, []);

  const loginWithApple = useCallback(() => {
    signIn('apple', { callbackUrl: '/dashboard' });
  }, []);

  const updateProfile = useCallback(async (profileData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      return true;
    } catch (error) {
      setError('Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isAdmin,
    isSubscriber,
    isLoading: status === 'loading' || isLoading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithApple,
    updateProfile,
    clearError: () => setError(null),
  };
}
