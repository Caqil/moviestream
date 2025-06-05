import { Types } from 'mongoose';

export interface Movie {
  _id: Types.ObjectId;
  title: string;
  originalTitle?: string;
  overview: string;
  tagline?: string;
  poster: string;
  backdrop: string;
  trailer?: string;
  videoUrl: string;
  genres: Types.ObjectId[];
  rating: number;
  imdbRating?: number;
  releaseDate: Date;
  duration: number;
  language: string;
  country: string;
  director?: string;
  cast: string[];
  keywords: string[];
  isActive: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  tmdbId?: number;
  imdbId?: string;
  views: number;
  likes: number;
  dislikes: number;
  subtitles: Types.ObjectId[];
  videoMetadata: VideoMetadata;
  s3Metadata: S3Metadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoMetadata {
  fileSize: number;
  format: string;
  resolution: string;
  bitrate: number;
  codec: string;
  audioCodec: string;
}

export interface S3Metadata {
  bucket: string;
  key: string;
  region: string;
  contentType: string;
}

export interface Genre {
  _id: Types.ObjectId;
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

export interface Subtitle {
  _id: Types.ObjectId;
  movieId: Types.ObjectId;
  language: string;
  languageCode: string;
  label: string;
  url: string;
  isDefault: boolean;
  isForced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMovieRequest {
  title: string;
  overview: string;
  poster: string;
  backdrop: string;
  videoUrl: string;
  genres: Types.ObjectId[];
  releaseDate: Date;
  duration: number;
  language?: string;
  country?: string;
  director?: string;
  cast?: string[];
  isPremium?: boolean;
  tmdbId?: number;
}

export interface UpdateMovieRequest {
  title?: string;
  overview?: string;
  poster?: string;
  backdrop?: string;
  trailer?: string;
  genres?: Types.ObjectId[];
  director?: string;
  cast?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
}

export interface MovieSearchFilters {
  query?: string;
  genre?: string;
  year?: number;
  rating?: number;
  quality?: string;
  sortBy?: 'title' | 'releaseDate' | 'rating' | 'views';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: TMDBGenre[];
  spoken_languages: TMDBLanguage[];
  production_countries: TMDBCountry[];
  imdb_id: string;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBLanguage {
  iso_639_1: string;
  name: string;
}

export interface TMDBCountry {
  iso_3166_1: string;
  name: string;
}