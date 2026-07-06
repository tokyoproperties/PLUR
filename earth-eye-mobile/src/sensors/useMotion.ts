/**
 * useMotion.ts
 * Movement event watcher with threshold-based classification.
 *
 * Wraps expo-sensors Accelerometer. Computes a smoothed magnitude delta
 * (rather than raw gravity-inclusive readings) so "still" actually means
 * still, not "holding phone upright."
 *
 * Requires: expo-sensors (added to package.json dependencies)
 */

import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { classifyMotion, type MotionBand } from '@/utils/thresholds';

export interface MotionVector {
  x: number;
  y: number;
  z: number;
}

export interface MotionReading {
  /** Latest raw accelerometer vector, in g. */
  vector: MotionVector | null;
  /** Smoothed magnitude of change since previous sample. */
  magnitude: number;
  /** Classified band derived from MOTION_THRESHOLDS. */
  band: MotionBand;
  /** Convenience flag — true when band is not 'still'. */
  isMoving: boolean;
  /** Convenience flag — true when band is 'abrupt' (startle-risk movement). */
  isAbrupt: boolean;
  /** Timestamp (ms) of the most recent reading. */
  lastUpdated: number | null;
}

export interface UseMotionOptions {
  /** Sensor update interval in ms. Defaults to 200ms. */
  updateInterval?: number;
  /** Smoothing factor for the low-pass filter, 0–1. Higher = smoother/slower. Defaults to 0.85. */
  smoothing?: number;
  /** If false, the sensor subscription is not started. Defaults to true. */
  enabled?: boolean;
}

const DEFAULT_OPTIONS: Required<UseMotionOptions> = {
  updateInterval: 2000,
  smoothing: 0.85,
  enabled: true,
};

const INITIAL_READING: MotionReading = {
  vector: null,
  magnitude: 0,
  band: 'still',
  isMoving: false,
  isAbrupt: false,
  lastUpdated: null,
};

export function useMotion(options: UseMotionOptions = {}): MotionReading {
  const { updateInterval, smoothing, enabled } = { ...DEFAULT_OPTIONS, ...options };

  const [reading, setReading] = useState<MotionReading>(INITIAL_READING);
  const prevVectorRef = useRef<MotionVector | null>(null);
  const smoothedMagnitudeRef = useRef(0);
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    Accelerometer.setUpdateInterval(updateInterval);

    subscriptionRef.current = Accelerometer.addListener(({ x, y, z }) => {
      if (!mounted) return;

      const prev = prevVectorRef.current;
      const delta = prev
        ? Math.sqrt((x - prev.x) ** 2 + (y - prev.y) ** 2 + (z - prev.z) ** 2)
        : 0;

      // Exponential moving average low-pass filter to avoid jitter.
      smoothedMagnitudeRef.current =
        smoothing * smoothedMagnitudeRef.current + (1 - smoothing) * delta;

      prevVectorRef.current = { x, y, z };

      const magnitude = smoothedMagnitudeRef.current;
      const band = classifyMotion(magnitude);

      setReading({
        vector: { x, y, z },
        magnitude,
        band,
        isMoving: band !== 'still',
        isAbrupt: band === 'abrupt',
        lastUpdated: Date.now(),
      });
    });

    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      prevVectorRef.current = null;
      smoothedMagnitudeRef.current = 0;
    };
  }, [enabled, updateInterval, smoothing]);

  return reading;
}
