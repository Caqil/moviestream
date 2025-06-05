"use client";

import React from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  IconAlertTriangle,
  IconDevices,
  IconCrown,
  IconShield,
  IconArrowRight,
  IconX,
  IconSettings,
  IconExclamationMark,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { FormatUtils } from "@/utils/format";
import { useRouter } from "next/navigation";

interface DeviceLimitWarningProps {
  variant?: "alert" | "card" | "banner" | "inline";
  showUpgrade?: boolean;
  showManageDevices?: boolean;
  dismissible?: boolean;
  className?: string;
  onDismiss?: () => void;
}

export function DeviceLimitWarning({
  variant = "alert",
  showUpgrade = true,
  showManageDevices = true,
  dismissible = false,
  className,
  onDismiss,
}: DeviceLimitWarningProps) {
  const router = useRouter();
  const { deviceCount } = useAuthContext();
  const { currentPlan, deviceLimitInfo, isSubscribed } =
    useSubscriptionContext();

  // Don't show if we don't have device limit info
  if (!deviceLimitInfo || !currentPlan) {
    return null;
  }

  const { remaining, limit, canAdd } = deviceLimitInfo;
  const safeLimit = limit || 1; // Provide default to avoid division by zero
  const usagePercentage = (deviceCount / safeLimit) * 100;
  const isAtLimit = !canAdd;
  const isNearLimit = remaining <= 1 && remaining > 0;

  // Don't show warning if we're not near or at the limit
  if (remaining > 1) {
    return null;
  }

  const getWarningLevel = () => {
    if (isAtLimit) return "critical";
    if (isNearLimit) return "warning";
    return "info";
  };

  const getWarningMessage = () => {
    if (isAtLimit) {
      return `You've reached your device limit (${limit} devices). Remove a device or upgrade your plan to add more.`;
    }
    if (isNearLimit) {
      return `You're almost at your device limit (${deviceCount}/${limit} devices). Consider upgrading for more devices.`;
    }
    return `You have ${remaining} device slot${
      remaining !== 1 ? "s" : ""
    } remaining.`;
  };

  const getWarningIcon = () => {
    const level = getWarningLevel();
    const iconClass = "h-4 w-4";

    switch (level) {
      case "critical":
        return (
          <IconExclamationMark className={cn(iconClass, "text-destructive")} />
        );
      case "warning":
        return (
          <IconAlertTriangle className={cn(iconClass, "text-orange-500")} />
        );
      default:
        return <IconDevices className={cn(iconClass, "text-blue-500")} />;
    }
  };

  const getAlertVariant = () => {
    const level = getWarningLevel();
    return level === "critical" ? "destructive" : "default";
  };

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  const handleManageDevices = () => {
    router.push("/devices");
  };

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "relative border-l-4 p-4",
          isAtLimit
            ? "border-l-destructive bg-destructive/5"
            : "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20",
          className
        )}
      >
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onDismiss}
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-start gap-3">
          {getWarningIcon()}
          <div className="flex-1">
            <p className="font-medium text-sm">
              Device Limit {isAtLimit ? "Reached" : "Warning"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {getWarningMessage()}
            </p>

            {(showUpgrade || showManageDevices) && (
              <div className="flex gap-2 mt-3">
                {showUpgrade && (
                  <Button size="sm" onClick={handleUpgrade}>
                    <IconCrown className="h-4 w-4 mr-1" />
                    Upgrade Plan
                  </Button>
                )}
                {showManageDevices && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageDevices}
                  >
                    <IconSettings className="h-4 w-4 mr-1" />
                    Manage Devices
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              {getWarningIcon()}
              Device Usage
            </CardTitle>
            {dismissible && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                <IconX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Devices Used</span>
              <span className="font-medium">
                {deviceCount} / {limit === 999 ? "∞" : limit}
              </span>
            </div>
            <Progress
              value={limit === 999 ? 0 : usagePercentage}
              className={cn(
                "h-2",
                isAtLimit && "bg-destructive/20",
                isNearLimit && "bg-orange-200"
              )}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {getWarningMessage()}
            </p>

            {currentPlan && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentPlan.name} Plan
                </Badge>
                {isAtLimit && (
                  <Badge variant="destructive" className="text-xs">
                    Limit Reached
                  </Badge>
                )}
                {isNearLimit && (
                  <Badge variant="secondary" className="text-xs">
                    Near Limit
                  </Badge>
                )}
              </div>
            )}
          </div>

          {(showUpgrade || showManageDevices) && (
            <div className="flex gap-2 pt-2">
              {showUpgrade && (
                <Button size="sm" onClick={handleUpgrade} className="flex-1">
                  <IconCrown className="h-4 w-4 mr-1" />
                  Upgrade
                </Button>
              )}
              {showManageDevices && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageDevices}
                  className="flex-1"
                >
                  <IconSettings className="h-4 w-4 mr-1" />
                  Manage
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3 border rounded-lg",
          isAtLimit
            ? "border-destructive/50 bg-destructive/5"
            : "border-orange-500/50 bg-orange-50 dark:bg-orange-900/20",
          className
        )}
      >
        <div className="flex items-center gap-3">
          {getWarningIcon()}
          <div>
            <p className="text-sm font-medium">
              {deviceCount}/{limit === 999 ? "∞" : limit} devices used
            </p>
            <p className="text-xs text-muted-foreground">
              {isAtLimit ? "Device limit reached" : `${remaining} remaining`}
            </p>
          </div>
        </div>

        {(showUpgrade || showManageDevices) && (
          <div className="flex gap-1">
            {showUpgrade && (
              <Button size="sm" variant="outline" onClick={handleUpgrade}>
                Upgrade
                <IconArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
            {showManageDevices && (
              <Button size="sm" variant="ghost" onClick={handleManageDevices}>
                <IconSettings className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default: alert variant
  return (
    <Alert variant={getAlertVariant()} className={className}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          {getWarningIcon()}
          <div className="flex-1">
            <AlertDescription>{getWarningMessage()}</AlertDescription>

            {(showUpgrade || showManageDevices) && (
              <div className="flex gap-2 mt-3">
                {showUpgrade && (
                  <Button size="sm" variant="outline" onClick={handleUpgrade}>
                    <IconCrown className="h-4 w-4 mr-1" />
                    Upgrade Plan
                  </Button>
                )}
                {showManageDevices && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleManageDevices}
                  >
                    <IconSettings className="h-4 w-4 mr-1" />
                    Manage Devices
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {dismissible && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}

// Specialized variants for different use cases
export function DeviceLimitBanner({
  className,
  onDismiss,
}: Pick<DeviceLimitWarningProps, "className" | "onDismiss">) {
  return (
    <DeviceLimitWarning
      variant="banner"
      showUpgrade={true}
      showManageDevices={true}
      dismissible={true}
      className={className}
      onDismiss={onDismiss}
    />
  );
}

export function DeviceLimitCard({
  className,
}: Pick<DeviceLimitWarningProps, "className">) {
  return (
    <DeviceLimitWarning
      variant="card"
      showUpgrade={true}
      showManageDevices={true}
      className={className}
    />
  );
}

export function DeviceLimitInline({
  className,
}: Pick<DeviceLimitWarningProps, "className">) {
  return (
    <DeviceLimitWarning
      variant="inline"
      showUpgrade={true}
      showManageDevices={false}
      className={className}
    />
  );
}

// Hook to check if warning should be shown
export function useDeviceLimitWarning() {
  const { deviceCount } = useAuthContext();
  const { deviceLimitInfo } = useSubscriptionContext();

  if (!deviceLimitInfo) {
    return {
      shouldShowWarning: false,
      isAtLimit: false,
      isNearLimit: false,
      remaining: 0,
      limit: 0,
    };
  }

  const { remaining, limit, canAdd } = deviceLimitInfo;
  const isAtLimit = !canAdd;
  const isNearLimit = remaining <= 1 && remaining > 0;
  const shouldShowWarning = isAtLimit || isNearLimit;

  return {
    shouldShowWarning,
    isAtLimit,
    isNearLimit,
    remaining,
    limit,
    deviceCount,
  };
}
