/**
 * useLocation.ts
 * User device location hook.
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The FieldDataProvider instantiates the internal version once.
 */

import { useContext, useEffect, useState } from 'react';

import { LocationContext } from '@/contexts/field-data-context';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface UseLocationResult {
  location: UserLocation | null;
  permissionStatus: string | null;
  isLoading: boolean;
}

// Internal — only called by FieldDataProvider
export function useLocationInternal(): UseLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let sub: { remove: () => void } | null = null;

    async function init() {
      try {
        const Location = await import('expo-location');
        if (cancelled) return;

        const { status } = await Location.requestForegroundPermissionsAsync();
        setPermissionStatus(status);
        if (status !== 'granted') return;

        setIsLoading(true);
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
        });

        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 10 },
          (pos: { coords: { latitude: number; longitude: number; accuracy?: number | null } }) => {
            if (cancelled) return;
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy ?? null,
            });
          }
        );
      } catch {
        // expo-location not installed or permission denied — degrade gracefully
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, []);

  return { location, permissionStatus, isLoading };
}

// Consumer — reads from context
export function useLocation(): UseLocationResult {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within FieldDataProvider');
  return ctx;
}
