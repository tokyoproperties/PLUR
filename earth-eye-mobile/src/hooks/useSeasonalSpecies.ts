/**
 * useSeasonalSpecies.ts — Mission 17
 *
 * Species sorted by seasonal relevance score.
 * Score = active this season (1.0) + abundance weight.
 * Used by Field module "Best species right now" and Home season card.
 */
import { useMemo } from 'react';
import { useSeason } from '@/hooks/useSeason';
import type { AtlasSpecies } from '@/atlas/atlasApi';

const ABUNDANCE_WEIGHT: Record<string, number> = {
  abundant: 1.0, common: 0.7, uncommon: 0.4, rare: 0.2,
};

export type ScoredSpecies = AtlasSpecies & { seasonScore: number };

export function scoreSpecies(sp: AtlasSpecies, season: string): number {
  const seasonKey = season === 'spring' ? 'SPR'
    : season === 'summer' ? 'SUM'
    : season === 'fall'   ? 'FAL'
    : 'WIN';
  const active  = sp.seasonPresence?.includes(seasonKey) ? 1.0 : 0.0;
  const abund   = ABUNDANCE_WEIGHT[sp.frequency?.toLowerCase() ?? ''] ?? 0.3;
  return active + abund;
}

export function useSeasonalSpecies(species: AtlasSpecies[], limit = 20): ScoredSpecies[] {
  const { season } = useSeason();
  return useMemo(() => {
    return [...species]
      .map((sp) => ({ ...sp, seasonScore: scoreSpecies(sp, season) }))
      .sort((a, b) => b.seasonScore - a.seasonScore)
      .slice(0, limit);
  }, [species, season, limit]);
}
