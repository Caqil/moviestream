
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  _id: string;
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
  videoQuality: 'HD' | 'Full HD' | '4K';
  deviceLimit: number; // Maximum devices allowed per account
  simultaneousStreams: number; // Max concurrent streams
  downloadAllowed: boolean;
  offlineViewing: boolean;
  adsSupported: boolean;
  trialDays: number;
  deviceFeatures: {
    allowMobile: boolean;
    allowTV: boolean;
    allowWeb: boolean;
    allowTablet: boolean;
    allowDesktop: boolean;
    deviceKickEnabled: boolean; // Allow kicking other devices
    autoVerifyTrusted: boolean; // Auto-verify trusted device types
  };
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true
  },
  interval: {
    type: String,
    enum: ['month', 'year'],
    required: true
  },
  intervalCount: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  features: [{
    type: String,
    required: true
  }],
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stripePriceId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripeProductId: {
    type: String,
    unique: true,
    sparse: true
  },
  maxStreams: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  videoQuality: {
    type: String,
    enum: ['HD', 'Full HD', '4K'],
    required: true,
    default: 'HD'
  },
  deviceLimit: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 999 // 999 means unlimited
  },
  simultaneousStreams: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  downloadAllowed: {
    type: Boolean,
    default: false
  },
  offlineViewing: {
    type: Boolean,
    default: false
  },
  adsSupported: {
    type: Boolean,
    default: true
  },
  trialDays: {
    type: Number,
    default: 0,
    min: 0
  },
  deviceFeatures: {
    allowMobile: {
      type: Boolean,
      default: true
    },
    allowTV: {
      type: Boolean,
      default: true
    },
    allowWeb: {
      type: Boolean,
      default: true
    },
    allowTablet: {
      type: Boolean,
      default: true
    },
    allowDesktop: {
      type: Boolean,
      default: true
    },
    deviceKickEnabled: {
      type: Boolean,
      default: false
    },
    autoVerifyTrusted: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
subscriptionPlanSchema.index({ isActive: 1 });
subscriptionPlanSchema.index({ stripePriceId: 1 });
subscriptionPlanSchema.index({ price: 1 });

export const SubscriptionPlan: Model<ISubscriptionPlan> = mongoose.models.SubscriptionPlan || mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);
