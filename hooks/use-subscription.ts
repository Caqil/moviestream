import { useState, useEffect, useCallback } from 'react';
import { SubscriptionPlan, CheckoutSession, SubscriptionStats } from '@/types';
import { useAuth } from './use-auth';

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscription = user?.subscription;
  const isSubscribed = subscription?.status === 'active';
  const isTrialing = subscription?.status === 'trial';
  const isCanceled = subscription?.status === 'canceled';
  const isExpired = subscription?.status === 'expired';

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/subscriptions/plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      
      const data = await response.json();
      setPlans(data.data || []);
    } catch (error) {
      setError('Failed to load subscription plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentPlan = useCallback(async () => {
    if (!subscription?.planId) return;
    
    try {
      const plan = plans.find(p => p._id === subscription.planId);
      setCurrentPlan(plan || null);
    } catch (error) {
      console.error('Failed to fetch current plan:', error);
    }
  }, [subscription, plans]);

  const createCheckoutSession = useCallback(async (planId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');
      
      const data = await response.json();
      return data.data as CheckoutSession;
    } catch (error) {
      setError('Failed to start checkout');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async () => {
    if (!subscription?.stripeSubscriptionId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.stripeSubscriptionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');
      
      return true;
    } catch (error) {
      setError('Failed to cancel subscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  const checkDeviceLimit = useCallback((plan: SubscriptionPlan, currentDeviceCount: number) => {
    if (plan.deviceLimit === 999) return { canAdd: true, remaining: Infinity };
    
    const remaining = plan.deviceLimit - currentDeviceCount;
    return {
      canAdd: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: plan.deviceLimit,
    };
  }, []);

  const checkStreamLimit = useCallback((plan: SubscriptionPlan, currentStreams: number) => {
    const remaining = plan.simultaneousStreams - currentStreams;
    return {
      canStream: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: plan.simultaneousStreams,
    };
  }, []);

  const getSubscriptionStatus = useCallback(() => {
    if (!subscription) return 'none';
    
    const now = new Date();
    const endDate = new Date(subscription.currentPeriodEnd);
    
    if (subscription.status === 'active' && endDate > now) return 'active';
    if (subscription.status === 'trial') return 'trial';
    if (subscription.status === 'canceled') return 'canceled';
    if (endDate <= now) return 'expired';
    
    return subscription.status;
  }, [subscription]);

  const getDaysRemaining = useCallback(() => {
    if (!subscription?.currentPeriodEnd) return 0;
    
    const now = new Date();
    const endDate = new Date(subscription.currentPeriodEnd);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }, [subscription]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    fetchCurrentPlan();
  }, [fetchCurrentPlan]);

  return {
    plans,
    currentPlan,
    subscription,
    stats,
    isSubscribed,
    isTrialing,
    isCanceled,
    isExpired,
    isLoading,
    error,
    subscriptionStatus: getSubscriptionStatus(),
    daysRemaining: getDaysRemaining(),
    fetchPlans,
    createCheckoutSession,
    cancelSubscription,
    checkDeviceLimit,
    checkStreamLimit,
    clearError: () => setError(null),
  };
}

