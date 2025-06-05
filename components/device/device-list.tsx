"use client";

import React, { useState, useEffect } from "react";
import { useDevices } from "@/hooks/use-devices";
import { useAuthContext } from "@/contexts/auth-context";
import { DeviceCard, DeviceCardCompact } from "./device-card";
import { DeviceLimitWarning } from "./device-limit-warning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDevices,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconPlus,
  IconSettings,
  IconShield,
  IconAlertTriangle,
  IconSortDescending,
  IconGrid3x3,
  IconList,
  IconTrash,
  IconShieldOff,
} from "@tabler/icons-react";
import { SignOutAllDevicesDialog } from "@/components/common/confirmation-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Device } from "@/types/device";

interface DeviceListProps {
  variant?: "card" | "compact" | "table";
  showFilter?: boolean;
  showSearch?: boolean;
  showActions?: boolean;
  maxHeight?: string;
  className?: string;
  onDeviceSelect?: (device: Device) => void;
}

type FilterType = "all" | "verified" | "unverified" | "trusted" | "blocked";
type SortType = "lastUsed" | "registeredAt" | "name" | "type";
type ViewType = "grid" | "list";

export function DeviceList({
  variant = "card",
  showFilter = true,
  showSearch = true,
  showActions = true,
  maxHeight = "600px",
  className,
  onDeviceSelect,
}: DeviceListProps) {
  const { user } = useAuthContext();
  const {
    devices,
    isLoading,
    error,
    fetchDevices,
    removeDevice,
    verifyDevice,
    blockDevice,
    getCurrentDevice,
  } = useDevices();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("lastUsed");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  // Get current device info to identify it in the list
  const currentDeviceInfo = getCurrentDevice();
  const currentDevice = devices.find(
    (device) =>
      device.platform === currentDeviceInfo.platform &&
      device.deviceType === currentDeviceInfo.deviceType
  );

  // Filter and sort devices
  const filteredDevices = devices
    .filter((device) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          device.deviceName.toLowerCase().includes(query) ||
          device.platform.toLowerCase().includes(query) ||
          device.deviceType.toLowerCase().includes(query) ||
          device.location?.city?.toLowerCase().includes(query) ||
          device.location?.country?.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // Status filter
      switch (filter) {
        case "verified":
          return device.isVerified && !device.isBlocked;
        case "unverified":
          return !device.isVerified;
        case "trusted":
          return device.isTrusted;
        case "blocked":
          return device.isBlocked;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.deviceName.localeCompare(b.deviceName);
        case "type":
          return a.deviceType.localeCompare(b.deviceType);
        case "registeredAt":
          return (
            new Date(b.registeredAt).getTime() -
            new Date(a.registeredAt).getTime()
          );
        case "lastUsed":
        default:
          return (
            new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
          );
      }
    });

  const handleDeviceAction = async (deviceId: string, action: string) => {
    try {
      switch (action) {
        case "verify":
          await verifyDevice(deviceId, ""); // In real app, you'd need verification code
          break;
        case "block":
          await blockDevice(deviceId);
          break;
        case "remove":
          await removeDevice(deviceId);
          break;
      }
      await fetchDevices(); // Refresh the list
    } catch (error) {
      console.error(`Failed to ${action} device:`, error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedDevices.length === 0) return;

    try {
      for (const deviceId of selectedDevices) {
        await handleDeviceAction(deviceId, action);
      }
      setSelectedDevices([]);
      toast.success(
        `${action} completed for ${selectedDevices.length} devices`
      );
    } catch (error) {
      toast.error(`Failed to ${action} selected devices`);
    }
  };

  const handleSignOutAllDevices = async () => {
    try {
      const response = await fetch("/api/devices/signout-all", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to sign out all devices");
      }

      await fetchDevices();
      toast.success("Signed out from all other devices");
      setShowSignOutDialog(false);
    } catch (error) {
      toast.error("Failed to sign out from all devices");
    }
  };

  const getFilterCount = (filterType: FilterType) => {
    switch (filterType) {
      case "verified":
        return devices.filter((d) => d.isVerified && !d.isBlocked).length;
      case "unverified":
        return devices.filter((d) => !d.isVerified).length;
      case "trusted":
        return devices.filter((d) => d.isTrusted).length;
      case "blocked":
        return devices.filter((d) => d.isBlocked).length;
      default:
        return devices.length;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDevices className="h-5 w-5" />
            My Devices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDevices className="h-5 w-5" />
            My Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={fetchDevices} className="mt-4">
            <IconRefresh className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <IconDevices className="h-5 w-5" />
                My Devices
                <Badge variant="outline">{devices.length}</Badge>
              </CardTitle>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewType === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewType("grid")}
                >
                  <IconGrid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewType === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewType("list")}
                >
                  <IconList className="h-4 w-4" />
                </Button>
              </div>

              {/* Actions Menu */}
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <IconSettings className="h-4 w-4 mr-2" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={fetchDevices}>
                      <IconRefresh className="h-4 w-4 mr-2" />
                      Refresh List
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowSignOutDialog(true)}
                    >
                      <IconShieldOff className="h-4 w-4 mr-2" />
                      Sign Out All Devices
                    </DropdownMenuItem>
                    {selectedDevices.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleBulkAction("remove")}
                          className="text-destructive"
                        >
                          <IconTrash className="h-4 w-4 mr-2" />
                          Remove Selected ({selectedDevices.length})
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Device Limit Warning */}
          <DeviceLimitWarning variant="inline" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filters */}
          {(showSearch || showFilter) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {showSearch && (
                <div className="relative flex-1">
                  <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}

              {showFilter && (
                <div className="flex gap-2">
                  <Select
                    value={filter}
                    onValueChange={(value: FilterType) => setFilter(value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All ({getFilterCount("all")})
                      </SelectItem>
                      <SelectItem value="verified">
                        Verified ({getFilterCount("verified")})
                      </SelectItem>
                      <SelectItem value="unverified">
                        Unverified ({getFilterCount("unverified")})
                      </SelectItem>
                      <SelectItem value="trusted">
                        Trusted ({getFilterCount("trusted")})
                      </SelectItem>
                      <SelectItem value="blocked">
                        Blocked ({getFilterCount("blocked")})
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={(value: SortType) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-40">
                      <IconSortDescending className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastUsed">Last Used</SelectItem>
                      <SelectItem value="registeredAt">Registered</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Device List */}
          <div
            className={cn(
              "space-y-4",
              maxHeight && `max-h-[${maxHeight}] overflow-y-auto`
            )}
          >
            {filteredDevices.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
                  <IconDevices className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  {searchQuery || filter !== "all"
                    ? "No devices match your criteria"
                    : "No devices registered"}
                </p>
                {searchQuery || filter !== "all" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setFilter("all");
                    }}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Devices will appear here when you sign in from different
                    devices
                  </p>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  viewType === "grid"
                    ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-3"
                )}
              >
                {filteredDevices.map((device) => {
                  const isCurrentDevice =
                    currentDevice?._id.toString() === device._id.toString();

                  if (variant === "compact" || viewType === "list") {
                    return (
                      <DeviceCardCompact
                        key={device._id.toString()}
                        device={device}
                        onRemove={(deviceId) =>
                          handleDeviceAction(deviceId, "remove")
                        }
                        isCurrentDevice={isCurrentDevice}
                        className={
                          onDeviceSelect
                            ? "cursor-pointer hover:bg-muted/50"
                            : ""
                        }
                        onClick={() => onDeviceSelect?.(device)}
                      />
                    );
                  }

                  return (
                    <DeviceCard
                      key={device._id.toString()}
                      device={device}
                      onRemove={(deviceId) =>
                        handleDeviceAction(deviceId, "remove")
                      }
                      onVerify={(deviceId) =>
                        handleDeviceAction(deviceId, "verify")
                      }
                      onBlock={(deviceId) =>
                        handleDeviceAction(deviceId, "block")
                      }
                      showActions={showActions}
                      isCurrentDevice={isCurrentDevice}
                      className={
                        onDeviceSelect
                          ? "cursor-pointer hover:shadow-md transition-shadow"
                          : ""
                      }
                      onClick={() => onDeviceSelect?.(device)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Filter Summary */}
          {(searchQuery || filter !== "all") && filteredDevices.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
              <span>
                Showing {filteredDevices.length} of {devices.length} devices
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SignOutAllDevicesDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={handleSignOutAllDevices}
      >
        <div />
      </SignOutAllDevicesDialog>
    </>
  );
}

// Specialized variants
export function DeviceListCompact({
  className,
  maxHeight = "400px",
}: Pick<DeviceListProps, "className" | "maxHeight">) {
  return (
    <DeviceList
      variant="compact"
      showFilter={false}
      showSearch={true}
      showActions={false}
      maxHeight={maxHeight}
      className={className}
    />
  );
}

export function DeviceListModal({
  onDeviceSelect,
  className,
}: Pick<DeviceListProps, "onDeviceSelect" | "className">) {
  return (
    <DeviceList
      variant="compact"
      showFilter={true}
      showSearch={true}
      showActions={false}
      maxHeight="500px"
      onDeviceSelect={onDeviceSelect}
      className={className}
    />
  );
}
