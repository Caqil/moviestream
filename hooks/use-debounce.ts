import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value by delaying updates until after
 * a specified delay period has passed without the value changing.
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-run effect when value or delay changes

  return debouncedValue;
}

/**
 * Advanced debounce hook with additional options
 */
export function useAdvancedDebounce<T>(
  value: T,
  delay: number,
  options: {
    leading?: boolean; // Fire on the leading edge
    trailing?: boolean; // Fire on the trailing edge (default)
    maxWait?: number; // Maximum time to wait
  } = {}
): T {
  const { leading = false, trailing = true, maxWait } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [lastCallTime, setLastCallTime] = useState<number>(0);

  useEffect(() => {
    const now = Date.now();
    setLastCallTime(now);

    let timeoutId: NodeJS.Timeout;
    let maxTimeoutId: NodeJS.Timeout;

    // Leading edge
    if (leading && (!lastCallTime || now - lastCallTime >= delay)) {
      setDebouncedValue(value);
    }

    // Trailing edge
    if (trailing) {
      timeoutId = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
    }

    // Max wait
    if (maxWait && now - lastCallTime >= maxWait) {
      setDebouncedValue(value);
    } else if (maxWait) {
      maxTimeoutId = setTimeout(() => {
        setDebouncedValue(value);
      }, maxWait - (now - lastCallTime));
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (maxTimeoutId) clearTimeout(maxTimeoutId);
    };
  }, [value, delay, leading, trailing, maxWait, lastCallTime]);

  return debouncedValue;
}

/**
 * Debounced callback hook - useful for debouncing function calls
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = ((...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  }) as T;

  // Cleanup on unmount or dependency change
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId, ...deps]);

  return debouncedCallback;
}

/**
 * Hook for debouncing async operations
 */
export function useAsyncDebounce<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  delay: number
): [T, boolean] {
  const [isLoading, setIsLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedAsyncFn = (async (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      const newTimeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          const result = await asyncFn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          setIsLoading(false);
        }
      }, delay);

      setTimeoutId(newTimeoutId);
    });
  }) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return [debouncedAsyncFn, isLoading];
}