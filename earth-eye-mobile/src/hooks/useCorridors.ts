/**
 * useCorridors.ts
 * Fetches REAL trail data from the static CDN atlas (Mission 13C).
 *
 * Previously pointed at getAtlasData backend function — replaced with
 * loadTrails() from atlasApi.ts which reads from media.base44.com CDN.
 * 24h TTL cache + offline fallback built into loadTrails().
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The FieldDataProvider instantiates the internal version once.
 */

import { useContext, useEffect, useState } from 'react';

import { loadTrails } from '@/atlas/atlasApi';
import { CorridorsContext } from '@/contexts/field-data-contexts';

export interface TrailMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  difficulty?: string;
  jurisdiction?: string;
  archived?: boolean;
}

export interface UseCorridorsResult {
  trails: TrailMarker[];
  isLoading: boolean;
  error: string | null;
}

// Internal — only called by FieldDataProvider
export function useCorridorsInternal(): UseCorridorsResult {
  const [trails, setTrails] = useState<TrailMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await loadTrails(); // CDN → 74 active trails, cached 24h

        if (cancelled) return;

        // Filter to trails with valid GPS coordinates for map rendering
        const mapped = data
          .filter((t) => typeof t.lat === 'number' && typeof t.lng === 'number')
          .map((t) => ({
            id: t.id,
            name: t.name,
            lat: t.lat as number,
            lng: t.lng as number,
            difficulty: t.difficulty,
            jurisdiction: t.jurisdiction,
          }));

        setTrails(mapped);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load trails');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { trails, isLoading, error };
}

// Consumer — reads from context
export function useCorridors(): UseCorridorsResult {
  const ctx = useContext(CorridorsContext);
  if (!ctx) throw new Error('useCorridors must be used within FieldDataProvider');
  return ctx;
}
