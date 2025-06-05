
import { useState, useCallback } from 'react';
import { AdminSettings, DashboardStats, UpdateSettingsRequest, BulkActionRequest } from '@/types';
import { useAuth } from './use-auth';

export function useAdmin() {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(data.data);
    } catch (error) {
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const updateSettings = useCallback(async (updates: UpdateSettingsRequest) => {
    if (!isAdmin) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update settings');
      
      await fetchSettings(); // Refresh settings
      return true;
    } catch (error) {
      setError('Failed to update settings');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, fetchSettings]);

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      setError('Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const bulkAction = useCallback(async (action: BulkActionRequest) => {
    if (!isAdmin) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });

      if (!response.ok) throw new Error('Bulk action failed');
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      setError('Bulk action failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const importFromTMDB = useCallback(async (tmdbId: number) => {
    if (!isAdmin) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/movies/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId }),
      });

      if (!response.ok) throw new Error('TMDB import failed');
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      setError('Failed to import from TMDB');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const testService = useCallback(async (service: 'tmdb' | 'stripe' | 's3' | 'email') => {
    if (!isAdmin) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/test/${service}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error(`${service} test failed`);
      
      return true;
    } catch (error) {
      setError(`Failed to test ${service} connection`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  return {
    settings,
    stats,
    isLoading,
    error,
    isAdmin,
    fetchSettings,
    updateSettings,
    fetchStats,
    bulkAction,
    importFromTMDB,
    testService,
    clearError: () => setError(null),
  };
}
