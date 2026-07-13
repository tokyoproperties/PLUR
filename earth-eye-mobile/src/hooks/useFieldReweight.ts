/**
 * hooks/useFieldReweight.ts -- Arc 23
 *
 * React hook wrapping the field reweight engine.
 * Reads from long-term memory and soul only -- this is the slow layer.
 * Intentionally does NOT consume alignment/presence/initiative/branch
 * on every render; those are the fast layer. Reweight only changes
 * when memory chapters or soul traits change.
 */
import { useMemo } from 'react';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { evaluateFieldReweight, type FieldReweight } from '@/atlas/fieldReweight';

export type { FieldReweight, ReweightSignal, ReweightEmphasis } from '@/atlas/fieldReweight';

export function useFieldReweight(): FieldReweight {
  const memory = useFieldMemory();
  const soul   = useFieldSoul();

  return useMemo(
    () => evaluateFieldReweight(memory, soul),
    // Only recompute when chapters or soul traits change -- not on every moment
    [memory.chapters, memory.totalMoments, soul.isEstablished, soul.isRevealed, soul.traits]
  );
}
