import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IWatchHistory extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  deviceId: Types.ObjectId; // Device used for watching
  sessionId: Types.ObjectId; // Session ID for this watch
  watchedAt: Date;
  progress: number; // Percentage watched (0-100)
  duration: number; // Total movie duration in seconds
  watchTime: number; // Time watched in seconds
  completed: boolean;
  lastPosition: number; // Last watched position in seconds
  device: string; // Device type (web, mobile, tv, etc.)
  ipAddress?: string;
  userAgent?: string;
  quality: string; // Video quality watched
  subtitleLanguage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const watchHistorySchema = new Schema<IWatchHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  watchedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  watchTime: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastPosition: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  device: {
    type: String,
    required: true,
    default: 'web'
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  quality: {
    type: String,
    required: true,
    default: 'auto'
  },
  subtitleLanguage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
watchHistorySchema.index({ userId: 1 });
watchHistorySchema.index({ movieId: 1 });
watchHistorySchema.index({ deviceId: 1 });
watchHistorySchema.index({ sessionId: 1 });
watchHistorySchema.index({ userId: 1, movieId: 1 });
watchHistorySchema.index({ userId: 1, deviceId: 1 });
watchHistorySchema.index({ watchedAt: -1 });
watchHistorySchema.index({ userId: 1, watchedAt: -1 });

export const WatchHistory: Model<IWatchHistory> = mongoose.models.WatchHistory || mongoose.model<IWatchHistory>('WatchHistory', watchHistorySchema);
