/**
 * useFieldSoul.ts
 *
 * Wraps the soul evaluator with all accumulated layers.
 * The soul is the convergence of everything — spirit, continuity,
 * memory, mythology, lore, and seasonal phase.
 */

import { useMemo } from 'react';

import { evaluateFieldSoul, type FieldSoul } from '@/atlas/fieldSoul';
import { useFieldSpirit } from '@/atlas/useFieldSpirit';
import { useFieldContinuity } from '@/atlas/useFieldContinuity';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldMythology } from '@/atlas/useFieldMythology';
import { useFieldLore } from '@/atlas/useFieldLore';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';

export type { FieldSoul, SoulType, RootTone, RootMovement, SoulTrait } from '@/atlas/fieldSoul';

export function useFieldSoul(): FieldSoul {
  const spirit = useFieldSpirit();
  const continuity = useFieldContinuity();
  const memory = useFieldMemory();
  const mythology = useFieldMythology();
  const lore = useFieldLore();
  const seasonal = useSeasonalProfile();

  return useMemo(
    () => evaluateFieldSoul(spirit, continuity, memory, mythology, lore, seasonal.phase),
    [spirit, continuity, memory, mythology, lore, seasonal.phase]
  );
}
