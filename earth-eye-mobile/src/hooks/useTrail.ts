/**
 * useTrail.ts — Mission 15
 * Single trail by ID, module-level cache shared with list hook.
 */
import { useEffect, useMemo, useState } from 'react';
import { loadTrails, type AtlasTrail } from '@/atlas/atlasApi';

let _cache: AtlasTrail[] | null = null;
let _promise: Promise<AtlasTrail[]> | null = null;

function getTrails(): Promise<AtlasTrail[]> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = loadTrails().then((d) => { _cache = d; return d; });
  return _promise;
}

export type UseTrailResult = {
  trail:   AtlasTrail | null;
  loading: boolean;
  error:   string | null;
};

export function useTrail(id: string): UseTrailResult {
  const [all, setAll]     = useState<AtlasTrail[]>(_cache ?? []);
  const [loading, setLoad] = useState(_cache === null);
  const [error, setError]  = useState<string | null>(null);

  useEffect(() => {
    if (_cache) { setAll(_cache); setLoad(false); return; }
    let cancelled = false;
    getTrails()
      .then((d) => { if (!cancelled) { setAll(d); setLoad(false); } })
      .catch((e) => { if (!cancelled) { setError(e?.message ?? 'Atlas unavailable'); setLoad(false); } });
    return () => { cancelled = true; };
  }, []);

  const trail = useMemo(() => all.find((t) => t.id === id) ?? null, [all, id]);
  return { trail, loading, error };
}

// Stubs for Mission 16+
export function useNearbyTrails(_location: unknown): AtlasTrail[]   { return []; }
export function useSeasonalTrails(_season: string): AtlasTrail[]    { return []; }
export function useTrailHotspots(_id: string): string[]             { return []; }
