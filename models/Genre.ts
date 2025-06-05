
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGenre extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  tmdbId?: number;
  movieCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const genreSchema = new Schema<IGenre>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tmdbId: {
    type: Number,
    default: null
  },
  movieCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
genreSchema.index({ slug: 1 });
genreSchema.index({ isActive: 1 });
genreSchema.index({ tmdbId: 1 });

export const Genre: Model<IGenre> = mongoose.models.Genre || mongoose.model<IGenre>('Genre', genreSchema);