/**
 * useFieldNose.ts
 * Arc 61: EARTHNOSE hook -- maintains pressure ring, derives NoseState.
 *
 * Subscribes to barometric pressure from SensorsContext (no new subscription).
 * Maintains a rolling pressure ring sampled at a longer interval than sky
 * because pressure changes much more slowly than light.
 *
 * Ring: 30 samples at 5s intervals = ~2.5 minutes of pressure history.
 * This is enough to detect slow pressure trends (weather fronts move
 * over hours, not seconds) while keeping the ring lightweight.
 *
 * isActive: follows sensors.snapshot.pressureAvailable.
 */

import { useEffect, useRef, useState } from 'react';
import { computeNoseState, type NoseState, MIN_NOSE_SAMPLES } from '@/atlas/fieldNose';
import { useSensors } from '@/hooks/useSensors';

const PRESSURE_RING_SIZE          = 30;
const PRESSURE_SAMPLE_INTERVAL_MS = 5_000; // 5s -- pressure is slow

const NEUTRAL_NOSE: NoseState = {
  identity: 'unknown', signature: 0.5, continuity: 1, drift: 0,
  orientation: 'unknown', foresight: 'unknown',
  pressureNow: null, isCalibrated: false, isActive: false,
};

export function useFieldNose(): NoseState {
  const sensors = useSensors();
  const pressureNow = sensors.snapshot.pressure;
  const pressureAvailable = sensors.snapshot.pressureAvailable;

  const pressureRingRef = useRef<number[]>([]);
  const lastSampleRef    = useRef<number>(0);

  const [noseState, setNoseState] = useState<NoseState>(NEUTRAL_NOSE);

  useEffect(() => {
    if (!pressureAvailable || pressureNow === null) {
      setNoseState(NEUTRAL_NOSE);
      pressureRingRef.current = [];
      lastSampleRef.current = 0;
      return;
    }

    const now = Date.now();

    // Sample at interval or on first reading
    if (now - lastSampleRef.current >= PRESSURE_SAMPLE_INTERVAL_MS || lastSampleRef.current === 0) {
      lastSampleRef.current = now;
      const ring = pressureRingRef.current;
      ring.push(pressureNow);
      if (ring.length > PRESSURE_RING_SIZE) ring.shift();
    }

    const state = computeNoseState(
      pressureNow,
      [...pressureRingRef.current],
      pressureAvailable,
    );
    setNoseState(state);
  }, [pressureNow, pressureAvailable]);

  return noseState;
}
