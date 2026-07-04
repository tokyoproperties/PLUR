/**
 * useSensors.ts
 * Combined sensor hook — wraps the three individual sensor watchers
 * into a single call site for screens that need all environmental
 * data at once (Home, Map, Sensors).
 *
 * Returns a unified snapshot plus the raw sub-hook states for screens
 * that need per-sensor detail (like isAvailable flags).
 */

import { useMemo } from 'react';

import { useAmbientLight } from '@/sensors/useAmbientLight';
import { useMotion } from '@/sensors/useMotion';
import { useSound } from '@/sensors/useSound';

export interface SensorSnapshot {
  lux: number | null;
  motionMagnitude: number;
  soundRelativeDb: number | null;
}

export interface UseSensorsResult {
  light: ReturnType<typeof useAmbientLight>;
  motion: ReturnType<typeof useMotion>;
  sound: ReturnType<typeof useSound>;
  snapshot: SensorSnapshot;
}

export function useSensors(): UseSensorsResult {
  const light = useAmbientLight();
  const motion = useMotion();
  const sound = useSound();

  const snapshot = useMemo<SensorSnapshot>(
    () => ({
      lux: light.lux,
      motionMagnitude: motion.magnitude,
      soundRelativeDb: sound.relativeDb,
    }),
    [light.lux, motion.magnitude, sound.relativeDb]
  );

  return { light, motion, sound, snapshot };
}
