/**
 * useMotion.ts
 * Movement event watcher with cadence-windowed classification.
 *
 * Wraps expo-sensors Accelerometer. Computes a smoothed magnitude delta
 * (rather than raw gravity-inclusive readings) so "still" actually means
 * still, not "holding phone upright."
 *
 * CALIBRATED July 6 2026 (Mission 1 — Sensor Engine Calibration):
 *   - Cadence window: raw per-sample deltas are noisy (hand tremor, phone
 *     vibration). A single spike shouldn't flip the whole engine. Instead
 *     of banding the instantaneous EMA value, we maintain a rolling
 *     window (CADENCE_WINDOW_MS) of recent samples and band the WINDOWED
 *     MEAN. This is what "cadence smoothing" means in practice — the
 *     instrument judges a stretch of time, not one jittery instant.
 *   - Hysteresis: entering a higher band requires clearing the threshold
 *     by a margin; falling back requires dropping below it by a margin.
 *     Without this, a magnitude sitting right at a boundary flickers
 *     between bands every sample. This is the single biggest cause of a
 *     "twitchy" feeling instrument.
 *   - Confidence: derived from (a) how much the windowed samples vary
 *     from each other (erratic readings = lower confidence) and (b) how
 *     close the windowed mean sits to the active threshold boundary
 *     (right at a boundary = 'uncertain', matching Hybrid's explicit
 *     still/forming/active/uncertain model).
 *   - Sampling rate: raised from the previous 2000ms default to 250ms.
 *     This is still extremely light bridge traffic (~4 events/sec, not
 *     remotely close to the 60+Hz audio-recorder issue that caused JS
 *     starvation) but it's fast enough to actually fill a sub-second
 *     cadence window with multiple samples — at 2000ms, a 900ms window
 *     would rarely contain more than one sample, making "windowed"
 *     smoothing meaningless.
 *
 * Requires: expo-sensors (added to package.json dependencies)
 */

import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { classifyMotion, MOTION_THRESHOLDS, type MotionBand } from '@/utils/thresholds';

export interface MotionVector {
  x: number;
  y: number;
  z: number;
}

export type MotionConfidence = 'high' | 'medium' | 'low' | 'uncertain';

export interface MotionReading {
  /** Latest raw accelerometer vector, in g. */
  vector: MotionVector | null;
  /** Windowed-mean magnitude over the cadence window — this is the value bands/consumers should read. */
  magnitude: number;
  /** Classified band derived from MOTION_THRESHOLDS, with hysteresis applied. */
  band: MotionBand;
  /** How reliable the current band classification is right now. */
  confidence: MotionConfidence;
  /** Convenience flag — true when band is not 'still'. */
  isMoving: boolean;
  /** Convenience flag — true when band is 'active' (deliberate movement, startle-risk). */
  isActive: boolean;
  /** Timestamp (ms) of the most recent reading. */
  lastUpdated: number | null;
}

export interface UseMotionOptions {
  /** Sensor update interval in ms. Defaults to 250ms. */
  updateInterval?: number;
  /** Smoothing factor for the per-sample low-pass filter, 0–1. Higher = smoother/slower. Defaults to 0.7. */
  smoothing?: number;
  /** Rolling cadence window in ms — how long a stretch of samples gets averaged before banding. Defaults to 900ms (mid-point of the 600–1200ms target range). */
  cadenceWindowMs?: number;
  /** If false, the sensor subscription is not started. Defaults to true. */
  enabled?: boolean;
}

const DEFAULT_OPTIONS: Required<UseMotionOptions> = {
  updateInterval: 250,
  smoothing: 0.7,
  cadenceWindowMs: 900,
  enabled: true,
};

// Hysteresis margin — how far past a boundary the windowed mean must
// move before we commit to a band change in that direction. Expressed
// as a fraction of the boundary value itself (15%).
const HYSTERESIS_FACTOR = 0.15;

// How close the windowed mean must be to a boundary (as a fraction of
// the boundary value) before we call the reading 'uncertain' rather
// than trusting the band outright.
const BOUNDARY_PROXIMITY_FACTOR = 0.1;

const INITIAL_READING: MotionReading = {
  vector: null,
  magnitude: 0,
  band: 'still',
  confidence: 'high',
  isMoving: false,
  isActive: false,
  lastUpdated: null,
};

interface WindowSample {
  magnitude: number;
  timestamp: number;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stdDev(values: number[], avg: number): number {
  if (values.length < 2) return 0;
  const variance = mean(values.map((v) => (v - avg) ** 2));
  return Math.sqrt(variance);
}

/**
 * Bands the windowed mean with hysteresis relative to the previously
 * committed band, so a value sitting right at a threshold doesn't
 * flicker between bands every sample.
 */
function classifyWithHysteresis(windowedMean: number, prevBand: MotionBand): MotionBand {
  const { STILL, FORMING } = MOTION_THRESHOLDS;

  if (prevBand === 'still') {
    // Must clear STILL by the hysteresis margin to leave 'still'.
    if (windowedMean < STILL * (1 + HYSTERESIS_FACTOR)) return 'still';
    return classifyMotion(windowedMean);
  }

  if (prevBand === 'active') {
    // Must drop below FORMING by the hysteresis margin to leave 'active'.
    if (windowedMean > FORMING * (1 - HYSTERESIS_FACTOR)) return 'active';
    return classifyMotion(windowedMean);
  }

  // prevBand === 'forming' — no extra hysteresis needed on entry from
  // either side, classifyMotion's plain boundaries are fine here since
  // 'forming' is the middle band with no self-reinforcing bias.
  return classifyMotion(windowedMean);
}

function deriveConfidence(
  windowedMean: number,
  samples: number[],
  band: MotionBand
): MotionConfidence {
  if (samples.length < 2) return 'medium';

  const avg = mean(samples);
  const deviation = stdDev(samples, avg);
  // Coefficient of variation — how noisy the window is relative to its own magnitude.
  const noiseRatio = avg > 0.001 ? deviation / avg : 0;

  const { STILL, FORMING } = MOTION_THRESHOLDS;
  const nearStillBoundary = Math.abs(windowedMean - STILL) < STILL * BOUNDARY_PROXIMITY_FACTOR;
  const nearFormingBoundary = Math.abs(windowedMean - FORMING) < FORMING * BOUNDARY_PROXIMITY_FACTOR;

  if (nearStillBoundary || nearFormingBoundary) return 'uncertain';
  if (noiseRatio > 0.6) return 'low';
  if (noiseRatio > 0.25) return 'medium';
  return 'high';
}

export function useMotion(options: UseMotionOptions = {}): MotionReading {
  const { updateInterval, smoothing, cadenceWindowMs, enabled } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [reading, setReading] = useState<MotionReading>(INITIAL_READING);
  const prevVectorRef = useRef<MotionVector | null>(null);
  const smoothedMagnitudeRef = useRef(0);
  const windowRef = useRef<WindowSample[]>([]);
  const committedBandRef = useRef<MotionBand>('still');
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

      // Per-sample exponential moving average — takes the sharp edge off
      // single-tick jitter before it even enters the cadence window.
      smoothedMagnitudeRef.current =
        smoothing * smoothedMagnitudeRef.current + (1 - smoothing) * delta;

      prevVectorRef.current = { x, y, z };

      const now = Date.now();

      // Push into the cadence window and prune anything older than it.
      windowRef.current.push({ magnitude: smoothedMagnitudeRef.current, timestamp: now });
      windowRef.current = windowRef.current.filter((s) => now - s.timestamp <= cadenceWindowMs);

      const windowMagnitudes = windowRef.current.map((s) => s.magnitude);
      const windowedMean = mean(windowMagnitudes);

      const band = classifyWithHysteresis(windowedMean, committedBandRef.current);
      committedBandRef.current = band;

      const confidence = deriveConfidence(windowedMean, windowMagnitudes, band);

      setReading({
        vector: { x, y, z },
        magnitude: windowedMean,
        band,
        confidence,
        isMoving: band !== 'still',
        isActive: band === 'active',
        lastUpdated: now,
      });
    });

    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      prevVectorRef.current = null;
      smoothedMagnitudeRef.current = 0;
      windowRef.current = [];
      committedBandRef.current = 'still';
    };
  }, [enabled, updateInterval, smoothing, cadenceWindowMs]);

  return reading;
}
