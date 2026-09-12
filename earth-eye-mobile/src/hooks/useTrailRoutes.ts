/**
 * useTrailRoutes.ts — Mission 16: real trail route geometry.
 *
 * Route polylines extracted from OpenStreetMap (Overpass API), matched to
 * atlas trails, served over the same CDN bridge as the atlas (Mission 13C).
 * Read-only, zero auth. Bundled copy ships inside the app for offline-first
 * use; the CDN copy is refreshed when network is available.
 *
 * Attribution: (c) OpenStreetMap contributors, ODbL.
 */
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bundledRoutes from '@/atlas/trail_routes.json';

export const TRAIL_ROUTES_URL = 'https://base44.app/api/apps/69dffe15eb268f56342f8e58/files/mp/public/69dffe15eb268f56342f8e58/162a34ec1_trail_routes.json';
export const ROUTES_ATTRIBUTION = 'Route data (c) OpenStreetMap contributors';

const CACHE_KEY = 'earthEye.trailRoutes.v2';
const CACHE_TS_KEY = 'earthEye.trailRoutes.ts.v2';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type RouteSegment = { name: string; coords: [number, number][] }; // [lat, lng]

export type TrailRoutes = {
  name: string;
  polylines: RouteSegment[];
  pointCount?: number;
};

type RoutesPayload = {
  version: number;
  generated: string;
  source: string;
  attribution: string;
  routes: Record<string, TrailRoutes>;
};

function payloadFromBundled(): RoutesPayload {
  const b = bundledRoutes as unknown as RoutesPayload;
  return b && b.routes && Object.keys(b.routes).length > 0 ? b : { version: 0, generated: '', source: 'bundled', attribution: ROUTES_ATTRIBUTION, routes: {} };
}

let _cache: RoutesPayload | null = null;
let _promise: Promise<RoutesPayload> | null = null;

function loadRoutes(): Promise<RoutesPayload> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;

  _promise = (async () => {
    // 1. Fresh CDN copy
    try {
      const res = await fetch(TRAIL_ROUTES_URL, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const payload = (await res.json()) as RoutesPayload;
        if (payload?.routes && Object.keys(payload.routes).length > 0) {
          _cache = payload;
          try {
            await AsyncStorage.multiSet([
              [CACHE_KEY, JSON.stringify(payload)],
              [CACHE_TS_KEY, String(Date.now())],
            ]);
          } catch { /* non-fatal */ }
          return payload;
        }
      }
    } catch { /* network unavailable — fall through */ }

    // 2. AsyncStorage copy (TTL-agnostic when offline)
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RoutesPayload;
        if (parsed?.routes && Object.keys(parsed.routes).length > 0) {
          _cache = parsed;
          return parsed;
        }
      }
    } catch { /* non-fatal */ }

    // 3. Bundled copy — always present, works fully offline
    _cache = payloadFromBundled();
    return _cache;
  })();

  return _promise;
}

/** Hook: the full routes payload (all mapped trails). Null until loaded. */
export function useTrailRoutes(): RoutesPayload | null {
  const [payload, setPayload] = useState<RoutesPayload | null>(_cache ?? null);
  useEffect(() => {
    let cancelled = false;
    if (_cache) { setPayload(_cache); return; }
    loadRoutes().then((p) => { if (!cancelled) setPayload(p); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return payload;
}

/** Direct (non-hook) accessor for the geometry layer. */
export async function getRoutesForTrail(trailId: string | undefined): Promise<TrailRoutes | null> {
  if (!trailId) return null;
  const p = await loadRoutes();
  return p.routes[trailId] ?? null;
}
