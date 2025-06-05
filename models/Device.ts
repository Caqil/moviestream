
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IDevice extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  deviceName: string;
  deviceType: 'web' | 'mobile' | 'tablet' | 'tv' | 'desktop' | 'other';
  deviceId: string; // Unique device identifier (fingerprint)
  platform: string; // Windows, macOS, iOS, Android, etc.
  browser?: string; // Chrome, Safari, Firefox, etc.
  osVersion?: string;
  ipAddress: string;
  userAgent: string;
  isVerified: boolean;
  isTrusted: boolean; // Admin can mark devices as trusted
  isBlocked: boolean;
  lastUsed: Date;
  registeredAt: Date;
  location?: {
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
  };
  metadata: {
    screenResolution?: string;
    colorDepth?: number;
    language?: string;
    cookiesEnabled?: boolean;
    javaEnabled?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  deviceType: {
    type: String,
    enum: ['web', 'mobile', 'tablet', 'tv', 'desktop', 'other'],
    required: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    type: String,
    required: true
  },
  browser: {
    type: String,
    default: null
  },
  osVersion: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isTrusted: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastUsed: {
    type: Date,
    required: true,
    default: Date.now
  },
  registeredAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  location: {
    country: {
      type: String,
      default: null
    },
    city: {
      type: String,
      default: null
    },
    region: {
      type: String,
      default: null
    },
    timezone: {
      type: String,
      default: null
    }
  },
  metadata: {
    screenResolution: {
      type: String,
      default: null
    },
    colorDepth: {
      type: Number,
      default: null
    },
    language: {
      type: String,
      default: null
    },
    cookiesEnabled: {
      type: Boolean,
      default: null
    },
    javaEnabled: {
      type: Boolean,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes
deviceSchema.index({ userId: 1 });
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ userId: 1, deviceType: 1 });
deviceSchema.index({ isBlocked: 1 });
deviceSchema.index({ lastUsed: -1 });
deviceSchema.index({ registeredAt: -1 });

export const Device: Model<IDevice> = mongoose.models.Device || mongoose.model<IDevice>('Device', deviceSchema);
