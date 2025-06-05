"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDeviceDesktop,
  IconDevices,
  IconDots,
  IconMapPin,
  IconClock,
  IconShield,
  IconShieldOff,
  IconTrash,
  IconEye,
  IconRefresh,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconWifi,
} from "@tabler/icons-react";
import { FormatUtils } from "@/utils/format";
import { RemoveDeviceDialog } from "@/components/common/confirmation-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MonitorIcon, SmartphoneIcon, Table2Icon, Tv2Icon } from "lucide-react";
import { Device } from "@/types/device";

interface DeviceCardProps {
  device: Device;
  onRemove?: (deviceId: string) => void;
  onVerify?: (deviceId: string) => void;
  onBlock?: (deviceId: string) => void;
  onTrust?: (deviceId: string) => void;
  showActions?: boolean;
  variant?: "default" | "compact" | "detailed";
  className?: string;
  isCurrentDevice?: boolean;
  onClick?: () => void;
}

export function DeviceCard({
  device,
  onRemove,
  onVerify,
  onBlock,
  onTrust,
  showActions = true,
  variant = "default",
  className,
  isCurrentDevice = false,
  onClick,
}: DeviceCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const getDeviceIcon = () => {
    const iconClass = "h-6 w-6";
    switch (device.deviceType) {
      case "mobile":
        return <SmartphoneIcon className={iconClass} />;
      case "tablet":
        return <Table2Icon className={iconClass} />;
      case "tv":
        return <Tv2Icon className={iconClass} />;
      case "desktop":
        return <IconDeviceDesktop className={iconClass} />;
      default:
        return <MonitorIcon className={iconClass} />;
    }
  };

  const getDeviceIconSmall = () => {
    const iconClass = "h-4 w-4";
    switch (device.deviceType) {
      case "mobile":
        return <SmartphoneIcon className={iconClass} />;
      case "tablet":
        return <Table2Icon className={iconClass} />;
      case "tv":
        return <Tv2Icon className={iconClass} />;
      case "desktop":
        return <IconDeviceDesktop className={iconClass} />;
      default:
        return <MonitorIcon className={iconClass} />;
    }
  };

  const getStatusColor = () => {
    if (device.isBlocked) return "destructive";
    if (!device.isVerified) return "secondary";
    if (device.isTrusted) return "default";
    return "outline";
  };

  const getStatusText = () => {
    if (device.isBlocked) return "Blocked";
    if (!device.isVerified) return "Unverified";
    if (device.isTrusted) return "Trusted";
    return "Verified";
  };

  const getLastUsedText = () => {
    const now = new Date();
    const lastUsed = new Date(device.lastUsed);
    const diffInHours = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Active now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return FormatUtils.getRelativeTime(lastUsed);
  };

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      switch (action) {
        case "verify":
          await onVerify?.(device._id.toString());
          toast.success("Device verified successfully");
          break;
        case "block":
          await onBlock?.(device._id.toString());
          toast.success("Device blocked successfully");
          break;
        case "trust":
          await onTrust?.(device._id.toString());
          toast.success("Device trust status updated");
          break;
        case "remove":
          setShowRemoveDialog(true);
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} device`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveConfirm = async () => {
    try {
      await onRemove?.(device._id.toString());
      toast.success("Device removed successfully");
      setShowRemoveDialog(false);
    } catch (error) {
      toast.error("Failed to remove device");
    }
  };

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3 border rounded-lg",
          isCurrentDevice && "bg-primary/5 border-primary/20",
          onClick && "cursor-pointer hover:bg-muted/50",
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-muted rounded-lg">{getDeviceIconSmall()}</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{device.deviceName}</p>
              {isCurrentDevice && (
                <Badge variant="outline" className="text-xs">
                  This device
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{getLastUsedText()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor()} className="text-xs">
            {getStatusText()}
          </Badge>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDots className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleAction("verify")}>
                  <IconCheck className="h-4 w-4 mr-2" />
                  Verify
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("trust")}>
                  <IconShield className="h-4 w-4 mr-2" />
                  Toggle Trust
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleAction("remove")}
                  className="text-destructive"
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Card
        className={cn(
          "relative",
          isCurrentDevice && "ring-2 ring-primary ring-offset-2",
          device.isBlocked && "opacity-60",
          onClick && "cursor-pointer hover:shadow-md transition-shadow",
          className
        )}
        onClick={onClick}
      >
        {isCurrentDevice && (
          <Badge variant="default" className="absolute -top-2 left-4 z-10">
            Current Device
          </Badge>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 bg-muted">
                <AvatarFallback>{getDeviceIcon()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{device.deviceName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{device.platform}</span>
                  {device.browser && <span>• {device.browser}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor()}>
                {device.isBlocked && <IconShieldOff className="h-3 w-3 mr-1" />}
                {device.isTrusted && <IconShield className="h-3 w-3 mr-1" />}
                {!device.isVerified && (
                  <IconAlertTriangle className="h-3 w-3 mr-1" />
                )}
                {device.isVerified &&
                  !device.isTrusted &&
                  !device.isBlocked && <IconCheck className="h-3 w-3 mr-1" />}
                {getStatusText()}
              </Badge>

              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconDots className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!device.isVerified && (
                      <DropdownMenuItem onClick={() => handleAction("verify")}>
                        <IconCheck className="h-4 w-4 mr-2" />
                        Verify Device
                      </DropdownMenuItem>
                    )}
                    {device.isVerified && !device.isBlocked && (
                      <DropdownMenuItem onClick={() => handleAction("trust")}>
                        <IconShield className="h-4 w-4 mr-2" />
                        {device.isTrusted ? "Remove Trust" : "Mark as Trusted"}
                      </DropdownMenuItem>
                    )}
                    {!device.isBlocked && (
                      <DropdownMenuItem onClick={() => handleAction("block")}>
                        <IconShieldOff className="h-4 w-4 mr-2" />
                        Block Device
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleAction("remove")}
                      className="text-destructive"
                      disabled={isCurrentDevice}
                    >
                      <IconTrash className="h-4 w-4 mr-2" />
                      Remove Device
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Device Type & Platform */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getDeviceIconSmall()}
              <span className="capitalize">{device.deviceType}</span>
            </div>
            <span className="text-muted-foreground">
              {device.platform}
              {device.osVersion && ` ${device.osVersion}`}
            </span>
          </div>

          {/* Location & Network */}
          <div className="space-y-2 text-sm">
            {device.location && (
              <div className="flex items-center gap-2">
                <IconMapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {device.location.city}, {device.location.country}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <IconWifi className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs">{device.ipAddress}</span>
            </div>
          </div>

          {/* Usage Information */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last used:</span>
              <span>{getLastUsedText()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Registered:</span>
              <span>{FormatUtils.getRelativeTime(device.registeredAt)}</span>
            </div>
          </div>

          {/* Additional Metadata */}
          {variant === "detailed" && device.metadata && (
            <div className="space-y-2 text-sm pt-2 border-t">
              {device.metadata.screenResolution && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Resolution:</span>
                  <span>{device.metadata.screenResolution}</span>
                </div>
              )}
              {device.metadata.language && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span>{device.metadata.language}</span>
                </div>
              )}
            </div>
          )}

          {/* Warning for unverified devices */}
          {!device.isVerified && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <IconAlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Verification Required
                </span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                This device needs to be verified before it can be used for
                streaming.
              </p>
            </div>
          )}

          {/* Warning for blocked devices */}
          {device.isBlocked && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <IconShieldOff className="h-4 w-4" />
                <span className="text-sm font-medium">Device Blocked</span>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                This device has been blocked and cannot access your account.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <RemoveDeviceDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        deviceName={device.deviceName}
        onConfirm={handleRemoveConfirm}
        disabled={isCurrentDevice}
      >
        <div />
      </RemoveDeviceDialog>
    </>
  );
}

// Specialized variants
export function DeviceCardCompact({
  device,
  onRemove,
  className,
  isCurrentDevice,
  onClick,
}: Pick<
  DeviceCardProps,
  "device" | "onRemove" | "className" | "isCurrentDevice" | "onClick"
>) {
  return (
    <DeviceCard
      device={device}
      onRemove={onRemove}
      variant="compact"
      className={className}
      isCurrentDevice={isCurrentDevice}
      onClick={onClick}
    />
  );
}

export function DeviceCardDetailed({
  device,
  onRemove,
  onVerify,
  onBlock,
  onTrust,
  className,
  isCurrentDevice,
  onClick,
}: DeviceCardProps) {
  return (
    <DeviceCard
      device={device}
      onRemove={onRemove}
      onVerify={onVerify}
      onBlock={onBlock}
      onTrust={onTrust}
      variant="detailed"
      className={className}
      isCurrentDevice={isCurrentDevice}
      onClick={onClick}
    />
  );
}
