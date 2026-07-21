/**
 * fieldSky.ts
 * Arc 55: SKY INTELLIGENCE -- vertical field engine.
 *
 * Derives skyTone and six sky layers from available on-device sensors.
 * Honest about what's available: no barometer, no camera, no microphone.
 * Sources: lux (AmbientLight), motion (Accelerometer), season (useSeason).
 *
 * skyTone (vertical analog to corridorTone):
 *   'bright'   high lux, stable, open sky
 *   'dim'      low lux, overcast or dusk
 *   'shifting' high lux variance over time -- cloud churn or fast light change
 *   'still'    low variance, stable lux -- settled sky
 *   'twilight' twilight-band lux
 *   'dark'     dark-band lux
 *   'unknown'  no lux reading yet
 *
 * Six sky layers (all pure functions):
 *   skyIdentity    what kind of sky is present right now
 *   skySignature   repeating brightness pattern in the lux ring
 *   skyRhythm      cadence of lux change (fast / slow / stable)
 *   skyContinuity  how stable the sky has been across the lux ring
 *   skyOrientation directional lean (brightening / dimming / open / settling)
 *   skyForesight   short-term atmospheric drift estimate
 *
 * All pure functions. No new subscriptions. No AsyncStorage.
 * Lux ring is a rolling window maintained by useFieldSky hook.
 */

export type SkyTone =
  | 'bright' | 'dim' | 'shifting' | 'still' | 'twilight' | 'dark' | 'unknown';

export type SkyIdentityType =
  | 'open sky' | 'overcast' | 'dusk' | 'dawn' | 'midday' | 'night'
  | 'cloud churn' | 'filtered light' | 'unknown';

export type SkyOrientationType =
  | 'brightening' | 'dimming' | 'open' | 'settling' | 'stable' | 'unknown';

export type SkyRhythmType   = 'fast' | 'slow' | 'stable' | 'unknown';
export type SkyForecastType = 'brightening' | 'dimming' | 'opening' | 'softening' | 'clearing' | 'settling' | 'stable' | 'unknown';

export interface SkyState {
  skyTone:        SkyTone;
  identity:       SkyIdentityType;
  signature:      string | null;   // naturalist phrase describing the pattern
  rhythm:         SkyRhythmType;
  continuity:     number;          // 0-1: 1 = perfectly stable, 0 = chaotic
  drift:          number;          // Arc 58: -1 to +1, negative=dimming positive=brightening
  orientation:    SkyOrientationType;
  foresight:      SkyForecastType;
  luxNow:         number | null;
  luxVariance:    number;          // computed over lux ring
  isCalibrated:   boolean;         // true once ring has >= MIN_SKY_SAMPLES
  isActive:       boolean;         // true if skyMode is on and lux is available
}

// Minimum lux samples before sky layers are meaningful
export const MIN_SKY_SAMPLES = 12;

// ------ Internal helpers

// Arc 68: sensor value safety -- clamps to non-negative, guards NaN
function safeLux(v: number | null | undefined): number {
  if (v === null || v === undefined || isNaN(v)) return 0;
  return Math.max(0, v);
} ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

// ------ skyTone ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export function computeSkyTone(
  luxNow: number | null,
  luxRing: number[],
): SkyTone {
  if (luxNow === null || luxRing.length < 2) return 'unknown';
  if (luxNow < 1)    return 'dark';
  if (luxNow < 50)   return 'twilight';

  const sd = stddev(luxRing);
  const m  = mean(luxRing);
  // Coefficient of variation -- relative variance
  const cv = m > 0 ? sd / m : 0;

  if (cv > 0.40) return 'shifting';   // high relative variance: cloud churn
  if (luxNow >= 10000) return 'bright';
  if (luxNow >= 1000)  return cv < 0.10 ? 'still' : 'bright';
  if (luxNow >= 200)   return cv < 0.10 ? 'still' : 'dim';
  return 'dim';
}

// ------ Sky Identity ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export function computeSkyIdentity(
  luxNow: number | null,
  skyTone: SkyTone,
  hourOfDay: number,    // 0-23
): SkyIdentityType {
  if (luxNow === null || skyTone === 'unknown') return 'unknown';
  if (skyTone === 'dark')     return 'night';
  if (skyTone === 'twilight') return hourOfDay < 12 ? 'dawn' : 'dusk';
  if (skyTone === 'shifting') return 'cloud churn';
  if (luxNow >= 10000)        return 'open sky';
  if (luxNow >= 3000)         return hourOfDay >= 10 && hourOfDay <= 14 ? 'midday' : 'open sky';
  if (luxNow >= 500)          return 'filtered light';
  return 'overcast';
}

// ------ Sky Signature ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Describes the repeating character of the sky observed in the ring.

export function computeSkySignature(
  luxRing: number[],
  skyTone: SkyTone,
): string | null {
  if (luxRing.length < MIN_SKY_SAMPLES) return null;

  const sd  = stddev(luxRing);
  const m   = mean(luxRing);
  const cv  = m > 0 ? sd / m : 0;

  // Trend: compare first half to second half
  const half   = Math.floor(luxRing.length / 2);
  const early  = mean(luxRing.slice(0, half));
  const late   = mean(luxRing.slice(half));
  const rising = late > early * 1.15;
  const fading = late < early * 0.85;

  if (skyTone === 'dark')     return 'A dark sky, holding still.';
  if (skyTone === 'twilight' && !rising) return 'A fading sky, edging toward dark.';
  if (skyTone === 'twilight' && rising)  return 'A brightening sky, edging toward day.';
  if (cv > 0.40) return 'A restless sky, light moving fast.';
  if (rising)    return 'A brightening sky.';
  if (fading)    return 'A sky pulling back.';
  if (cv < 0.08) return 'A steady sky.';
  return 'A settled sky, calm variation.';
}

// ------ Sky Rhythm ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export function computeSkyRhythm(luxRing: number[]): SkyRhythmType {
  if (luxRing.length < MIN_SKY_SAMPLES) return 'unknown';

  // Count direction flips (rising -> falling or vice versa)
  let flips = 0;
  for (let i = 2; i < luxRing.length; i++) {
    const d1 = luxRing[i-1] - luxRing[i-2];
    const d2 = luxRing[i]   - luxRing[i-1];
    if ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) flips++;
  }
  const flipRate = flips / (luxRing.length - 2);

  if (flipRate > 0.45) return 'fast';
  if (flipRate > 0.20) return 'slow';
  return 'stable';
}

// ------ Sky Continuity ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// 0 = chaotic, 1 = perfectly stable

export function computeSkyContinuity(luxRing: number[]): number {
  if (luxRing.length < 2) return 1;
  const sd = stddev(luxRing);
  const m  = mean(luxRing);
  const cv = m > 0 ? sd / m : 0;
  // Map cv [0, 1] -> continuity [1, 0], clamped
  return Math.max(0, Math.min(1, 1 - cv));
}

// ------ Sky Orientation ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export function computeSkyOrientation(luxRing: number[]): SkyOrientationType {
  if (luxRing.length < MIN_SKY_SAMPLES) return 'unknown';

  const half  = Math.floor(luxRing.length / 2);
  const early = mean(luxRing.slice(0, half));
  const late  = mean(luxRing.slice(half));
  const ratio = early > 0 ? late / early : 1;

  if (ratio > 1.20) return 'brightening';
  if (ratio < 0.80) return 'dimming';

  // Check recent tail (last quarter) for micro-trend
  const q3 = Math.floor(luxRing.length * 0.75);
  const tail = mean(luxRing.slice(q3));
  const tailRatio = early > 0 ? tail / early : 1;
  if (tailRatio > 1.10) return 'open';
  if (tailRatio < 0.90) return 'settling';
  return 'stable';
}

// ------ Sky Foresight ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Short-term atmospheric drift -- derived purely from trend + rhythm

// -- Sky Drift (Arc 58) -----------------------------------------------------------------------
// Numeric slope of the lux ring: -1 (rapidly dimming) to +1 (rapidly brightening).
// Uses a simple linear regression over the full ring to get the signed slope,
// normalised by mean lux so the value is scale-independent.

export function computeSkyDrift(luxRing: number[]): number {
  if (luxRing.length < MIN_SKY_SAMPLES) return 0;
  const n = luxRing.length;
  const m = luxRing.reduce((s, v) => s + v, 0) / n;
  if (m <= 0) return 0;

  // Numerator: sum of (i - mean_i) * (lux_i - mean_lux)
  const meanI = (n - 1) / 2;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanI) * (luxRing[i]! - m);
    den += (i - meanI) ** 2;
  }
  const slope = den > 0 ? num / den : 0;
  // Normalise: slope / mean -> relative change per sample step
  const normSlope = slope / m;
  // Map to -1..+1: clamp at +/-0.10 relative change per step (generous)
  return Math.max(-1, Math.min(1, normSlope / 0.10));
}

export function computeSkyForesight(
  orientation: SkyOrientationType,
  rhythm:      SkyRhythmType,
  continuity:  number,
  drift:       number,   // Arc 58: numeric slope -1..+1
): SkyForecastType {
  if (orientation === 'unknown') return 'unknown';
  if (rhythm === 'fast' && continuity < 0.40) return 'stable'; // too volatile to forecast

  // Strong numeric drift overrides categorical orientation
  if (drift > 0.55)  return 'brightening';
  if (drift < -0.55) return 'dimming';

  // Moderate drift with directional orientation -> nuanced forecast
  if (orientation === 'brightening' && drift > 0.15) return 'opening';
  if (orientation === 'brightening')                  return 'brightening';
  if (orientation === 'open'       && drift > 0.10) return 'clearing';
  if (orientation === 'open')                         return 'opening';
  if (orientation === 'settling'   && drift < -0.15) return 'softening';
  if (orientation === 'settling')                     return 'settling';
  if (orientation === 'dimming'    && drift < -0.15) return 'dimming';
  if (orientation === 'dimming')                      return 'softening';
  return 'stable';
}

// ------ Full sky state composer ------------------------------------------------------------------------------------------------------------------------------------------------------------

export function computeSkyState(
  luxNow: number | null,
  luxRing: number[],
  hourOfDay: number,
  skyModeEnabled: boolean,
): SkyState {
  const isActive     = skyModeEnabled && luxNow !== null;
  const isCalibrated = luxRing.length >= MIN_SKY_SAMPLES;
  const luxVariance  = variance(luxRing);

  if (!isActive) {
    return {
      skyTone: 'unknown', identity: 'unknown', signature: null,
      rhythm: 'unknown', continuity: 1, drift: 0, orientation: 'unknown',
      foresight: 'unknown', luxNow, luxVariance: 0,
      isCalibrated: false, isActive: false,
    };
  }

  const skyTone    = computeSkyTone(luxNow, luxRing);
  const identity   = computeSkyIdentity(luxNow, skyTone, hourOfDay);
  const signature  = computeSkySignature(luxRing, skyTone);
  const rhythm     = computeSkyRhythm(luxRing);
  const continuity = computeSkyContinuity(luxRing);
  const drift      = computeSkyDrift(luxRing);          // Arc 58
  const orientation = computeSkyOrientation(luxRing);
  const foresight  = computeSkyForesight(orientation, rhythm, continuity, drift);

  return {
    skyTone, identity, signature, rhythm, continuity, drift,
    orientation, foresight, luxNow, luxVariance,
    isCalibrated, isActive,
  };
}
