/**
 * useCorridors.ts
 * Fetches REAL trail data from the live EarthEye backend.
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The FieldDataProvider instantiates the internal version once.
 */

import { useContext, useEffect, useState } from 'react';

import { CorridorsContext } from '@/contexts/field-data-contexts';

const API_BASE = 'https://special-agent-44-342f8e58.base44.app/functions/getAtlasData';

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
        const res = await fetch(`${API_BASE}?entity=Trail`);
        if (!res.ok) throw new Error(`getAtlasData responded ${res.status}`);
        const data: unknown = await res.json();
        if (cancelled) return;
        if (!Array.isArray(data)) throw new Error('Unexpected response shape');

        const active = data
          .filter((t): t is Record<string, unknown> => !!t && typeof t === 'object')
          .filter((t) => !t.archived)
          .filter((t) => typeof t.lat === 'number' && typeof t.lng === 'number')
          .map((t) => ({
            id: String(t.id),
            name: String(t.name ?? 'Unnamed trail'),
            lat: t.lat as number,
            lng: t.lng as number,
            difficulty: typeof t.difficulty === 'string' ? t.difficulty : undefined,
            jurisdiction: typeof t.jurisdiction === 'string' ? t.jurisdiction : undefined,
          }));

        setTrails(active);
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
