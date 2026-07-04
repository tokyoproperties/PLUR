/**
 * useLocation.ts
 * User device location hook for future map integration.
 *
 * Wraps expo-location with permission handling. Returns null coords
 * until permission is granted — screens should handle the null case
 * gracefully (the map already centers on the yard or trail cluster
 * as fallback).
 *
 * NOT YET INTEGRATED into map.tsx — this is prep for Phase III when
 * we want a "you are here" blue dot. Safe to import; won't request
 * permission until called.
 *
 * NOTE: expo-location is in package.json but may not be installed in
 * all environments. The dynamic import guards against this.
 */

import { useEffect, useState } from 'react';

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

export function useLocation(): UseLocationResult {
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
