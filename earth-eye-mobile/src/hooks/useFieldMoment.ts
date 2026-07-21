/**
 * useFieldMoment.ts
 * Arc 65: EARTHTHREAD++ -- moment identity hook.
 *
 * Reads the narrator thread ref (smoothed cross-field memory) and
 * derives a MomentIdentity from it. No new sensors, no new subscriptions.
 * The thread carries the memory; this hook names it.
 *
 * This is the lightest hook in the stack -- it only reads a ref and
 * computes a categorical state. It does not participate in rendering
 * the thread itself (that happens in SeasonalFieldCard's commit phase).
 */

import { useMemo } from 'react';
import { useNarrator } from '@/contexts/narrator-context';
import { computeMomentState, type MomentState } from '@/atlas/fieldMoment';

export function useFieldMoment(): MomentState {
  const narrator = useNarrator();
  const thread = narrator.threadRef;

  return useMemo(() => {
    return computeMomentState(thread.current);
  // Recompute when thread isWarm changes or any thread numeric changes.
  // Since thread is a ref, we can't observe its mutations directly.
  // This hook is called during render, after the thread has been advanced
  // in the previous render's commit phase. The memo deps are intentionally
  // minimal -- the thread ref's current value is read synchronously.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.current.isWarm,
      thread.current.threadPulseDrift,
      thread.current.threadSkyDrift,
      thread.current.threadSkinDrift,
      thread.current.threadFootDrift,
      thread.current.threadPulseContinuity]);
}
