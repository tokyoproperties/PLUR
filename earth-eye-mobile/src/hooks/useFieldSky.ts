/**
 * useFieldSky.ts
 * Arc 55: SKY INTELLIGENCE hook -- maintains lux ring, derives SkyState.
 *
 * Subscribes to the lux reading from SensorsContext (no new subscription).
 * Maintains a rolling lux ring (up to LUX_RING_SIZE samples) sampled
 * every LUX_SAMPLE_INTERVAL_MS to capture sky variance over time.
 *
 * skyModeEnabled: read from NarratorContext (user toggle in settings).
 * When disabled, returns a neutral SkyState with isActive=false.
 */

import { useEffect, useRef, useState } from 'react';
import { computeSkyState, type SkyState, MIN_SKY_SAMPLES } from '@/atlas/fieldSky';
import { useSensors } from '@/hooks/useSensors';
import { useNarrator } from '@/contexts/narrator-context';

// Rolling ring: ~10 minutes of 30s samples = 20 samples
const LUX_RING_SIZE          = 24;   // max samples kept
const LUX_SAMPLE_INTERVAL_MS = 30_000; // 30s -- sky changes slowly

const NEUTRAL_SKY: SkyState = {
  skyTone:      'unknown',
  identity:     'unknown',
  signature:    null,
  rhythm:       'unknown',
  continuity:   1,
  orientation:  'unknown',
  foresight:    'unknown',
  luxNow:       null,
  luxVariance:  0,
  isCalibrated: false,
  isActive:     false,
};

export function useFieldSky(): SkyState {
  const sensors   = useSensors();
  const narrator  = useNarrator();
  const luxNow    = sensors.snapshot.lux;
  const skyMode   = narrator.skyModeEnabled;

  const luxRingRef  = useRef<number[]>([]);
  const lastSampleRef = useRef<number>(0);

  const [skyState, setSkyState] = useState<SkyState>(NEUTRAL_SKY);

  useEffect(() => {
    if (!skyMode || luxNow === null) {
      setSkyState(NEUTRAL_SKY);
      luxRingRef.current = [];
      lastSampleRef.current = 0;
      return;
    }

    const now = Date.now();

    // Sample at interval or on first reading
    if (now - lastSampleRef.current >= LUX_SAMPLE_INTERVAL_MS || lastSampleRef.current === 0) {
      lastSampleRef.current = now;
      const ring = luxRingRef.current;
      ring.push(Math.max(0, isNaN(luxNow) ? 0 : luxNow));  // Arc 68: clamp non-negative, guard NaN
      if (ring.length > LUX_RING_SIZE) ring.shift();
    }

    const hour = new Date().getHours();
    const state = computeSkyState(luxNow, [...luxRingRef.current], hour, skyMode);
    setSkyState(state);

  }, [luxNow, skyMode]);

  return skyState;
}
