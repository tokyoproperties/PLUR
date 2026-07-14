/**
 * hooks/useFieldHarmony.ts -- Arc 27
 *
 * Meta-hook: reads the three slow sibling outputs.
 * Does not touch atlas.moments directly -- harmony is one level up.
 * Memoized on the three sibling dominant/archetype/direction values
 * so it only recomputes when a sibling actually changes character.
 */
import { useMemo } from 'react';
import { useFieldReweight } from '@/hooks/useFieldReweight';
import { useFieldConstellation } from '@/hooks/useFieldConstellation';
import { useFieldDrift } from '@/hooks/useFieldDrift';
import { evaluateFieldHarmony, type FieldHarmony } from '@/atlas/fieldHarmony';

export type { FieldHarmony, HarmonyMood } from '@/atlas/fieldHarmony';

export function useFieldHarmony(): FieldHarmony {
  const reweight      = useFieldReweight();
  const constellation = useFieldConstellation();
  const drift         = useFieldDrift();

  return useMemo(
    () => evaluateFieldHarmony(reweight, constellation, drift),
    // Recompute only when sibling character values change -- not on every moment
    [
      reweight.dominant, reweight.isMature, reweight.impliedMode,
      constellation.archetype, constellation.isFormed, constellation.impliedMode,
      drift.direction, drift.stability, drift.magnitude, drift.isMeasurable, drift.impliedMode,
    ]
  );
}
