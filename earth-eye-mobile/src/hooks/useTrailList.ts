/**
 * useTrailList.ts — Mission 15
 *
 * Loads 74-trail atlas from CDN, applies client-side filter + sort.
 * Normalizes difficulty/heatRisk casing from source data.
 */
import { useEffect, useMemo, useState } from 'react';
import { loadTrails, type AtlasTrail } from '@/atlas/atlasApi';

export type TrailFilter = {
  search:     string;
  difficulty: string | null;   // null = all
  sort:       'alpha' | 'distance' | 'elevation' | 'difficulty' | 'seasonal';
};

export type UseTrailListResult = {
  trails:     AtlasTrail[];
  loading:    boolean;
  error:      string | null;
  totalCount: number;
};

export const DIFFICULTY_ORDER: Record<string, number> = {
  easy: 0, moderate: 1, hard: 2, strenuous: 3,
};

export function normDifficulty(d?: string): string {
  return d?.toLowerCase().trim() ?? 'unknown';
}

export function normHeatRisk(h?: string): string {
  return h?.toLowerCase().trim() ?? 'unknown';
}

function getCurrentSeason(): string {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

export function useTrailList(filter: TrailFilter): UseTrailListResult {
  const [all, setAll]       = useState<AtlasTrail[]>([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoad(true);
    loadTrails()
      .then((d) => { if (!cancelled) { setAll(d); setLoad(false); } })
      .catch((e) => { if (!cancelled) { setError(e?.message ?? 'Atlas unavailable'); setLoad(false); } });
    return () => { cancelled = true; };
  }, []);

  const trails = useMemo(() => {
    let result = all;

    if (filter.difficulty) {
      result = result.filter((t) => normDifficulty(t.difficulty) === filter.difficulty);
    }

    if (filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      result = result.filter(
        (t) => t.name.toLowerCase().includes(q) ||
               (t.jurisdiction?.toLowerCase().includes(q) ?? false)
      );
    }

    const season = getCurrentSeason();
    result = [...result].sort((a, b) => {
      switch (filter.sort) {
        case 'distance':
          return (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0);
        case 'elevation':
          return (b.elevationGain ?? 0) - (a.elevationGain ?? 0);
        case 'difficulty':
          return (DIFFICULTY_ORDER[normDifficulty(a.difficulty)] ?? 1) -
                 (DIFFICULTY_ORDER[normDifficulty(b.difficulty)] ?? 1);
        case 'seasonal': {
          const aCond = a.seasonalConditions?.toLowerCase().includes(season) ? 0 : 1;
          const bCond = b.seasonalConditions?.toLowerCase().includes(season) ? 0 : 1;
          if (aCond !== bCond) return aCond - bCond;
          return a.name.localeCompare(b.name);
        }
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [all, filter.search, filter.difficulty, filter.sort]);

  return { trails, loading, error, totalCount: all.length };
}
