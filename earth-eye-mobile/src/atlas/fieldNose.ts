/**
 * fieldNose.ts
 * Arc 61: EARTHNOSE -- barometric pressure field engine.
 *
 * The nose layer interprets atmospheric pressure as an environmental
 * field. Pressure changes slowly but meaningfully: dropping pressure
 * signals incoming weather, rising pressure signals clearing.
 *
 * WHAT THIS IS:
 *   Not a weather API. Not a cloud forecast. Not GPS altitude.
 *   A pure interpretation of on-device barometer readings over time.
 *   Honest about what is available: pressure (hPa) + ring history.
 *
 * FIVE LAYERS (all pure functions):
 *   noseIdentity     categorical pressure regime (low/normal/high)
 *   noseSignature    normalized pressure level (0-1)
 *   noseContinuity   ring stability (0-1, 1=perfectly stable)
 *   noseOrientation  directional lean (rising/falling/stable)
 *   noseForesight    short-term pressure drift prediction
 *
 * All pure functions. No React. No hooks. No AsyncStorage.
 */

// -- Types --------------------------------------------------------------------

export type NoseIdentity =
  | 'low'       // < 1005 hPa -- stormy/unsettled air
  | 'normal'    // 1005-1018 hPa -- typical sea-level pressure
  | 'high'      // > 1018 hPa -- clear/stable air
  | 'unknown';

export type NoseOrientationType =
  | 'rising'    // pressure increasing -- clearing trend
  | 'falling'   // pressure decreasing -- unsettled trend
  | 'stable'    // minimal slope
  | 'unknown';

export type NoseForecastType =
  | 'clearing'
  | 'settling'
  | 'unsettling'
  | 'holding'
  | 'unknown';

export interface NoseState {
  identity:      NoseIdentity;
  signature:     number;              // 0-1: normalized pressure level
  continuity:    number;              // 0-1: ring stability (1=stable)
  drift:         number;              // -1..+1: signed slope (+=rising, -=falling)
  orientation:   NoseOrientationType;
  foresight:     NoseForecastType;
  pressureNow:   number | null;       // raw hPa
  isCalibrated:  boolean;             // true once ring >= MIN_NOSE_SAMPLES
  isActive:      boolean;
}

export const MIN_NOSE_SAMPLES = 8;

// -- Helpers

// Arc 68: sensor value safety -- clamps pressure, guards NaN
function safePressure(v: number | null | undefined): number {
  if (v === null || v === undefined || isNaN(v)) return 0;
  return Math.max(0, v);
} ------------------------------------------------------------------

function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function variance(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
}

function stddev(arr: number[]): number {
  return Math.sqrt(variance(arr));
}

// -- Nose Identity ------------------------------------------------------------

export function computeNoseIdentity(
  pressureNow: number | null,
): NoseIdentity {
  if (pressureNow === null) return 'unknown';
  if (pressureNow < 1005) return 'low';
  if (pressureNow > 1018) return 'high';
  return 'normal';
}

// -- Nose Signature (normalized 0-1) ------------------------------------------
// Maps the 980-1040 hPa range to 0-1. Most readings cluster 1005-1020.

export function computeNoseSignature(
  pressureNow: number | null,
): number {
  if (pressureNow === null) return 0.5;
  const min = 980;
  const max = 1040;
  return Math.max(0, Math.min(1, (pressureNow - min) / (max - min)));
}

// -- Nose Continuity (ring stability) -----------------------------------------
// Pressure is naturally stable -- variance is tiny (often < 1 hPa).
// We normalize by a generous range (5 hPa) so small fluctuations register.

export function computeNoseContinuity(pressureRing: number[]): number {
  if (pressureRing.length < 2) return 1;
  const sd = stddev(pressureRing);
  // Normalize: 0 hPa variance -> 1.0 (perfectly stable), 5 hPa -> 0.0
  return Math.max(0, Math.min(1, 1 - sd / 5));
}

// -- Nose Drift (signed slope) ------------------------------------------------
// Linear regression over the ring, normalized by mean pressure.
// Pressure changes are small (typically < 2 hPa over 30s), so the
// normalization threshold is tight: 0.5 hPa per sample = 1.0 drift.

export function computeNoseDrift(pressureRing: number[]): number {
  if (pressureRing.length < MIN_NOSE_SAMPLES) return 0;
  const n = pressureRing.length;
  const m = mean(pressureRing);
  if (m <= 0) return 0;

  const meanI = (n - 1) / 2;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanI) * (pressureRing[i]! - m);
    den += (i - meanI) ** 2;
  }
  const slope = den > 0 ? num / den : 0;
  // Normalize: slope in hPa per sample. 0.5 hPa/sample = full scale.
  const normSlope = slope / 0.5;
  return Math.max(-1, Math.min(1, normSlope));
}

// -- Nose Orientation ---------------------------------------------------------

export function computeNoseOrientation(
  drift: number,
): NoseOrientationType {
  if (Math.abs(drift) < 0.08) return 'stable';
  if (drift > 0) return 'rising';
  return 'falling';
}

// -- Nose Foresight -----------------------------------------------------------
// Pressure drift predicts weather trends on a longer timescale than
// sky or ear. A rising barometer forecasts clearing; falling forecasts
// unsettled weather. Only meaningful when drift is non-trivial.

export function computeNoseForesight(
  identity:      NoseIdentity,
  orientation:   NoseOrientationType,
  continuity:    number,
): NoseForecastType {
  if (orientation === 'unknown') return 'unknown';
  if (orientation === 'stable') return 'holding';

  // Suppress foresight if continuity is very low (chaotic readings)
  if (continuity < 0.30) return 'holding';

  if (orientation === 'rising') {
    // Rising pressure -> clearing trend
    if (identity === 'low') return 'clearing';
    return 'settling';
  }
  // orientation === 'falling'
  if (identity === 'high') return 'unsettling';
  return 'unsettling';
}

// -- Full nose state composer -------------------------------------------------

export function computeNoseState(
  pressureNow: number | null,
  pressureRing: number[],
  isActive: boolean,
): NoseState {
  const neutral: NoseState = {
    identity: 'unknown', signature: 0.5, continuity: 1, drift: 0,
    orientation: 'unknown', foresight: 'unknown',
    pressureNow: null, isCalibrated: false, isActive: false,
  };

  if (!isActive || pressureNow === null) return neutral;

  const identity    = computeNoseIdentity(pressureNow);
  const signature   = computeNoseSignature(pressureNow);
  const continuity  = computeNoseContinuity(pressureRing);
  const drift       = computeNoseDrift(pressureRing);
  const orientation = computeNoseOrientation(drift);
  const foresight   = computeNoseForesight(identity, orientation, continuity);

  return {
    identity, signature, continuity, drift,
    orientation, foresight, pressureNow,
    isCalibrated: pressureRing.length >= MIN_NOSE_SAMPLES,
    isActive: true,
  };
}
