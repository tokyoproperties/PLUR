/**
 * hooks/useFieldConstellation.ts -- Arc 24
 *
 * React hook wrapping the field constellation engine.
 * The slowest layer in the stack -- memoized on chapters and soul only.
 * Reweight emphasis is also consumed, but only when it changes.
 */
import { useMemo } from 'react';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { useFieldReweight } from '@/hooks/useFieldReweight';
import { evaluateFieldConstellation, type FieldConstellation } from '@/atlas/fieldConstellation';

export type { FieldConstellation, ConstellationArchetype, ConstellationTone } from '@/atlas/fieldConstellation';

export function useFieldConstellation(): FieldConstellation {
  const memory   = useFieldMemory();
  const soul     = useFieldSoul();
  const reweight = useFieldReweight();

  return useMemo(
    () => evaluateFieldConstellation(memory, soul, reweight.emphasis),
    // Slowest layer: only recompute when chapters, soul, or reweight emphasis shifts
    [memory.chapters, memory.totalMoments, soul.isRevealed, soul.traits, reweight.emphasis]
  );
}
