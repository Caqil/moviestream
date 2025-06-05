"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconShield,
  IconLock,
  IconUserOff,
  IconCreditCard,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSubscription?: boolean;
  requireRole?: "admin" | "subscriber" | "guest";
  fallbackUrl?: string;
  showFallback?: boolean;
}

export function AuthGuard({
  children,
  requireAuth = false,
  requireSubscription = false,
  requireRole,
  fallbackUrl = "/auth/login",
  showFallback = true,
}: AuthGuardProps) {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isAdmin,
    isSubscriber,
    isLoading: authLoading,
  } = useAuthContext();
  const { isSubscribed, isExpired } = useSubscriptionContext();

  useEffect(() => {
    if (authLoading) return;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      if (!showFallback) {
        router.push(fallbackUrl);
        return;
      }
    }

    // Check role requirement
    if (requireRole && user) {
      const hasRequiredRole =
        user.role === requireRole ||
        (requireRole === "subscriber" && isAdmin) ||
        (requireRole === "guest" && (isSubscriber || isAdmin));

      if (!hasRequiredRole) {
        if (!showFallback) {
          router.push("/unauthorized");
          return;
        }
      }
    }

    // Check subscription requirement
    if (requireSubscription && isAuthenticated && !isSubscribed && !isAdmin) {
      if (!showFallback) {
        router.push("/pricing");
        return;
      }
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    requireAuth,
    requireRole,
    requireSubscription,
    isSubscribed,
    isAdmin,
    router,
    fallbackUrl,
    showFallback,
  ]);

  // Show loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    if (!showFallback) return null;

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
              <IconLock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <IconShield className="h-4 w-4" />
              <AlertDescription>
                You need to be signed in to access this content.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/auth/login")}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/auth/register")}
                className="flex-1"
              >
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role requirement
  if (requireRole && user) {
    const hasRequiredRole =
      user.role === requireRole ||
      (requireRole === "subscriber" && isAdmin) ||
      (requireRole === "guest" && (isSubscriber || isAdmin));

    if (!hasRequiredRole) {
      if (!showFallback) return null;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
                <IconUserOff className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <IconAlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You don't have permission to access this content. Required
                  role: {requireRole}.
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Check subscription requirement
  if (requireSubscription && isAuthenticated && !isSubscribed && !isAdmin) {
    if (!showFallback) return null;

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full w-fit">
              <IconCreditCard className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle>Subscription Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <IconCreditCard className="h-4 w-4" />
              <AlertDescription>
                {isExpired
                  ? "Your subscription has expired. Please renew to continue."
                  : "You need an active subscription to access this premium content."}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/pricing")}
                className="flex-1"
              >
                {isExpired ? "Renew" : "Subscribe"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Convenience wrapper components
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard requireAuth>{children}</AuthGuard>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth requireRole="admin">
      {children}
    </AuthGuard>
  );
}

export function SubscriberRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth requireSubscription>
      {children}
    </AuthGuard>
  );
}

export function PremiumRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth requireSubscription>
      {children}
    </AuthGuard>
  );
}
