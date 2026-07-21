/**
 * useFieldPulse.ts
 * Arc 64: EARTHPULSE hook -- synthetic physiological load field.
 *
 * Composition hook reading from four existing field hooks:
 *   - useFieldFoot (cadence, motion band, speed)
 *   - useFieldSky (lux, drift, continuity)
 *   - useFieldNose (drift, identity, continuity)
 *   - useFieldSkin (comfort, thermal load, continuity)
 *
 * Maintains a 30-sample load ring sampled at ~2s intervals.
 * Pulse load changes slowly (it's an aggregate), so a longer ring is fine.
 *
 * isActive: true when at least one source field is active.
 * Even with only motion (foot), the pulse works -- all other intensities
 * default to moderate baselines.
 */

import { useRef, useState, useEffect } from 'react';
import { useFieldFoot } from '@/hooks/useFieldFoot';
import { useFieldSky } from '@/hooks/useFieldSky';
import { useFieldNose } from '@/hooks/useFieldNose';
import { useFieldSkin } from '@/hooks/useFieldSkin';
import {
  computePulseState, type PulseState,
  deriveFootIntensity, deriveSkyIntensity, deriveNoseIntensity,
  deriveSkinIntensity, deriveContinuityIntensity,
  type PulseInputs,
} from '@/atlas/fieldPulse';

const PULSE_RING_SIZE          = 30;
const PULSE_SAMPLE_INTERVAL_MS = 2_000;

const NEUTRAL_PULSE: PulseState = {
  identity: 'unknown', load: 0, continuity: 1, drift: 0,
  foresight: 'unknown', isCalibrated: false, isActive: false,
};

export function useFieldPulse(): PulseState {
  const foot = useFieldFoot();
  const sky  = useFieldSky();
  const nose = useFieldNose();
  const skin = useFieldSkin();

  const pulseRingRef = useRef<number[]>([]);
  const lastSampleRef = useRef<number>(0);

  const [pulseState, setPulseState] = useState<PulseState>(NEUTRAL_PULSE);

  useEffect(() => {
    // Pulse is active whenever any source field is active
    const isActive = sky.isActive || nose.isActive || foot.isActive;

    if (!isActive) {
      setPulseState(NEUTRAL_PULSE);
      pulseRingRef.current = [];
      lastSampleRef.current = 0;
      return;
    }

    // Derive intensity inputs from existing field states
    const inputs: PulseInputs = {
      footIntensity: deriveFootIntensity(
        foot.cadence,
        // Map foot identity to motion band proxy
        foot.identity === 'running' ? 'active'
        : foot.identity === 'walking' ? 'active'
        : foot.identity === 'drifting' ? 'forming'
        : foot.identity === 'standing' ? 'forming'
        : 'still',
        foot.speed,
      ),
      skyIntensity: deriveSkyIntensity(sky.luxNow, sky.drift),
      noseIntensity: deriveNoseIntensity(nose.drift, nose.identity),
      skinIntensity: deriveSkinIntensity(skin.comfort, skin.thermalLoad),
      continuityIntensity: deriveContinuityIntensity(
        sky.continuity,
        nose.continuity,
        foot.continuity,
        skin.continuity,
      ),
    };

    // Compute current load for ring sampling
    const now = Date.now();
    if (now - lastSampleRef.current >= PULSE_SAMPLE_INTERVAL_MS || lastSampleRef.current === 0) {
      lastSampleRef.current = now;
      const ring = pulseRingRef.current;
      ring.push(inputs.footIntensity * 0.40 + inputs.skyIntensity * 0.25
        + inputs.noseIntensity * 0.20 + inputs.continuityIntensity * 0.15);
      if (ring.length > PULSE_RING_SIZE) ring.shift();
    }

    const state = computePulseState(inputs, [...pulseRingRef.current], isActive);
    setPulseState(state);
  // Recompute when any source field changes
  }, [foot.cadence, foot.identity, foot.speed, foot.isActive, foot.continuity,
      sky.luxNow, sky.drift, sky.continuity, sky.isActive, sky.comfort,
      nose.drift, nose.identity, nose.continuity, nose.isActive,
      skin.comfort, skin.thermalLoad, skin.continuity, skin.isActive]);

  return pulseState;
}
