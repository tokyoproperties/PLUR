/**
 * useTrailGeometry.ts — Mission 15
 *
 * Trails have lat/lng center points only (no polyline in the exported data).
 * Returns a map-ready coordinate for the preview pin.
 * Stub ready for Mission 16 when polyline data is added.
 */
import { useMemo } from 'react';
import type { AtlasTrail } from '@/atlas/atlasApi';

export type TrailGeometry = {
  center: { latitude: number; longitude: number } | null;
  // polyline stub for Mission 16
  polyline: { latitude: number; longitude: number }[] | null;
};

export function useTrailGeometry(trail: AtlasTrail | null): TrailGeometry {
  return useMemo(() => {
    if (!trail?.lat || !trail?.lng) return { center: null, polyline: null };
    return {
      center: { latitude: trail.lat, longitude: trail.lng },
      polyline: null, // Mission 16: add polyline decode here
    };
  }, [trail?.lat, trail?.lng]);
}
