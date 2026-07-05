/**
 * useSeasonalProfile.ts
 *
 * Wraps the seasonal evaluator with atlas data.
 * Returns a memoized SeasonalProfile derived from the current
 * date and accumulated Field Moments.
 */

import { useMemo } from 'react';

import { evaluateSeasonalProfile, type SeasonalProfile } from '@/atlas/seasonalProfile';
import { useAtlas } from '@/atlas/useAtlas';

export type { SeasonalProfile } from '@/atlas/seasonalProfile';

export function useSeasonalProfile(): SeasonalProfile {
  const atlas = useAtlas();
  return useMemo(
    () => evaluateSeasonalProfile(atlas.moments, new Date()),
    [atlas.moments]
  );
}
