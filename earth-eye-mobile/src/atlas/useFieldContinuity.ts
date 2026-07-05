/**
 * useFieldContinuity.ts
 *
 * Wraps the continuity evaluator with field memory data.
 * Returns a memoized FieldContinuity derived from accumulated
 * chapters, species history, and corridor history.
 */

import { useMemo } from 'react';

import { evaluateFieldContinuity, type FieldContinuity } from '@/atlas/fieldContinuity';
import { useFieldMemory } from '@/atlas/useFieldMemory';

export type {
  FieldContinuity, ContinuityArc, SpeciesContinuity,
  SpeciesContinuityRecord, DriftContinuity, HabitatContinuity,
} from '@/atlas/fieldContinuity';

export function useFieldContinuity(): FieldContinuity {
  const memory = useFieldMemory();
  return useMemo(() => evaluateFieldContinuity(memory), [memory]);
}
