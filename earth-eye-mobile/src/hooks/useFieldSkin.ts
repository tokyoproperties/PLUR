/**
 * useFieldSkin.ts
 * Arc 62: EARTHSKIN hook -- derived tactile/comfort field.
 *
 * This is NOT a sensor hook. It reads from three existing hooks:
 *   - useFieldSky (lux, foresight, continuity)
 *   - useFieldCelestial (phase)
 *   - useFieldNose (orientation, continuity)
 *
 * And derives a comfort/tactile state from their outputs.
 *
 * No new sensor subscriptions. No pressure ring. No lux ring.
 * Pure composition -- the same pattern as Arc 59 (EarthMouth).
 *
 * isActive: true when sky is active (lux is the primary thermal signal).
 * Even without nose (barometer absent), the field still works from sky + celestial.
 */

import { useMemo } from 'react';
import { useFieldSky } from '@/hooks/useFieldSky';
import { useFieldCelestial } from '@/hooks/useFieldCelestial';
import { useFieldNose } from '@/hooks/useFieldNose';
import { computeSkinState, type SkinState } from '@/atlas/fieldSkin';

const NEUTRAL_SKIN: SkinState = {
  identity: 'unknown', comfort: 0.5, continuity: 0.5,
  orientation: 'unknown', foresight: 'unknown',
  thermalLoad: 0, isCalibrated: false, isActive: false,
};

export function useFieldSkin(): SkinState {
  const sky = useFieldSky();
  const celestial = useFieldCelestial();
  const nose = useFieldNose();

  return useMemo(() => {
    if (!sky.isActive) return NEUTRAL_SKIN;

    const hour = new Date().getHours();

    return computeSkinState(
      hour,
      sky.luxNow,
      celestial.phase,
      sky.foresight,
      sky.continuity,
      nose.orientation,
      nose.continuity,
      sky.isActive,
    );
  // Recompute when any input field changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sky.luxNow, sky.foresight, sky.continuity, sky.isActive,
      celestial.phase,
      nose.orientation, nose.continuity]);
}
