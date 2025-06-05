import { Types } from 'mongoose';

export interface SubscriptionPlan {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  stripePriceId?: string;
  stripeProductId?: string;
  maxStreams: number;
  deviceLimit: number;
  simultaneousStreams: number;
  videoQuality: 'HD' | 'Full HD' | '4K';
  downloadAllowed: boolean;
  offlineViewing: boolean;
  adsSupported: boolean;
  trialDays: number;
  deviceFeatures: DeviceFeatures;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceFeatures {
  allowMobile: boolean;
  allowTV: boolean;
  allowWeb: boolean;
  allowTablet: boolean;
  allowDesktop: boolean;
  deviceKickEnabled: boolean;
  autoVerifyTrusted: boolean;
}

export interface CreatePlanRequest {
  name: string;
  description: string;
  price: number;
  currency?: string;
  interval: 'month' | 'year';
  features: string[];
  deviceLimit: number;
  simultaneousStreams: number;
  videoQuality: 'HD' | 'Full HD' | '4K';
  deviceFeatures: DeviceFeatures;
  trialDays?: number;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  features?: string[];
  deviceLimit?: number;
  simultaneousStreams?: number;
  videoQuality?: 'HD' | 'Full HD' | '4K';
  deviceFeatures?: Partial<DeviceFeatures>;
  isActive?: boolean;
  isPopular?: boolean;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  trialSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  churnRate: number;
  averageRevenuePerUser: number;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
  planId: Types.ObjectId;
  customerId?: string;
}

