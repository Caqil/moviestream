import { useState, useCallback, useEffect } from 'react';
import { Movie, Genre, SearchRequest, PaginatedResponse } from '@/types';

export function useSearch() {
  const [results, setResults] = useState<Movie[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const search = useCallback(async (searchParams: SearchRequest) => {
    if (!searchParams.query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/movies/search?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data: PaginatedResponse<Movie> = await response.json();
      setResults(data.data);
      setPagination(data.pagination);

      // Add to recent searches
      addToRecentSearches(searchParams.query);
      
      return data;
    } catch (error) {
      setError('Search failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (!response.ok) return;
      
      const data = await response.json();
      setSuggestions(data.data || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  }, []);

  const addToRecentSearches = useCallback((query: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== query);
      const updated = [query, ...filtered].slice(0, 10); // Keep last 10 searches
      localStorage.setItem('moviestream_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('moviestream_recent_searches');
  }, []);

  const getTrending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/search/trending');
      if (!response.ok) throw new Error('Failed to fetch trending');
      
      const data = await response.json();
      return data.data as string[];
    } catch (error) {
      setError('Failed to load trending searches');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('moviestream_recent_searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  return {
    results,
    suggestions,
    recentSearches,
    pagination,
    isLoading,
    error,
    search,
    searchSuggestions,
    getTrending,
    addToRecentSearches,
    clearRecentSearches,
    clearResults: () => setResults([]),
    clearError: () => setError(null),
  };
}
