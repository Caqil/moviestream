import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  name: string;
  image?: string;
  password?: string;
  role: 'admin' | 'subscriber' | 'guest';
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  preferences: {
    language: string;
    autoplay: boolean;
    videoQuality: 'auto' | '480p' | '720p' | '1080p' | '4k';
    subtitleLanguage?: string;
  };
  subscription?: {
    planId: string;
    status: 'active' | 'canceled' | 'expired' | 'trial';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  watchlist: string[]; // Movie IDs
  devices: string[]; // Device IDs
  activeSessions: number; // Current active streaming sessions
  deviceSettings: {
    autoApproveNewDevices: boolean;
    maxDeviceInactivityDays: number; // Auto-remove inactive devices
    requireDeviceVerification: boolean;
    allowDeviceSharing: boolean;
  };
  profile: {
    avatar?: string;
    bio?: string;
    country?: string;
    dateOfBirth?: Date;
    phone?: string;
  };
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'subscriber', 'guest'],
    default: 'guest'
  },
  emailVerified: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    videoQuality: {
      type: String,
      enum: ['auto', '480p', '720p', '1080p', '4k'],
      default: 'auto'
    },
    subtitleLanguage: {
      type: String,
      default: null
    }
  },
  subscription: {
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'expired', 'trial'],
      default: null
    },
    currentPeriodStart: {
      type: Date,
      default: null
    },
    currentPeriodEnd: {
      type: Date,
      default: null
    },
    stripeCustomerId: {
      type: String,
      default: null
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    }
  },
  watchlist: [{
    type: Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  devices: [{
    type: Schema.Types.ObjectId,
    ref: 'Device'
  }],
  activeSessions: {
    type: Number,
    default: 0,
    min: 0
  },
  deviceSettings: {
    autoApproveNewDevices: {
      type: Boolean,
      default: false
    },
    maxDeviceInactivityDays: {
      type: Number,
      default: 90,
      min: 1
    },
    requireDeviceVerification: {
      type: Boolean,
      default: true
    },
    allowDeviceSharing: {
      type: Boolean,
      default: false
    }
  },
  profile: {
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      default: null
    },
    country: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    phone: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ 'subscription.stripeCustomerId': 1 });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

