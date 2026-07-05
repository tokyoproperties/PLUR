/**
 * useFieldMemory.ts
 *
 * Wraps the field memory evaluator with atlas + seasonal data.
 * Returns a memoized FieldMemory derived from accumulated moments
 * and the current seasonal phase.
 */

import { useMemo } from 'react';

import { evaluateFieldMemory, type FieldMemory } from '@/atlas/fieldMemory';
import { useAtlas } from '@/atlas/useAtlas';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';

export type { FieldMemory, SeasonalChapter, SpeciesFrequency } from '@/atlas/fieldMemory';

export function useFieldMemory(): FieldMemory {
  const atlas = useAtlas();
  const seasonal = useSeasonalProfile();

  return useMemo(
    () => evaluateFieldMemory(atlas.moments, seasonal.phase),
    [atlas.moments, seasonal.phase]
  );
}
