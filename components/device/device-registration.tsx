"use client";

import React, { useState, useEffect } from "react";
import { useDevices } from "@/hooks/use-devices";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconLoader,
  IconCheck,
  IconX,
  IconShield,
  IconAlertTriangle,
  IconDeviceDesktop,
  IconRefresh,
  IconMail,
  IconKey,
  IconDevicesPlus,
} from "@tabler/icons-react";
import { DeviceLimitWarning } from "./device-limit-warning";
import { FormatUtils } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MonitorIcon, SmartphoneIcon, Table2Icon, Tv2Icon } from "lucide-react";

interface DeviceRegistrationProps {
  onSuccess?: (device: any) => void;
  onCancel?: () => void;
  className?: string;
  autoDetect?: boolean;
  showLimitWarning?: boolean;
}

interface DeviceInfo {
  deviceName: string;
  deviceType: "web" | "mobile" | "tablet" | "tv" | "desktop" | "other";
  platform: string;
  browser?: string;
  userAgent: string;
  metadata?: {
    screenResolution?: string;
    language?: string;
    cookiesEnabled?: boolean;
  };
}

type RegistrationStep = "device-info" | "verification" | "success";

export function DeviceRegistration({
  onSuccess,
  onCancel,
  className,
  autoDetect = true,
  showLimitWarning = true,
}: DeviceRegistrationProps) {
  const { user } = useAuthContext();
  const { deviceLimitInfo } = useSubscriptionContext();
  const { registerDevice, verifyDevice, getCurrentDevice } = useDevices();

  const [currentStep, setCurrentStep] =
    useState<RegistrationStep>("device-info");
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceName: "",
    deviceType: "web",
    platform: "",
    browser: "",
    userAgent: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredDevice, setRegisteredDevice] = useState<any>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auto-detect device information
  useEffect(() => {
    if (autoDetect && typeof window !== "undefined") {
      const detectedInfo = getCurrentDevice();
      setDeviceInfo((prev) => ({
        ...prev,
        ...detectedInfo,
        deviceName:
          detectedInfo.deviceName || `${detectedInfo.platform} Device`,
      }));
    }
  }, [autoDetect, getCurrentDevice]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleDeviceRegistration = async () => {
    if (!deviceInfo.deviceName.trim()) {
      setError("Device name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await registerDevice(deviceInfo);

      if (result) {
        setRegisteredDevice(result);

        // If device requires verification, go to verification step
        if (result.requiresVerification) {
          setCurrentStep("verification");
          toast.info("Verification required", {
            description: "Check your email for the verification code",
          });
        } else {
          // Device is registered and verified
          setCurrentStep("success");
          toast.success("Device registered successfully");
          onSuccess?.(result);
        }
      }
    } catch (error: any) {
      setError(error.message || "Failed to register device");
      toast.error("Registration failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setError("Verification code is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await verifyDevice(
        registeredDevice._id,
        verificationCode
      );

      if (success) {
        setCurrentStep("success");
        toast.success("Device verified successfully");
        onSuccess?.(registeredDevice);
      } else {
        setError("Invalid verification code");
      }
    } catch (error: any) {
      setError(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/devices/${registeredDevice._id}/resend-verification`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success("Verification code sent");
        setResendCooldown(60); // 60 second cooldown
      } else {
        throw new Error("Failed to resend verification code");
      }
    } catch (error) {
      toast.error("Failed to resend verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    const iconClass = "h-6 w-6";
    switch (type) {
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

  const canRegisterDevice = deviceLimitInfo?.canAdd !== false;

  if (!canRegisterDevice && showLimitWarning) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDevicesPlus className="h-5 w-5" />
            Register New Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DeviceLimitWarning variant="card" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <IconDevicesPlus className="h-5 w-5" />
            Register New Device
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <IconX className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Registration Progress</span>
            <span>
              {currentStep === "device-info" && "1/3"}
              {currentStep === "verification" && "2/3"}
              {currentStep === "success" && "3/3"}
            </span>
          </div>
          <Progress
            value={
              currentStep === "device-info"
                ? 33
                : currentStep === "verification"
                ? 66
                : 100
            }
            className="h-2"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Device Limit Warning */}
        {showLimitWarning &&
          deviceLimitInfo &&
          deviceLimitInfo.remaining <= 2 && (
            <DeviceLimitWarning variant="inline" />
          )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Device Information */}
        {currentStep === "device-info" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                placeholder="e.g., John's MacBook Pro"
                value={deviceInfo.deviceName}
                onChange={(e) =>
                  setDeviceInfo((prev) => ({
                    ...prev,
                    deviceName: e.target.value,
                  }))
                }
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Choose a name to easily identify this device
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <Select
                value={deviceInfo.deviceType}
                onValueChange={(value: any) =>
                  setDeviceInfo((prev) => ({ ...prev, deviceType: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">
                    <div className="flex items-center gap-2">
                      <MonitorIcon className="h-4 w-4" />
                      Web Browser
                    </div>
                  </SelectItem>
                  <SelectItem value="desktop">
                    <div className="flex items-center gap-2">
                      <IconDeviceDesktop className="h-4 w-4" />
                      Desktop App
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile">
                    <div className="flex items-center gap-2">
                      <SmartphoneIcon className="h-4 w-4" />
                      Mobile Phone
                    </div>
                  </SelectItem>
                  <SelectItem value="tablet">
                    <div className="flex items-center gap-2">
                      <Table2Icon className="h-4 w-4" />
                      Tablet
                    </div>
                  </SelectItem>
                  <SelectItem value="tv">
                    <div className="flex items-center gap-2">
                      <Tv2Icon className="h-4 w-4" />
                      Smart TV
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <IconDevicesPlus className="h-4 w-4" />
                      Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Detected Information */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium">Detected Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Platform:</span>
                  <div className="font-medium">
                    {deviceInfo.platform || "Unknown"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Browser:</span>
                  <div className="font-medium">
                    {deviceInfo.browser || "N/A"}
                  </div>
                </div>
                {deviceInfo.metadata?.screenResolution && (
                  <div>
                    <span className="text-muted-foreground">Resolution:</span>
                    <div className="font-medium">
                      {deviceInfo.metadata.screenResolution}
                    </div>
                  </div>
                )}
                {deviceInfo.metadata?.language && (
                  <div>
                    <span className="text-muted-foreground">Language:</span>
                    <div className="font-medium">
                      {deviceInfo.metadata.language}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleDeviceRegistration}
              disabled={isLoading || !deviceInfo.deviceName.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                  Registering Device...
                </>
              ) : (
                <>
                  <IconDevicesPlus className="h-4 w-4 mr-2" />
                  Register Device
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Verification */}
        {currentStep === "verification" && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                <IconMail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Check Your Email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a verification code to <strong>{user?.email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <div className="relative">
                <IconKey className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="verificationCode"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  disabled={isLoading}
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleVerification}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <IconShield className="h-4 w-4 mr-2" />
                    Verify Device
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={isLoading || resendCooldown > 0}
                className="w-full"
              >
                {resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <IconRefresh className="h-4 w-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep("device-info")}
              >
                Back to Device Info
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === "success" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit">
              <IconCheck className="h-8 w-8 text-green-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Device Registered Successfully!
              </h3>
              <p className="text-muted-foreground">
                Your device has been verified and is now ready to use.
              </p>
            </div>

            {registeredDevice && (
              <div className="p-4 border rounded-lg text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {getDeviceIcon(registeredDevice.deviceType)}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {registeredDevice.deviceName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {FormatUtils.capitalize(registeredDevice.deviceType)} •{" "}
                      {registeredDevice.platform}
                    </p>
                  </div>
                  <Badge variant="default" className="ml-auto">
                    <IconShield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => onSuccess?.(registeredDevice)}
                className="flex-1"
              >
                Continue
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Quick registration component for new devices
export function QuickDeviceRegistration({
  onSuccess,
  className,
}: Pick<DeviceRegistrationProps, "onSuccess" | "className">) {
  return (
    <DeviceRegistration
      onSuccess={onSuccess}
      autoDetect={true}
      showLimitWarning={false}
      className={className}
    />
  );
}
