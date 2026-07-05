/**
 * useFieldLore.ts
 *
 * Wraps the lore evaluator with mythology, continuity, memory,
 * and current seasonal phase.
 */

import { useMemo } from 'react';

import { evaluateFieldLore, type FieldLore } from '@/atlas/fieldLore';
import { useFieldMythology } from '@/atlas/useFieldMythology';
import { useFieldContinuity } from '@/atlas/useFieldContinuity';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';

export type { FieldLore, LoreFragment, LoreCategory, SpeciesLoreChip } from '@/atlas/fieldLore';

export function useFieldLore(): FieldLore {
  const mythology = useFieldMythology();
  const continuity = useFieldContinuity();
  const memory = useFieldMemory();
  const seasonal = useSeasonalProfile();

  return useMemo(
    () => evaluateFieldLore(mythology, continuity, memory, seasonal.phase),
    [mythology, continuity, memory, seasonal.phase]
  );
}
