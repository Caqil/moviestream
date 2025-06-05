"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuthContext } from "./auth-context";
import { SubscriptionPlan, CheckoutSession } from "@/types";

interface SubscriptionContextType {
  // Subscription state
  plans: SubscriptionPlan[];
  currentPlan: SubscriptionPlan | null;
  subscription: any;
  isSubscribed: boolean;
  isTrialing: boolean;
  isCanceled: boolean;
  isExpired: boolean;
  subscriptionStatus: string;
  daysRemaining: number;
  isLoading: boolean;
  error: string | null;

  // Device & stream limits
  deviceLimitInfo: {
    canAdd: boolean;
    remaining: number;
    limit?: number;
  };
  streamLimitInfo: {
    canStream: boolean;
    remaining: number;
    limit: number;
  };

  // Actions
  subscribe: (planId: string) => Promise<CheckoutSession | null>;
  cancelSubscription: () => Promise<boolean>;
  refreshPlans: () => Promise<void>;
  checkAccess: (movieId?: string) => Promise<boolean>;

  // Utilities
  clearError: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const subscription = useSubscription();
  const { user, deviceCount, isAuthenticated } = useAuthContext();
  const [activeStreams, setActiveStreams] = useState(0);

  // Get device limit info
  const deviceLimitInfo = subscription.currentPlan
    ? subscription.checkDeviceLimit(subscription.currentPlan, deviceCount)
    : { canAdd: false, remaining: 0 };

  // Get stream limit info
  const streamLimitInfo = subscription.currentPlan
    ? subscription.checkStreamLimit(subscription.currentPlan, activeStreams)
    : { canStream: false, remaining: 0, limit: 0 };

  // Enhanced subscribe function
  const subscribe = async (planId: string): Promise<CheckoutSession | null> => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }

    return await subscription.createCheckoutSession(planId);
  };

  // Check access to content
  const checkAccess = async (movieId?: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    if (user?.role === "admin") return true;

    // If no specific movie, just check if user has active subscription
    if (!movieId) return subscription.isSubscribed;

    try {
      const response = await fetch(`/api/movies/${movieId}/access`);
      const data = await response.json();
      return data.hasAccess;
    } catch (error) {
      return false;
    }
  };

  // Fetch active streams count
  const fetchActiveStreams = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch("/api/sessions/active");
      if (response.ok) {
        const data = await response.json();
        setActiveStreams(data.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch active streams:", error);
    }
  };

  // Refresh active streams periodically
  useEffect(() => {
    if (isAuthenticated) {
      fetchActiveStreams();

      const interval = setInterval(fetchActiveStreams, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const contextValue: SubscriptionContextType = {
    // Subscription state
    plans: subscription.plans,
    currentPlan: subscription.currentPlan,
    subscription: subscription.subscription,
    isSubscribed: subscription.isSubscribed,
    isTrialing: subscription.isTrialing,
    isCanceled: subscription.isCanceled,
    isExpired: subscription.isExpired,
    subscriptionStatus: subscription.subscriptionStatus,
    daysRemaining: subscription.daysRemaining,
    isLoading: subscription.isLoading,
    error: subscription.error,

    // Limits
    deviceLimitInfo,
    streamLimitInfo,

    // Actions
    subscribe,
    cancelSubscription: subscription.cancelSubscription,
    refreshPlans: subscription.fetchPlans,
    checkAccess,

    // Utilities
    clearError: subscription.clearError,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscriptionContext must be used within a SubscriptionProvider"
    );
  }
  return context;
}