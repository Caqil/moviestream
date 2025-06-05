
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { useAuthContext } from "./auth-context";
import { AdminSettings, DashboardStats, UpdateSettingsRequest } from "@/types";

interface AdminContextType {
  // State
  settings: AdminSettings | null;
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;

  // Settings management
  updateSettings: (updates: UpdateSettingsRequest) => Promise<boolean>;
  testService: (
    service: "tmdb" | "stripe" | "s3" | "email"
  ) => Promise<boolean>;

  // Content management
  importFromTMDB: (tmdbId: number) => Promise<any>;
  bulkAction: (action: any) => Promise<any>;

  // System operations
  refreshSettings: () => Promise<void>;
  refreshStats: () => Promise<void>;

  // Service status
  serviceStatus: {
    tmdb: boolean;
    stripe: boolean;
    s3: boolean;
    email: boolean;
  };

  // Utilities
  clearError: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const admin = useAdmin();
  const { isAdmin } = useAuthContext();
  const [serviceStatus, setServiceStatus] = useState({
    tmdb: false,
    stripe: false,
    s3: false,
    email: false,
  });

  // Test all services on mount and when settings change
  const testAllServices = async () => {
    if (!isAdmin || !admin.settings) return;

    const services = ["tmdb", "stripe", "s3", "email"] as const;
    const results = await Promise.allSettled(
      services.map((service) => admin.testService(service))
    );

    const newStatus = { ...serviceStatus };
    results.forEach((result, index) => {
      newStatus[services[index]] =
        result.status === "fulfilled" && result.value;
    });

    setServiceStatus(newStatus);
  };

  // Enhanced update settings with service testing
  const enhancedUpdateSettings = async (updates: UpdateSettingsRequest) => {
    const success = await admin.updateSettings(updates);

    if (success) {
      // Test affected services
      const affectedServices: Array<"tmdb" | "stripe" | "s3" | "email"> = [];

      if (updates.tmdb) affectedServices.push("tmdb");
      if (updates.stripe) affectedServices.push("stripe");
      if (updates.s3) affectedServices.push("s3");
      if (updates.email) affectedServices.push("email");

      // Test affected services
      for (const service of affectedServices) {
        const isWorking = await admin.testService(service);
        setServiceStatus((prev) => ({ ...prev, [service]: isWorking }));
      }
    }

    return success;
  };

  // Load initial data
  useEffect(() => {
    if (isAdmin) {
      admin.fetchSettings();
      admin.fetchStats();
    }
  }, [isAdmin]);

  // Test services when settings are loaded
  useEffect(() => {
    if (admin.settings) {
      testAllServices();
    }
  }, [admin.settings]);

  // Refresh stats periodically
  useEffect(() => {
    if (isAdmin) {
      const interval = setInterval(() => {
        admin.fetchStats();
      }, 60000); // Every minute

      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const contextValue: AdminContextType = {
    // State
    settings: admin.settings,
    stats: admin.stats,
    isLoading: admin.isLoading,
    error: admin.error,
    isAdmin: admin.isAdmin,

    // Settings management
    updateSettings: enhancedUpdateSettings,
    testService: admin.testService,

    // Content management
    importFromTMDB: admin.importFromTMDB,
    bulkAction: admin.bulkAction,

    // System operations
    refreshSettings: admin.fetchSettings,
    refreshStats: admin.fetchStats,

    // Service status
    serviceStatus,

    // Utilities
    clearError: admin.clearError,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
}
