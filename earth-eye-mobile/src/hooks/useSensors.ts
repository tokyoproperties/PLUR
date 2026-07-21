/**
 * useSensors.ts
 * Combined sensor hook — wraps the three individual sensor watchers
 * into a single call site for screens that need all environmental
 * data at once (Home, Map, Sensors).
 *
 * Returns a unified snapshot plus the raw sub-hook states for screens
 * that need per-sensor detail (like isAvailable flags).
 *
 * PERFORMANCE: This hook is now split into:
 *   useSensorsInternal() — creates the actual sensor subscriptions
 *   useSensors()         — reads from FieldDataProvider context
 *
 * The provider instantiates the internal version once at the app root.
 * All consumers read from context, eliminating duplicate subscriptions.
 */

import { useContext, useMemo } from 'react';

import { SensorsContext } from '@/contexts/field-data-contexts';
import { useAmbientLight } from '@/sensors/useAmbientLight';
import { useMotion, type MotionConfidence } from '@/sensors/useMotion';
import type { MotionBand } from '@/utils/thresholds';
import { useSound } from '@/sensors/useSound';
import { useBarometer } from '@/sensors/useBarometer';

export interface SensorSnapshot {
  lux: number | null;
  motionMagnitude: number;
  /**
   * Hysteresis-protected band from useMotion — NOT the same as calling
   * classifyMotion(motionMagnitude) again downstream. useMotion commits
   * this band using a margin above/below the threshold specifically to
   * avoid flicker at boundary values; re-deriving from the raw magnitude
   * silently throws that protection away. Every consumer that classifies
   * motion should read this field, not re-classify motionMagnitude.
   */
  motionBand: MotionBand;
  /** How reliable the current motion band is right now (see useMotion.ts). */
  motionConfidence: MotionConfidence;
  soundRelativeDb: number | null;
  /** Arc 61: barometric pressure in hPa, null if barometer unavailable. */
  pressure: number | null;
  /** Arc 61: whether the device has a barometer. */
  pressureAvailable: boolean;
}

export interface UseSensorsResult {
  light: ReturnType<typeof useAmbientLight>;
  motion: ReturnType<typeof useMotion>;
  sound: ReturnType<typeof useSound>;
  barometer: ReturnType<typeof useBarometer>;
  snapshot: SensorSnapshot;
}

// Internal — only called by FieldDataProvider
export function useSensorsInternal(): UseSensorsResult {
  const light = useAmbientLight();
  const motion = useMotion();
  const sound = useSound();
  const barometer = useBarometer();

  const snapshot = useMemo<SensorSnapshot>(
    () => ({
      lux: light.lux,
      motionMagnitude: motion.magnitude,
      motionBand: motion.band,
      pressure: barometer.pressure,
      pressureAvailable: barometer.isAvailable,
      motionConfidence: motion.confidence,
      soundRelativeDb: sound.relativeDb,
    }),
    [light.lux, motion.magnitude, motion.band, motion.confidence, sound.relativeDb]
  );

  return { light, motion, sound, barometer, snapshot };
}

// Consumer — reads from context
export function useSensors(): UseSensorsResult {
  const ctx = useContext(SensorsContext);
  if (!ctx) throw new Error('useSensors must be used within FieldDataProvider');
  return ctx;
}
