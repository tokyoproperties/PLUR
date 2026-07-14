/**
 * useFieldEar.ts
 * Arc 57: EARTH EAR hook -- derives EarState from the moment ring.
 *
 * Mirrors useFieldSky.ts architecture: reads from an existing data
 * source (the moment ring via useAtlas), calls a pure compute function,
 * returns the result. No new subscriptions. No new permissions.
 *
 * The moment ring updates whenever a new FieldMoment is appended.
 * This hook recomputes on every atlas update -- the compute function
 * is fast (O(N) ring scan, N <= 1000) so this is fine.
 *
 * isActive: always true for now (ear derives from ring, not a toggle).
 * In a future arc an "ear mode" toggle could gate this like skyMode.
 */

import { useMemo } from 'react';
import { useAtlas } from '@/atlas/useAtlas';
import { computeEarState, type EarState } from '@/atlas/fieldEar';

const NEUTRAL_EAR: EarState = {
  earTone: 'unknown', identity: 'unknown', signature: null,
  continuity: 1, orientation: 'unknown', foresight: 'unknown',
  isCalibrated: false, isActive: false,
};

export function useFieldEar(): EarState {
  const atlas = useAtlas();
  const moments = atlas?.moments ?? [];

  return useMemo(
    () => computeEarState(moments, true),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [moments.length, moments[moments.length - 1]?.id],
  );
}
