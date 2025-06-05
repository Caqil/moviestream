
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMovie extends Document {
  _id: string;
  title: string;
  originalTitle?: string;
  overview: string;
  tagline?: string;
  poster: string; // S3 URL
  backdrop: string; // S3 URL
  trailer?: string; // YouTube URL or S3 URL
  videoUrl: string; // S3 URL to main video file
  genres: string[]; // Genre IDs
  rating: number; // TMDB rating
  imdbRating?: number;
  releaseDate: Date;
  duration: number; // Duration in minutes
  language: string;
  country: string;
  director?: string;
  cast: string[];
  keywords: string[];
  isActive: boolean;
  isFeatured: boolean;
  isPremium: boolean; // Requires subscription
  tmdbId?: number;
  imdbId?: string;
  views: number;
  likes: number;
  dislikes: number;
  subtitles: string[]; // Subtitle IDs
  videoMetadata: {
    fileSize: number; // in bytes
    format: string; // mp4, mkv, etc.
    resolution: string; // 1920x1080, etc.
    bitrate: number; // in kbps
    codec: string; // h264, h265, etc.
    audioCodec: string; // aac, mp3, etc.
  };
  s3Metadata: {
    bucket: string;
    key: string;
    region: string;
    contentType: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalTitle: {
    type: String,
    default: null
  },
  overview: {
    type: String,
    required: true
  },
  tagline: {
    type: String,
    default: null
  },
  poster: {
    type: String,
    required: true
  },
  backdrop: {
    type: String,
    required: true
  },
  trailer: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    required: true
  },
  genres: [{
    type: Schema.Types.ObjectId,
    ref: 'Genre'
  }],
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  imdbRating: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  releaseDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  language: {
    type: String,
    required: true,
    default: 'en'
  },
  country: {
    type: String,
    required: true,
    default: 'US'
  },
  director: {
    type: String,
    default: null
  },
  cast: [{
    type: String
  }],
  keywords: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: true
  },
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true
  },
  imdbId: {
    type: String,
    unique: true,
    sparse: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  subtitles: [{
    type: Schema.Types.ObjectId,
    ref: 'Subtitle'
  }],
  videoMetadata: {
    fileSize: {
      type: Number,
      default: 0
    },
    format: {
      type: String,
      default: 'mp4'
    },
    resolution: {
      type: String,
      default: '1920x1080'
    },
    bitrate: {
      type: Number,
      default: 0
    },
    codec: {
      type: String,
      default: 'h264'
    },
    audioCodec: {
      type: String,
      default: 'aac'
    }
  },
  s3Metadata: {
    bucket: {
      type: String,
      required: true
    },
    key: {
      type: String,
      required: true
    },
    region: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      default: 'video/mp4'
    }
  }
}, {
  timestamps: true
});

// Indexes
movieSchema.index({ title: 'text', overview: 'text' });
movieSchema.index({ genres: 1 });
movieSchema.index({ isActive: 1 });
movieSchema.index({ isFeatured: 1 });
movieSchema.index({ isPremium: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ views: -1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ tmdbId: 1 });
movieSchema.index({ imdbId: 1 });

export const Movie: Model<IMovie> = mongoose.models.Movie || mongoose.model<IMovie>('Movie', movieSchema);
