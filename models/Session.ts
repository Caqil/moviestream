
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  deviceId: Types.ObjectId;
  sessionToken: string;
  movieId?: Types.ObjectId; // Currently watching movie
  isActive: boolean;
  startTime: Date;
  lastActivity: Date;
  endTime?: Date;
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  streamingData?: {
    quality: string;
    bitrate: number;
    bufferHealth: number;
    errors: number;
    startupTime: number; // ms to start streaming
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true
  },
  movieId: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
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
    }
  },
  streamingData: {
    quality: {
      type: String,
      default: null
    },
    bitrate: {
      type: Number,
      default: null
    },
    bufferHealth: {
      type: Number,
      default: null
    },
    errors: {
      type: Number,
      default: 0
    },
    startupTime: {
      type: Number,
      default: null
    }
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// Indexes
sessionSchema.index({ userId: 1 });
sessionSchema.index({ deviceId: 1 });
sessionSchema.index({ sessionToken: 1 });
sessionSchema.index({ isActive: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ lastActivity: -1 });

export const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', sessionSchema);