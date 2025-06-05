
import { Settings } from '@/models/Settings';
import { connectToDatabase } from './db';

interface TMDBConfig {
  apiKey: string;
  baseUrl: string;
  imageBaseUrl: string;
}

let tmdbConfig: TMDBConfig | null = null;

export async function initializeTMDB(): Promise<void> {
  await connectToDatabase();
  const settings = await Settings.findOne();
  
  if (!settings?.tmdb.isEnabled || !settings.tmdb.apiKey) {
    throw new Error('TMDB is not configured or enabled');
  }

  tmdbConfig = {
    apiKey: settings.tmdb.apiKey,
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p',
  };
}

function getTMDBConfig(): TMDBConfig {
  if (!tmdbConfig) {
    throw new Error('TMDB not initialized. Call initializeTMDB() first.');
  }
  return tmdbConfig;
}

async function tmdbRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  const config = getTMDBConfig();
  
  const url = new URL(`${config.baseUrl}${endpoint}`);
  url.searchParams.append('api_key', config.apiKey);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

export const TMDBService = {
  async searchMovies(query: string, page: number = 1): Promise<any> {
    return await tmdbRequest('/search/movie', { query, page });
  },

  async getMovie(id: number): Promise<any> {
    return await tmdbRequest(`/movie/${id}`, { append_to_response: 'credits,videos' });
  },

  async getPopularMovies(page: number = 1): Promise<any> {
    return await tmdbRequest('/movie/popular', { page });
  },

  async getTopRatedMovies(page: number = 1): Promise<any> {
    return await tmdbRequest('/movie/top_rated', { page });
  },

  async getUpcomingMovies(page: number = 1): Promise<any> {
    return await tmdbRequest('/movie/upcoming', { page });
  },

  async getNowPlayingMovies(page: number = 1): Promise<any> {
    return await tmdbRequest('/movie/now_playing', { page });
  },

  async getMovieGenres(): Promise<any> {
    return await tmdbRequest('/genre/movie/list');
  },

  async discoverMovies(params: Record<string, any> = {}): Promise<any> {
    return await tmdbRequest('/discover/movie', params);
  },

  getImageUrl(path: string, size: string = 'w500'): string {
    const config = getTMDBConfig();
    return `${config.imageBaseUrl}/${size}${path}`;
  },

  getBackdropUrl(path: string, size: string = 'w1280'): string {
    const config = getTMDBConfig();
    return `${config.imageBaseUrl}/${size}${path}`;
  },
};

