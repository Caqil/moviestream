"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

interface LoginPageClientProps {
  searchParams: {
    callbackUrl?: string;
    error?: string;
  };
}

export default function LoginPageClient({
  searchParams,
}: LoginPageClientProps) {
  const { callbackUrl, error } = searchParams;

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive font-medium">
            {getErrorMessage(error)}
          </p>
        </div>
      )}

      {/* Login Form */}
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm
          redirectTo={callbackUrl || "/dashboard"}
          showOAuth={true}
          showRegisterLink={true}
        />
      </Suspense>

      {/* Additional Info */}
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              New to MovieStream?
            </span>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            Join thousands of movie lovers streaming their favorite content.
          </p>
          <p className="mt-1">
            <strong>Free trial available</strong> • No commitment • Cancel
            anytime
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function getErrorMessage(error: string): string {
  switch (error) {
    case "CredentialsSignin":
      return "Invalid email or password. Please check your credentials and try again.";
    case "OAuthSignin":
      return "Error occurred during OAuth sign in. Please try again.";
    case "OAuthCallback":
      return "Error occurred during OAuth callback. Please try again.";
    case "OAuthCreateAccount":
      return "Could not create OAuth account. Please try again or contact support.";
    case "EmailCreateAccount":
      return "Could not create account with this email. Please try again.";
    case "Callback":
      return "Error occurred during callback. Please try again.";
    case "OAuthAccountNotLinked":
      return "This email is already associated with another account. Please sign in with your existing account.";
    case "EmailSignin":
      return "Error sending verification email. Please try again.";
    case "CredentialsSignup":
      return "Error creating account. Please check your information and try again.";
    case "SessionRequired":
      return "Please sign in to access this page.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}
