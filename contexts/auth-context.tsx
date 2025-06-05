"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";
import { useDevices } from "@/hooks/use-devices";
import { AuthUser, Device } from "@/types";

interface AuthContextType {
  // User state
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSubscriber: boolean;
  isLoading: boolean;
  error: string | null;

  // Device state
  currentDevice: Device | null;
  devices: Device[];
  deviceCount: number;

  // Auth actions
  login: (credentials: any) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  loginWithApple: () => void;
  updateProfile: (data: any) => Promise<boolean>;

  // Device actions
  registerCurrentDevice: () => Promise<Device | null>;
  verifyDevice: (deviceId: string, code: string) => Promise<boolean>;
  removeDevice: (deviceId: string) => Promise<boolean>;

  // Utilities
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const devices = useDevices();
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);

  // Register current device on login
  const registerCurrentDevice = async () => {
    if (!auth.isAuthenticated) return null;

    const deviceInfo = devices.getCurrentDevice();
    const result = await devices.registerDevice(deviceInfo);

    if (result) {
      setCurrentDevice(result);
      return result;
    }

    return null;
  };

  // Enhanced login with device registration
  const enhancedLogin = async (credentials: any) => {
    const success = await auth.login({
      ...credentials,
      deviceInfo: devices.getCurrentDevice(),
    });

    if (success) {
      await registerCurrentDevice();
    }

    return success;
  };

  // Enhanced register with device registration
  const enhancedRegister = async (data: any) => {
    const success = await auth.register({
      ...data,
      deviceInfo: devices.getCurrentDevice(),
    });

    if (success) {
      await registerCurrentDevice();
    }

    return success;
  };

  // Refresh user data
  const refreshUser = async () => {
    await devices.fetchDevices();
  };

  // Find current device from devices list
  useEffect(() => {
    if (devices.devices.length > 0) {
      const current = devices.devices.find((device) => {
        const currentDeviceInfo = devices.getCurrentDevice();
        return (
          device.platform === currentDeviceInfo.platform &&
          device.deviceType === currentDeviceInfo.deviceType
        );
      });
      setCurrentDevice(current || null);
    }
  }, [devices.devices]);

  const contextValue: AuthContextType = {
    // User state
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    isSubscriber: auth.isSubscriber,
    isLoading: auth.isLoading || devices.isLoading,
    error: auth.error || devices.error,

    // Device state
    currentDevice,
    devices: devices.devices,
    deviceCount: devices.devices.length,

    // Auth actions
    login: enhancedLogin,
    register: enhancedRegister,
    logout: auth.logout,
    loginWithGoogle: auth.loginWithGoogle,
    loginWithApple: auth.loginWithApple,
    updateProfile: auth.updateProfile,

    // Device actions
    registerCurrentDevice,
    verifyDevice: devices.verifyDevice,
    removeDevice: devices.removeDevice,

    // Utilities
    clearError: () => {
      auth.clearError();
      devices.clearError();
    },
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
