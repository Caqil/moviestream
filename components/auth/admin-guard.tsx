"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconShield,
  IconLock,
  IconUserOff,
  IconAlertTriangle,
  IconHome,
} from "@tabler/icons-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading, user } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login?callbackUrl=/admin");
        return;
      }

      if (!isAdmin) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4 w-full max-w-md">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
                Please sign in to access the admin panel.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/auth/login?callbackUrl=/admin")}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1"
              >
                <IconHome className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
                You don't have permission to access the admin panel.
                Administrator privileges are required.
              </AlertDescription>
            </Alert>
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Current user: <strong>{user?.name}</strong>
              </p>
              <p>
                Role: <strong>{user?.role}</strong>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              <IconHome className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed, render admin interface
  return <>{children}</>;
}
