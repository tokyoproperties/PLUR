/**
 * useFieldMythology.ts
 *
 * Wraps the mythology evaluator with continuity + memory data.
 */

import { useMemo } from 'react';

import { evaluateFieldMythology, type FieldMythology } from '@/atlas/fieldMythology';
import { useFieldContinuity } from '@/atlas/useFieldContinuity';
import { useFieldMemory } from '@/atlas/useFieldMemory';

export type {
  FieldMythology, MythicArchetype, MythicArchetypeAssessment,
  SpeciesMythicRole, SeasonalMythology, DriftMythology, HabitatMythology,
} from '@/atlas/fieldMythology';

export function useFieldMythology(): FieldMythology {
  const continuity = useFieldContinuity();
  const memory = useFieldMemory();

  return useMemo(
    () => evaluateFieldMythology(continuity, memory),
    [continuity, memory]
  );
}
