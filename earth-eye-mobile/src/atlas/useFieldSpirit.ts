/**
 * useFieldSpirit.ts
 *
 * Wraps the spirit evaluator with all accumulated layers.
 * The spirit is the convergence of mythology, continuity,
 * memory, lore, and seasonal phase.
 */

import { useMemo } from 'react';

import { evaluateFieldSpirit, type FieldSpirit } from '@/atlas/fieldSpirit';
import { useFieldMythology } from '@/atlas/useFieldMythology';
import { useFieldContinuity } from '@/atlas/useFieldContinuity';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldLore } from '@/atlas/useFieldLore';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';

export type {
  FieldSpirit, SpiritType, SpiritTemperament, SpiritMovement,
  SpiritVoice, SpiritTrait,
} from '@/atlas/fieldSpirit';

export function useFieldSpirit(): FieldSpirit {
  const mythology = useFieldMythology();
  const continuity = useFieldContinuity();
  const memory = useFieldMemory();
  const lore = useFieldLore();
  const seasonal = useSeasonalProfile();

  return useMemo(
    () => evaluateFieldSpirit(mythology, continuity, memory, lore, seasonal.phase),
    [mythology, continuity, memory, lore, seasonal.phase]
  );
}
