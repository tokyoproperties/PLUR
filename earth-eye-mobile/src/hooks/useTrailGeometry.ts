/**
 * useTrailGeometry.ts — Mission 15/16
 *
 * Mission 15: center point from the trail record.
 * Mission 16 (Sep 12 2026): REAL route geometry from OpenStreetMap,
 * matched per trail ID via useTrailRoutes. `segments` now carries the
 * actual mapped path of the trail; `polyline` stays null (legacy field).
 */
import { useEffect, useMemo, useState } from 'react';
import type { AtlasTrail } from '@/atlas/atlasApi';
import { getRoutesForTrail, ROUTES_ATTRIBUTION } from '@/hooks/useTrailRoutes';

export type TrailGeometry = {
  center: { latitude: number; longitude: number } | null;
  /** Legacy stub — still null. */
  polyline: { latitude: number; longitude: number }[] | null;
  /** Mission 16: real route segments, each a list of map-ready points. */
  segments: { latitude: number; longitude: number }[][];
  /** True when the trail has a mapped route in the atlas. */
  hasRoute: boolean;
  attribution: string | null;
};

export function useTrailGeometry(trail: AtlasTrail | null): TrailGeometry {
  const [route, setRoute] = useState<Awaited<ReturnType<typeof getRoutesForTrail>>>(null);

  useEffect(() => {
    let cancelled = false;
    setRoute(null);
    if (!trail?.id) return;
    getRoutesForTrail(trail.id)
      .then((r) => { if (!cancelled) setRoute(r); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [trail?.id]);

  return useMemo(() => {
    if (!trail?.lat || !trail?.lng) {
      return { center: null, polyline: null, segments: [], hasRoute: false, attribution: null };
    }
    return {
      center: { latitude: trail.lat, longitude: trail.lng },
      polyline: null,
      segments: (route?.polylines ?? []).map((seg) =>
        seg.coords.map(([lat, lng]) => ({ latitude: lat, longitude: lng }))
      ),
      hasRoute: !!route,
      attribution: route ? ROUTES_ATTRIBUTION : null,
    };
  }, [trail?.lat, trail?.lng, route]);
}
