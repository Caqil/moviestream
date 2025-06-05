import { useState, useEffect, useCallback } from 'react';
import { Movie, Genre, MovieSearchFilters } from '@/types';
import { PaginatedResponse } from '@/types/api';

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(async (filters: MovieSearchFilters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/movies?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch movies');
      
      const data: PaginatedResponse<Movie> = await response.json();
      setMovies(data.data);
      return data;
    } catch (error) {
      setError('Failed to load movies');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchGenres = useCallback(async () => {
    try {
      const response = await fetch('/api/genres');
      if (!response.ok) throw new Error('Failed to fetch genres');
      
      const data = await response.json();
      setGenres(data.data || []);
    } catch (error) {
      setError('Failed to load genres');
    }
  }, []);

  const fetchFeaturedMovies = useCallback(async () => {
    try {
      const response = await fetch('/api/movies?featured=true&limit=10');
      if (!response.ok) throw new Error('Failed to fetch featured movies');
      
      const data = await response.json();
      setFeaturedMovies(data.data || []);
    } catch (error) {
      setError('Failed to load featured movies');
    }
  }, []);

  const fetchPopularMovies = useCallback(async () => {
    try {
      const response = await fetch('/api/movies?sortBy=views&limit=20');
      if (!response.ok) throw new Error('Failed to fetch popular movies');
      
      const data = await response.json();
      setPopularMovies(data.data || []);
    } catch (error) {
      setError('Failed to load popular movies');
    }
  }, []);

  const getMovie = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/movies/${id}`);
      if (!response.ok) throw new Error('Movie not found');
      
      const data = await response.json();
      return data.data as Movie;
    } catch (error) {
      setError('Failed to load movie');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToWatchlist = useCallback(async (movieId: string) => {
    try {
      const response = await fetch('/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId }),
      });

      if (!response.ok) throw new Error('Failed to add to watchlist');
      return true;
    } catch (error) {
      setError('Failed to add to watchlist');
      return false;
    }
  }, []);

  const removeFromWatchlist = useCallback(async (movieId: string) => {
    try {
      const response = await fetch(`/api/user/watchlist/${movieId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove from watchlist');
      return true;
    } catch (error) {
      setError('Failed to remove from watchlist');
      return false;
    }
  }, []);

  const rateMovie = useCallback(async (movieId: string, rating: number) => {
    try {
      const response = await fetch(`/api/movies/${movieId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) throw new Error('Failed to rate movie');
      return true;
    } catch (error) {
      setError('Failed to rate movie');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchGenres();
    fetchFeaturedMovies();
    fetchPopularMovies();
  }, [fetchGenres, fetchFeaturedMovies, fetchPopularMovies]);

  return {
    movies,
    genres,
    featuredMovies,
    popularMovies,
    isLoading,
    error,
    fetchMovies,
    getMovie,
    addToWatchlist,
    removeFromWatchlist,
    rateMovie,
    refreshFeatured: fetchFeaturedMovies,
    refreshPopular: fetchPopularMovies,
    clearError: () => setError(null),
  };
}

