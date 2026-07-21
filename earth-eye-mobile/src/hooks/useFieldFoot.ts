/**
 * useFieldFoot.ts
 * Arc 63: EARTHFOOT hook -- derived mobility field.
 *
 * Composition hook that reads from:
 *   - useSensors (motion band, confidence, steps, cadence, walking state)
 *   - useLocation (GPS speed, heading)
 *
 * Derives a FootState from these signals. No new sensor subscriptions.
 *
 * isActive: true when motion sensor is available (always, unless disabled).
 * Even without pedometer permission, the field works from motion + GPS.
 *
 * Maintains a prevCadenceRef for drift computation (needs previous value
 * to compute slope -- same pattern as Arc 58 sky drift).
 */

import { useRef, useMemo } from 'react';
import { useSensors } from '@/hooks/useSensors';
import { useLocation } from '@/hooks/useLocation';
import { computeFootState, type FootState } from '@/atlas/fieldFoot';

const NEUTRAL_FOOT: FootState = {
  identity: 'unknown', continuity: 0.5, drift: 0,
  orientation: 'unknown', foresight: 'unknown',
  speed: null, heading: null, cadence: 0,
  isCalibrated: false, isActive: false,
};

export function useFieldFoot(): FootState {
  const sensors = useSensors();
  const location = useLocation();

  const prevCadenceRef = useRef<number>(0);

  return useMemo(() => {
    // Foot is active whenever motion sensor is active (not just when walking)
    // Even a still person has a meaningful foot identity: "still"
    const isActive = sensors.snapshot.motionBand !== undefined;

    const state = computeFootState(
      sensors.snapshot.motionBand,
      sensors.snapshot.motionConfidence,
      sensors.snapshot.isWalking,
      sensors.snapshot.cadence,
      prevCadenceRef.current,
      location.location?.speed ?? null,
      location.location?.heading ?? null,
      isActive,
    );

    // Update prevCadence for next drift computation
    prevCadenceRef.current = sensors.snapshot.cadence;

    return state;
  // Recompute when any relevant signal changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensors.snapshot.motionBand, sensors.snapshot.motionConfidence,
      sensors.snapshot.isWalking, sensors.snapshot.cadence,
      location.location?.speed, location.location?.heading]);
}
