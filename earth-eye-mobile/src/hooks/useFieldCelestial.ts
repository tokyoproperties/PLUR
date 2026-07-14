/**
 * useFieldCelestial.ts
 * Arc 60: CELESTIAL hook -- derives CelestialState from sky + hour.
 *
 * Reads from useFieldSky (already subscribed to lux + hour)
 * and the current hour. No new sensor subscriptions.
 *
 * Recomputes whenever sky state updates (which is whenever lux changes
 * or the 30s sample interval fires).
 *
 * isActive: true when sky is active (user has skyMode enabled).
 * CelestialState degrades gracefully when lux is unavailable --
 * phase is still computed from hour alone.
 */

import { useMemo } from 'react';
import { useFieldSky } from '@/hooks/useFieldSky';
import { computeCelestialState, type CelestialState } from '@/atlas/fieldCelestial';

const NEUTRAL_CELESTIAL: CelestialState = {
  phase:        'unknown',
  gradient:     0,
  drift:        0,
  orientation:  'unknown',
  foresight:    'unknown',
  hourOfDay:    0,
  isCalibrated: false,
  isActive:     false,
};

export function useFieldCelestial(): CelestialState {
  const sky = useFieldSky();

  return useMemo(() => {
    // Celestial is active if sky is active; degrades gracefully otherwise.
    // Even when sky is inactive we can compute phase from hour alone --
    // but we mark isActive: false so the card knows to suppress it.
    const hour = new Date().getHours();

    if (!sky.isActive) return NEUTRAL_CELESTIAL;

    // luxRingLen derived from isCalibrated flag -- we don't expose the raw ring
    // from useFieldSky, so we use calibrated (>= MIN_SKY_SAMPLES = 12) as proxy.
    // MIN_CELESTIAL_LUX_SAMPLES = 8, so we treat isCalibrated as "ring is warm".
    const luxRingLen = sky.isCalibrated ? 12 : 0;

    return computeCelestialState(
      hour,
      sky.luxNow,
      luxRingLen,
      sky.drift,      // Arc 58 numeric slope -- already computed
      sky.isActive,
    );
  // Recompute whenever sky updates (lux or drift or continuity changed)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sky.skyTone, sky.drift, sky.continuity, sky.luxNow, sky.isCalibrated]);
}
