"use client";

import React from "react";
import { IconLoader, IconMovie, IconDevices } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "bars" | "pulse" | "bounce" | "movie";
  color?: "default" | "primary" | "muted";
  className?: string;
  label?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export function LoadingSpinner({
  size = "md",
  variant = "default",
  color = "default",
  className,
  label,
  fullScreen = false,
  overlay = false,
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "h-3 w-3";
      case "sm":
        return "h-4 w-4";
      case "md":
        return "h-6 w-6";
      case "lg":
        return "h-8 w-8";
      case "xl":
        return "h-12 w-12";
      default:
        return "h-6 w-6";
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "text-primary";
      case "muted":
        return "text-muted-foreground";
      default:
        return "text-foreground";
    }
  };

  const getLabelSize = () => {
    switch (size) {
      case "xs":
      case "sm":
        return "text-xs";
      case "md":
        return "text-sm";
      case "lg":
        return "text-base";
      case "xl":
        return "text-lg";
      default:
        return "text-sm";
    }
  };

  const renderSpinner = () => {
    const baseClasses = cn(getSizeClasses(), getColorClasses(), className);

    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full animate-pulse",
                  size === "xs"
                    ? "h-1 w-1"
                    : size === "sm"
                    ? "h-1.5 w-1.5"
                    : size === "md"
                    ? "h-2 w-2"
                    : size === "lg"
                    ? "h-3 w-3"
                    : "h-4 w-4",
                  getColorClasses().replace("text-", "bg-")
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1.4s",
                }}
              />
            ))}
          </div>
        );

      case "bars":
        return (
          <div className="flex space-x-1 items-end">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "animate-pulse",
                  size === "xs"
                    ? "w-0.5 h-2"
                    : size === "sm"
                    ? "w-0.5 h-3"
                    : size === "md"
                    ? "w-1 h-4"
                    : size === "lg"
                    ? "w-1 h-6"
                    : "w-1.5 h-8",
                  getColorClasses().replace("text-", "bg-")
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <div
            className={cn(
              "rounded-full animate-pulse",
              getSizeClasses(),
              getColorClasses().replace("text-", "bg-")
            )}
          />
        );

      case "bounce":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full animate-bounce",
                  size === "xs"
                    ? "h-1 w-1"
                    : size === "sm"
                    ? "h-1.5 w-1.5"
                    : size === "md"
                    ? "h-2 w-2"
                    : size === "lg"
                    ? "h-3 w-3"
                    : "h-4 w-4",
                  getColorClasses().replace("text-", "bg-")
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      case "movie":
        return <IconMovie className={cn(baseClasses, "animate-spin")} />;

      default:
        return <IconLoader className={cn(baseClasses, "animate-spin")} />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderSpinner()}
      {label && (
        <p className={cn("font-medium", getLabelSize(), getColorClasses())}>
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          overlay ? "bg-background/80 backdrop-blur-sm" : "bg-background"
        )}
      >
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="relative">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Specialized loading components
export function PageLoader({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-[400px]",
        className
      )}
    >
      <LoadingSpinner
        size="lg"
        variant="default"
        label={label}
        color="primary"
      />
    </div>
  );
}

export function SectionLoader({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <LoadingSpinner size="md" variant="default" label={label} color="muted" />
    </div>
  );
}

export function InlineLoader({
  size = "sm",
  className,
}: {
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  return (
    <LoadingSpinner
      size={size}
      variant="default"
      className={className}
      color="muted"
    />
  );
}

export function ButtonLoader({
  size = "sm",
  className,
}: {
  size?: "xs" | "sm";
  className?: string;
}) {
  return (
    <LoadingSpinner
      size={size}
      variant="default"
      className={cn("mr-2", className)}
    />
  );
}

export function MovieLoader({
  label = "Loading movies...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <LoadingSpinner size="lg" variant="movie" label={label} color="primary" />
    </div>
  );
}

export function DashboardLoader({
  label = "Loading dashboard...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center min-h-screen", className)}
    >
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" variant="default" color="primary" />
        <div className="space-y-2">
          <p className="text-lg font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your content
          </p>
        </div>
      </div>
    </div>
  );
}

export function CardSkeletonLoader({ count = 1 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-video bg-muted animate-pulse rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeletonLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/6" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/5" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeletonLoader() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      ))}
      <div className="flex space-x-2">
        <div className="h-10 bg-muted animate-pulse rounded w-24" />
        <div className="h-10 bg-muted animate-pulse rounded w-20" />
      </div>
    </div>
  );
}

// Hook for managing loading states
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  const toggleLoading = React.useCallback(
    () => setIsLoading((prev) => !prev),
    []
  );

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setLoading: setIsLoading,
  };
}

// HOC for adding loading states to components
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  LoaderComponent: React.ComponentType = PageLoader
) {
  return function LoadingWrapper(props: P & { isLoading?: boolean }) {
    const { isLoading, ...componentProps } = props;

    if (isLoading) {
      return <LoaderComponent />;
    }

    return <Component {...(componentProps as P)} />;
  };
}
