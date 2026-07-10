/**
 * useSpecies.ts
 *
 * Returns a single species record by ID, memoized.
 * Safe for the detail screen — returns null while loading.
 */

import { useEffect, useMemo, useState } from 'react';

import { loadSpecies, type AtlasSpecies } from '@/atlas/atlasApi';

export type UseSpeciesResult = {
  species:  AtlasSpecies | null;
  loading:  boolean;
  error:    string | null;
};

// Module-level cache — species list is loaded once across all hook instances
let _cache: AtlasSpecies[] | null = null;
let _promise: Promise<AtlasSpecies[]> | null = null;

function getSpecies(): Promise<AtlasSpecies[]> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = loadSpecies().then((data) => {
    _cache = data;
    return data;
  });
  return _promise;
}

export function useSpecies(id: string): UseSpeciesResult {
  const [allSpecies, setAllSpecies] = useState<AtlasSpecies[]>(_cache ?? []);
  const [loading, setLoading]       = useState(_cache === null);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    if (_cache) { setAllSpecies(_cache); setLoading(false); return; }
    let cancelled = false;
    getSpecies()
      .then((data) => { if (!cancelled) { setAllSpecies(data); setLoading(false); } })
      .catch((e)   => { if (!cancelled) { setError(e?.message ?? 'Atlas unavailable'); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const species = useMemo(
    () => allSpecies.find((s) => s.id === id) ?? null,
    [allSpecies, id]
  );

  return { species, loading, error };
}

// Stubs for Mission 15+
export function useSimilarSpecies(_id: string): AtlasSpecies[]  { return []; }
export function useNearbySpecies(_location: unknown): AtlasSpecies[] { return []; }
export function useSeasonalSpecies(_season: string): AtlasSpecies[] { return []; }
