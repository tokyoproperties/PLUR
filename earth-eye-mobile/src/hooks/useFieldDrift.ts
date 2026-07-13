/**
 * hooks/useFieldDrift.ts -- Arc 25 (hotfix)
 *
 * React hook wrapping the field drift engine.
 * Reads raw moments from the atlas ring -- temporal order is required.
 * No longer passes memory/soul to the engine (those required the full
 * evaluator chain with currentPhase + 5 composed layers).
 * Drift now characterizes each half directly from moment data.
 */
import { useMemo } from 'react';
import { useAtlas } from '@/atlas/useAtlas';
import { evaluateFieldDrift, type FieldDrift } from '@/atlas/fieldDrift';

export type { FieldDrift, DriftDirection, DriftStability } from '@/atlas/fieldDrift';

export function useFieldDrift(): FieldDrift {
  const atlas = useAtlas();

  return useMemo(
    () => evaluateFieldDrift(atlas.moments),
    // Only recompute when ring size changes -- drift is the slowest signal
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [atlas.moments.length]
  );
}
