/**
 * useCorridors.ts
 * Fetches REAL trail data from the live EarthEye backend — the same
 * getAtlasData endpoint the web app (PLUR) uses. This is not stub
 * geometry: it's the actual 74 active trails from the production
 * database, each with a real single-point lat/lng (trailhead
 * location, not a full path).
 *
 * NOTE ON SCOPE: the DB currently stores one coordinate per trail,
 * not a walked GPS path. So "corridors" render as markers, not
 * polylines, until real path-tracing data exists. Calling this
 * "Trail" data rather than "Corridor" polylines is the honest name
 * for what's actually there.
 */

import { useEffect, useState } from 'react';

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

interface UseCorridorsResult {
  trails: TrailMarker[];
  isLoading: boolean;
  error: string | null;
}

export function useCorridors(): UseCorridorsResult {
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
