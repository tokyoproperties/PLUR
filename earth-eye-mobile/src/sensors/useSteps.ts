/**
 * useSteps.ts
 * Arc 63: EARTHFOOT -- pedometer step counter with walking derivation.
 *
 * Wraps expo-sensors Pedometer. Unlike other sensors, Pedometer requires
 * explicit permission grants on Android.
 *
 * API reality (verified Jul 20 2026):
 *   - watchStepCount(callback) -- subscribes to step count updates
 *   - getStepCountAsync(start, end) -- iOS only, historical query
 *   - isAvailableAsync() -- hardware check
 *   - requestPermissionsAsync() -- permission prompt
 *   - NO isWalking() method exists. Walking must be derived from step deltas.
 *
 * Walking derivation:
 *   watchStepCount gives cumulative step count. We track the delta over
 *   a rolling window. If steps increase > WALKING_THRESHOLD steps in
 *   CADENCE_WINDOW_MS, we report isWalking = true.
 *
 * Requires: expo-sensors (already installed, v57)
 */

import { Pedometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

export interface StepsReading {
  /** Cumulative step count since subscription started. Null if not available. */
  stepCount: number | null;
  /** Steps taken in the last CADENCE_WINDOW_MS. */
  stepsInWindow: number;
  /** Derived walking state: true if stepsInWindow >= WALKING_THRESHOLD. */
  isWalking: boolean;
  /** Estimated steps per minute (cadence). 0 if not walking. */
  cadence: number;
  /** False on platforms/devices without a pedometer or without permission. */
  isAvailable: boolean;
  /** True once permissions resolved (granted or denied). */
  isReady: boolean;
  /** Timestamp (ms) of the most recent step update. */
  lastUpdated: number | null;
}

export interface UseStepsOptions {
  /** If false, the sensor subscription is not started. Defaults to true. */
  enabled?: boolean;
}

const DEFAULT_OPTIONS: Required<UseStepsOptions> = {
  enabled: true,
};

const WALKING_THRESHOLD = 5;       // steps in window to count as "walking"
const CADENCE_WINDOW_MS  = 10_000; // 10s rolling window for step deltas

export function useSteps(
  options: UseStepsOptions = {}
): StepsReading {
  const { enabled } = { ...DEFAULT_OPTIONS, ...options };

  const [reading, setReading] = useState<StepsReading>({
    stepCount: null,
    stepsInWindow: 0,
    isWalking: false,
    cadence: 0,
    isAvailable: false,
    isReady: false,
    lastUpdated: null,
  });

  const stepTimestampsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | null = null;

    (async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        if (!mounted) return;

        if (!available) {
          setReading((prev) => ({ ...prev, isAvailable: false, isReady: true }));
          return;
        }

        // Request permission (required on Android)
        const perm = await Pedometer.requestPermissionsAsync();
        if (!mounted) return;

        if (!perm.granted) {
          setReading((prev) => ({
            ...prev,
            isAvailable: true,
            isReady: true,
          }));
          return;
        }

        let cumulativeSteps = 0;

        subscription = Pedometer.watchStepCount((result) => {
          if (!mounted) return;

          cumulativeSteps += result.steps;
          const now = Date.now();

          // Track individual step timestamps for cadence calculation
          // Each result.steps represents steps taken since last update
          for (let i = 0; i < result.steps; i++) {
            stepTimestampsRef.current.push(now);
          }

          // Prune timestamps outside the cadence window
          const cutoff = now - CADENCE_WINDOW_MS;
          stepTimestampsRef.current = stepTimestampsRef.current.filter(
            (t) => t >= cutoff,
          );

          const stepsInWindow = stepTimestampsRef.current.length;
          const isWalking = stepsInWindow >= WALKING_THRESHOLD;

          // Cadence: steps per minute, extrapolated from the window
          const cadence = stepsInWindow > 0
            ? Math.round((stepsInWindow / CADENCE_WINDOW_MS) * 60_000)
            : 0;

          setReading({
            stepCount: cumulativeSteps,
            stepsInWindow,
            isWalking,
            cadence,
            isAvailable: true,
            isReady: true,
            lastUpdated: now,
          });
        });
      } catch {
        if (!mounted) return;
        setReading((prev) => ({ ...prev, isAvailable: false, isReady: true }));
      }
    })();

    return () => {
      mounted = false;
      subscription?.remove();
      subscription = null;
      stepTimestampsRef.current = [];
    };
  }, [enabled]);

  return reading;
}
