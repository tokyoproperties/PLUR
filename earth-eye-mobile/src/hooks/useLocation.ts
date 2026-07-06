/**
 * useLocation.ts
 * User device location hook.
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The FieldDataProvider instantiates the internal version once.
 *
 * CALIBRATED July 6 2026 (Mission 2 — Corridor Engine Stability):
 * `accuracy` was already captured from expo-location on every fix but
 * never actually used anywhere downstream — every fix was trusted
 * equally regardless of GPS signal quality. Now exposes a `confidence`
 * derived from (a) the fix's own reported accuracy and (b) how long
 * ago it arrived. A lightweight 10s ticker (plain JS interval, not a
 * native bridge subscription) recomputes staleness even while sitting
 * on an old fix with no new GPS update — otherwise confidence would
 * only ever change at fix-time and could stay "high" forever on a fix
 * that's actually gone stale.
 */

import { useEffect, useMemo, useRef, useState, useContext } from 'react';

import { LocationContext } from '@/contexts/field-data-contexts';
import { classifyLocationConfidence, type LocationConfidence } from '@/utils/thresholds';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  /** Timestamp (ms) this fix was received — used to detect staleness. */
  timestamp: number;
}

export interface UseLocationResult {
  location: UserLocation | null;
  /** Derived from the fix's accuracy + how long ago it arrived. 'uncertain' once a fix goes stale with no update. */
  confidence: LocationConfidence;
  permissionStatus: string | null;
  isLoading: boolean;
}

// How often the staleness ticker re-checks fix age when no new GPS
// update has arrived. Cheap — plain setInterval, not a sensor listener.
const STALENESS_CHECK_INTERVAL_MS = 10000;

// Internal — only called by FieldDataProvider
export function useLocationInternal(): UseLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Ticks forward on a plain interval so confidence can degrade due to
  // staleness even without a new fix arriving to trigger a re-render.
  const [staleTick, setStaleTick] = useState(0);
  const locationRef = useRef<UserLocation | null>(null);

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
        const fix: UserLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
          timestamp: Date.now(),
        };
        locationRef.current = fix;
        setLocation(fix);

        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 10 },
          (pos: { coords: { latitude: number; longitude: number; accuracy?: number | null } }) => {
            if (cancelled) return;
            const nextFix: UserLocation = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy ?? null,
              timestamp: Date.now(),
            };
            locationRef.current = nextFix;
            setLocation(nextFix);
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

  // Staleness ticker — cheap JS-side interval, no native bridge traffic.
  useEffect(() => {
    const interval = setInterval(() => {
      // Only bother re-rendering if we actually have a fix to stale-check.
      if (locationRef.current) setStaleTick((t) => t + 1);
    }, STALENESS_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const confidence = useMemo<LocationConfidence>(() => {
    if (!location) return 'uncertain';
    const ageMs = Date.now() - location.timestamp;
    return classifyLocationConfidence(location.accuracy, ageMs);
    // staleTick is intentionally a dependency even though unused directly —
    // it's what forces this memo to recompute as a stale fix ages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, staleTick]);

  return { location, confidence, permissionStatus, isLoading };
}

// Consumer — reads from context
export function useLocation(): UseLocationResult {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within FieldDataProvider');
  return ctx;
}
