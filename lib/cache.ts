
interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number;
  }
  
  class InMemoryCache {
    private cache = new Map<string, CacheItem<any>>();
    private cleanupInterval: NodeJS.Timeout | null = null;
  
    constructor() {
      this.startCleanup();
    }
  
    set<T>(key: string, value: T, ttlSeconds: number = 3600): void {
      this.cache.set(key, {
        data: value,
        timestamp: Date.now(),
        ttl: ttlSeconds * 1000,
      });
    }
  
    get<T>(key: string): T | null {
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }
  
      if (Date.now() - item.timestamp > item.ttl) {
        this.cache.delete(key);
        return null;
      }
  
      return item.data;
    }
  
    delete(key: string): void {
      this.cache.delete(key);
    }
  
    clear(): void {
      this.cache.clear();
    }
  
    keys(): string[] {
      return Array.from(this.cache.keys());
    }
  
    size(): number {
      return this.cache.size;
    }
  
    private startCleanup(): void {
      if (this.cleanupInterval) return;
  
      this.cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
          if (now - item.timestamp > item.ttl) {
            this.cache.delete(key);
          }
        }
      }, 60000); // Cleanup every minute
    }
  
    destroy(): void {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
      this.clear();
    }
  }
  
  export const cache = new InMemoryCache();
  
  // Cache helper functions
  export const CacheService = {
    async getOrSet<T>(
      key: string,
      fetcher: () => Promise<T>,
      ttlSeconds: number = 3600
    ): Promise<T> {
      const cached = cache.get<T>(key);
      if (cached) {
        return cached;
      }
  
      const data = await fetcher();
      cache.set(key, data, ttlSeconds);
      return data;
    },
  
    invalidatePattern(pattern: string): void {
      const keys = cache.keys();
      const regex = new RegExp(pattern);
      
      keys.forEach(key => {
        if (regex.test(key)) {
          cache.delete(key);
        }
      });
    },
  
    warmCache(): void {
      // Warm frequently accessed data
      // This could be called on application startup
    },
  };
  