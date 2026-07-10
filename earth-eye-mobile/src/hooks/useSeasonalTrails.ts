/**
 * useSeasonalTrails.ts — Mission 17
 *
 * Trails scored by current-season relevance.
 * Score = seasonal conditions mention + heat risk inverse + difficulty.
 * Used by Field module "Best trail right now."
 */
import { useMemo } from 'react';
import { useSeason } from '@/hooks/useSeason';
import { normDifficulty, normHeatRisk } from '@/hooks/useTrailList';
import type { AtlasTrail } from '@/atlas/atlasApi';

const HEAT_PENALTY: Record<string, number> = {
  low: 0, moderate: 0.2, medium: 0.2, high: 0.5,
};
const DIFF_WEIGHT: Record<string, number> = {
  easy: 0.3, moderate: 0.5, hard: 0.4, strenuous: 0.2,
};

export type ScoredTrail = AtlasTrail & { seasonScore: number; seasonBadge: string | null };

function getSeasonBadge(trail: AtlasTrail, season: string): string | null {
  const cond = trail.seasonalConditions?.toLowerCase() ?? '';
  if (!cond) return null;
  if (season === 'summer' && cond.includes('heat'))      return 'Heat advisory';
  if (season === 'summer' && trail.heatRisk?.toLowerCase() === 'high') return 'High heat';
  if (season === 'winter' && cond.includes('mud'))       return 'Mud risk';
  if (season === 'spring' && cond.includes('wildflower')) return 'Wildflower peak';
  if (season === 'fall'   && cond.includes('visibility')) return 'Best visibility';
  return null;
}

export function useSeasonalTrails(trails: AtlasTrail[], limit = 10): ScoredTrail[] {
  const { season, tempBand } = useSeason();
  return useMemo(() => {
    return [...trails]
      .map((t) => {
        const cond   = t.seasonalConditions?.toLowerCase() ?? '';
        const mention = cond.includes(season) ? 0.5 : 0.0;
        const heat   = HEAT_PENALTY[normHeatRisk(t.heatRisk)] ?? 0;
        // In summer + hot: penalise exposed high-heat trails more
        const heatAdj = (season === 'summer' && tempBand === 'hot') ? heat * 2 : heat;
        const diff    = DIFF_WEIGHT[normDifficulty(t.difficulty)] ?? 0.3;
        const score   = mention + diff - heatAdj;
        return { ...t, seasonScore: score, seasonBadge: getSeasonBadge(t, season) };
      })
      .sort((a, b) => b.seasonScore - a.seasonScore)
      .slice(0, limit);
  }, [trails, season, tempBand, limit]);
}
