"use client";

import { useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  IconLoader,
  IconBrandGoogle,
  IconBrandApple,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface OAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "horizontal" | "vertical";
  showLabels?: boolean;
}

export function OAuthButtons({
  onSuccess,
  onError,
  disabled = false,
  className,
  variant = "horizontal",
  showLabels = true,
}: OAuthButtonsProps) {
  const { loginWithGoogle, loginWithApple } = useAuthContext();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoadingProvider("google");
    try {
      await loginWithGoogle();
      toast.success("Redirecting to Google...", {
        description: "Please complete the sign-in process.",
      });
      onSuccess?.();
    } catch (error) {
      const errorMessage = "Failed to sign in with Google";
      toast.error("Sign in failed", {
        description: errorMessage,
      });
      onError?.(errorMessage);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setLoadingProvider("apple");
    try {
      await loginWithApple();
      toast.success("Redirecting to Apple...", {
        description: "Please complete the sign-in process.",
      });
      onSuccess?.();
    } catch (error) {
      const errorMessage = "Failed to sign in with Apple";
      toast.error("Sign in failed", {
        description: errorMessage,
      });
      onError?.(errorMessage);
    } finally {
      setLoadingProvider(null);
    }
  };

  const isDisabled = disabled || loadingProvider !== null;

  if (variant === "vertical") {
    return (
      <div className={`space-y-3 ${className}`}>
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isDisabled}
          className="w-full"
          size="lg"
        >
          {loadingProvider === "google" ? (
            <IconLoader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconBrandGoogle className="mr-2 h-4 w-4" />
          )}
          {showLabels && (
            <>
              {loadingProvider === "google"
                ? "Connecting to Google..."
                : "Continue with Google"}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleAppleSignIn}
          disabled={isDisabled}
          className="w-full"
          size="lg"
        >
          {loadingProvider === "apple" ? (
            <IconLoader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconBrandApple className="mr-2 h-4 w-4" />
          )}
          {showLabels && (
            <>
              {loadingProvider === "apple"
                ? "Connecting to Apple..."
                : "Continue with Apple"}
            </>
          )}
        </Button>
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isDisabled}
          className="w-full"
          size="lg"
        >
          {loadingProvider === "google" ? (
            <IconLoader className="h-4 w-4 animate-spin" />
          ) : (
            <IconBrandGoogle className="h-4 w-4" />
          )}
          {showLabels && <span className="ml-2 hidden sm:inline">Google</span>}
        </Button>

        <Button
          variant="outline"
          onClick={handleAppleSignIn}
          disabled={isDisabled}
          className="w-full"
          size="lg"
        >
          {loadingProvider === "apple" ? (
            <IconLoader className="h-4 w-4 animate-spin" />
          ) : (
            <IconBrandApple className="h-4 w-4" />
          )}
          {showLabels && <span className="ml-2 hidden sm:inline">Apple</span>}
        </Button>
      </div>
    );
  }

  // Default variant - compact
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={handleGoogleSignIn}
        disabled={isDisabled}
        title="Sign in with Google"
      >
        {loadingProvider === "google" ? (
          <IconLoader className="h-4 w-4 animate-spin" />
        ) : (
          <IconBrandGoogle className="h-4 w-4" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleAppleSignIn}
        disabled={isDisabled}
        title="Sign in with Apple"
      >
        {loadingProvider === "apple" ? (
          <IconLoader className="h-4 w-4 animate-spin" />
        ) : (
          <IconBrandApple className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

// Convenience components for specific use cases
export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  className,
  fullWidth = false,
}: Omit<OAuthButtonsProps, "variant"> & { fullWidth?: boolean }) {
  const { loginWithGoogle } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Redirecting to Google...");
      onSuccess?.();
    } catch (error) {
      const errorMessage = "Failed to sign in with Google";
      toast.error("Sign in failed", { description: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignIn}
      disabled={disabled || isLoading}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
      size="lg"
    >
      {isLoading ? (
        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <IconBrandGoogle className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Connecting..." : "Continue with Google"}
    </Button>
  );
}

export function AppleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  className,
  fullWidth = false,
}: Omit<OAuthButtonsProps, "variant"> & { fullWidth?: boolean }) {
  const { loginWithApple } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithApple();
      toast.success("Redirecting to Apple...");
      onSuccess?.();
    } catch (error) {
      const errorMessage = "Failed to sign in with Apple";
      toast.error("Sign in failed", { description: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignIn}
      disabled={disabled || isLoading}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
      size="lg"
    >
      {isLoading ? (
        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <IconBrandApple className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Connecting..." : "Continue with Apple"}
    </Button>
  );
}
