/**
 * hooks/useFieldForesight.ts -- Arc 28
 *
 * Reads harmony + three slow sibling outputs.
 * Does not touch atlas.moments directly.
 * Memoized on forecast inputs -- only recomputes when a sibling
 * changes its dominant signal or harmony changes mood.
 */
import { useMemo } from 'react';
import { useFieldReweight } from '@/hooks/useFieldReweight';
import { useFieldConstellation } from '@/hooks/useFieldConstellation';
import { useFieldDrift } from '@/hooks/useFieldDrift';
import { useFieldHarmony } from '@/hooks/useFieldHarmony';
import { evaluateFieldForesight, type FieldForesight } from '@/atlas/fieldForesight';

export type { FieldForesight, ForesightState } from '@/atlas/fieldForesight';

export function useFieldForesight(): FieldForesight {
  const reweight      = useFieldReweight();
  const constellation = useFieldConstellation();
  const drift         = useFieldDrift();
  const harmony       = useFieldHarmony();

  return useMemo(
    () => evaluateFieldForesight(reweight, constellation, drift, harmony),
    [
      reweight.dominant, reweight.isMature, reweight.impliedMode,
      constellation.archetype, constellation.isFormed,
      drift.direction, drift.isMeasurable, drift.magnitude,
      harmony.mood, harmony.isReadable, harmony.agreement,
    ]
  );
}
