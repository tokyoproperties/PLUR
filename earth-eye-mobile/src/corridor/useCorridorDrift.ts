/**
 * useCorridorDrift.ts
 *
 * Wraps the drift evaluator with atlas + seasonal data.
 * Returns a memoized CorridorDrift derived from accumulated
 * Field Moments and the current seasonal phase.
 */

import { useMemo } from 'react';

import { evaluateCorridorDrift, type CorridorDrift } from '@/corridor/drift';
import { useAtlas } from '@/atlas/useAtlas';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';

export type { CorridorDrift, DriftDirection, DriftCharacter, DriftConfidence } from '@/corridor/drift';

export function useCorridorDrift(): CorridorDrift {
  const atlas = useAtlas();
  const seasonal = useSeasonalProfile();

  return useMemo(
    () => evaluateCorridorDrift(atlas.moments, seasonal.phase, new Date()),
    [atlas.moments, seasonal.phase]
  );
}
