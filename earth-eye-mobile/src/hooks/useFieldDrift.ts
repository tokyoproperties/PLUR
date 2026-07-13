/**
 * hooks/useFieldDrift.ts -- Arc 25
 *
 * React hook wrapping the field drift engine.
 * Reads the raw moments ring directly so it can split it into
 * early/late halves. This is intentional -- drift needs the temporal
 * order of moments, which the derived FieldMemory does not preserve
 * per-moment (it groups by phase).
 *
 * Memoized on ring length only -- drift only changes when new moments
 * are added, and at 20+ moments it changes very slowly.
 */
import { useMemo } from 'react';
import { useAtlas } from '@/atlas/useAtlas';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { evaluateFieldDrift, type FieldDrift } from '@/atlas/fieldDrift';

export type { FieldDrift, DriftDirection, DriftStability } from '@/atlas/fieldDrift';

export function useFieldDrift(): FieldDrift {
  const atlas  = useAtlas();
  const memory = useFieldMemory();
  const soul   = useFieldSoul();

  return useMemo(
    () => evaluateFieldDrift(atlas.moments, memory, soul),
    // Only recompute when ring size changes -- drift is the slowest signal
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [atlas.moments.length, memory.chapters.length, soul.isRevealed]
  );
}
