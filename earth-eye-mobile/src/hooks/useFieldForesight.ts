/**
 * hooks/useFieldForesight.ts -- Arc 29
 *
 * After computing foresight, writes FeedbackInputs into the module-level
 * store via setReweightFeedback(). This closes the feedback loop:
 *
 *   ring -> reweight (with prev feedback) -> harmony -> foresight
 *                                                     -> setReweightFeedback (next render)
 *
 * No circular import: useFieldForesight imports setReweightFeedback from
 * useFieldReweight (a named export, not a hook call). The module import
 * order is acyclic because hooks/useFieldReweight.ts does not import
 * hooks/useFieldForesight.ts.
 */
import { useEffect, useMemo } from 'react';
import { useFieldReweight } from '@/hooks/useFieldReweight';
import { useFieldConstellation } from '@/hooks/useFieldConstellation';
import { useFieldDrift } from '@/hooks/useFieldDrift';
import { useFieldHarmony } from '@/hooks/useFieldHarmony';
import { evaluateFieldForesight, type FieldForesight } from '@/atlas/fieldForesight';
import { setReweightFeedback } from '@/hooks/useFieldReweight';

export type { FieldForesight, ForesightState } from '@/atlas/fieldForesight';

export function useFieldForesight(): FieldForesight {
  const reweight      = useFieldReweight();
  const constellation = useFieldConstellation();
  const drift         = useFieldDrift();
  const harmony       = useFieldHarmony();

  const foresight = useMemo(
    () => evaluateFieldForesight(reweight, constellation, drift, harmony),
    [
      reweight.dominant, reweight.isMature, reweight.impliedMode,
      constellation.archetype, constellation.isFormed,
      drift.direction, drift.isMeasurable, drift.magnitude,
      harmony.mood, harmony.isReadable, harmony.agreement,
    ]
  );

  // Arc 29: after computing foresight, write feedback for next render
  useEffect(() => {
    if (foresight.isActive && harmony.isReadable) {
      setReweightFeedback({
        harmonyAgreement: harmony.agreement,
        foresightState:   foresight.forecast,
        foresightActive:  true,
      });
    } else {
      setReweightFeedback(null);
    }
    // Cleanup: clear feedback when this component unmounts
    return () => { setReweightFeedback(null); };
  }, [foresight.forecast, foresight.isActive, harmony.agreement, harmony.isReadable]);

  return foresight;
}
