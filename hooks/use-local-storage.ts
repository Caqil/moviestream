
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Set value in localStorage and state
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// Specialized localStorage hooks
export function useUserPreferences() {
  return useLocalStorage('moviestream_user_preferences', {
    theme: 'dark',
    language: 'en',
    autoplay: true,
    videoQuality: 'auto',
    subtitleLanguage: null,
  });
}

export function useWatchHistory() {
  return useLocalStorage('moviestream_watch_history', []);
}

export function usePlayerSettings() {
  return useLocalStorage('moviestream_player_settings', {
    volume: 1,
    playbackRate: 1,
    subtitlesEnabled: false,
    autoplay: true,
    theaterMode: false,
  });
}