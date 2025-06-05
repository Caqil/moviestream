import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISubtitle extends Document {
  _id: Types.ObjectId;
  movieId: Types.ObjectId;
  language: string;
  languageCode: string; // ISO 639-1 code (en, es, fr, etc.)
  label: string; // Display name
  url: string; // S3 URL to .vtt file
  isDefault: boolean;
  isForced: boolean; // For forced subtitles
  createdAt: Date;
  updatedAt: Date;
}

const subtitleSchema = new Schema<ISubtitle>({
  movieId: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  language: {
    type: String,
    required: true
  },
  languageCode: {
    type: String,
    required: true,
    lowercase: true
  },
  label: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isForced: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
subtitleSchema.index({ movieId: 1 });
subtitleSchema.index({ languageCode: 1 });
subtitleSchema.index({ movieId: 1, languageCode: 1 }, { unique: true });

export const Subtitle: Model<ISubtitle> = mongoose.models.Subtitle || mongoose.model<ISubtitle>('Subtitle', subtitleSchema);
