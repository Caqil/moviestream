import { useState, useEffect, useCallback } from 'react';
import { Device, RegisterDeviceRequest, DeviceStats } from '@/types';
import { useAuth } from './use-auth';

export function useDevices() {
  const { isAuthenticated } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/devices');
      if (!response.ok) throw new Error('Failed to fetch devices');
      
      const data = await response.json();
      setDevices(data.data || []);
    } catch (error) {
      setError('Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const registerDevice = useCallback(async (deviceData: RegisterDeviceRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Device registration failed');
      }

      const result = await response.json();
      await fetchDevices(); // Refresh devices list
      return result.data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Device registration failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchDevices]);

  const verifyDevice = useCallback(async (deviceId: string, code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/devices/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, verificationCode: code }),
      });

      if (!response.ok) throw new Error('Device verification failed');
      
      await fetchDevices(); // Refresh devices list
      return true;
    } catch (error) {
      setError('Device verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchDevices]);

  const removeDevice = useCallback(async (deviceId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove device');
      
      await fetchDevices(); // Refresh devices list
      return true;
    } catch (error) {
      setError('Failed to remove device');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchDevices]);

  const blockDevice = useCallback(async (deviceId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/devices/${deviceId}/block`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to block device');
      
      await fetchDevices(); // Refresh devices list
      return true;
    } catch (error) {
      setError('Failed to block device');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchDevices]);

  const getCurrentDevice = useCallback(() => {
    // Get current device info from browser
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    let deviceType: 'web' | 'mobile' | 'tablet' | 'tv' | 'desktop' = 'web';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    } else if (/Smart TV|TV/.test(userAgent)) {
      deviceType = 'tv';
    } else if (!/Chrome|Firefox|Safari|Edge/.test(userAgent)) {
      deviceType = 'desktop';
    }

    return {
      deviceName: `${platform} Device`,
      deviceType,
      platform,
      userAgent,
      metadata: {
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
      }
    };
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    stats,
    isLoading,
    error,
    fetchDevices,
    registerDevice,
    verifyDevice,
    removeDevice,
    blockDevice,
    getCurrentDevice,
    clearError: () => setError(null),
  };
}
