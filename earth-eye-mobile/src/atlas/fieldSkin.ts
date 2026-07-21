/**
 * fieldSkin.ts
 * Arc 62: EARTHSKIN -- derived tactile/comfort field.
 *
 * THE HONEST REALITY:
 *   Expo does not export AmbientTemperature or Humidity sensors.
 *   There is no expo-temperature or expo-humidity package.
 *   We cannot read ambient temperature or relative humidity from hardware.
 *
 * WHAT THIS IS INSTEAD:
 *   A pure composition layer that derives a *comfort index* from signals
 *   we already have. It reads from sky (lux), celestial (time-of-day phase),
 *   and nose (pressure orientation) -- all already computed -- and
 *   synthesizes a tactile interpretation.
 *
 *   This is the same architectural pattern as:
 *     Arc 44 (Alignment) -- cross-layer agreement from existing signals
 *     Arc 46 (Integrity) -- structural non-contradiction from existing layers
 *     Arc 59 (EarthMouth) -- tri-field synthesis from existing phrases
 *
 * WHAT IT MEASURES:
 *   skinIdentity     categorical comfort regime (cold/cool/neutral/warm/hot)
 *   skinComfort      0-1 comfort index (1 = perfectly comfortable)
 *   skinContinuity   0-1 stability of the comfort signal (1 = stable)
 *   skinOrientation  warming | cooling | stable
 *   skinForesight    warming | cooling | settling | holding
 *
 * DERIVATION:
 *   Thermal load estimate from:
 *     - lux (solar radiation proxy: high daytime lux = heat input)
 *     - celestial phase (midday/afternoon = peak thermal load)
 *     - hourOfDay (baseline thermal curve: coldest at 5am, hottest at 15:00)
 *     - sky foresight (brightening = warming, dimming = cooling)
 *     - nose orientation (falling pressure = cooling trend)
 *
 *   No new sensor subscriptions. No new hooks beyond the composition layer.
 *   All pure functions. No React.
 */

// -- Types --------------------------------------------------------------------

export type SkinIdentity =
  | 'cold'      // estimated thermal load very low
  | 'cool'      // below comfort zone
  | 'neutral'   // comfortable range
  | 'warm'      // above comfort, tolerable
  | 'hot'       // high thermal load
  | 'unknown';

export type SkinOrientationType =
  | 'warming'
  | 'cooling'
  | 'stable'
  | 'unknown';

export type SkinForecastType =
  | 'warming'
  | 'cooling'
  | 'settling'
  | 'holding'
  | 'unknown';

export interface SkinState {
  identity:      SkinIdentity;
  comfort:       number;           // 0-1 (1 = perfectly comfortable)
  continuity:    number;           // 0-1 (1 = stable comfort)
  orientation:   SkinOrientationType;
  foresight:     SkinForecastType;
  thermalLoad:   number;           // 0-1 estimated thermal load (0 = none)
  isCalibrated:  boolean;
  isActive:      boolean;
}

// -- Types for inputs ---------------------------------------------------------
// These mirror the types from the existing fields we read from.

import type { CelestialPhase } from '@/atlas/fieldCelestial';
import type { NoseOrientationType } from '@/atlas/fieldNose';

// -- Helpers ------------------------------------------------------------------

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// -- Thermal Load Estimation --------------------------------------------------
// Combines three signals into a 0-1 thermal load estimate:
//   1. Hour-based thermal curve (baseline, always available)
//   2. Lux-based solar contribution (when sky is active)
//   3. Celestial phase weighting (midday/afternoon = peak)

export function computeThermalLoad(
  hour:          number,
  luxNow:        number | null,
  celestialPhase: CelestialPhase,
): number {
  // Hour-based thermal curve: coldest ~5am, hottest ~15:00 (3pm)
  // Uses a cosine curve shifted to peak at 15:00
  const hourThermal = (() => {
    // Distance from 5am (coldest) in hours, mapped to a 0-1 curve
    // Peak at 15:00 (10 hours after minimum)
    const hoursSinceMin = ((hour - 5) + 24) % 24;
    // Cosine: 0 at hour 5 (min), 1 at hour 15 (max), back to 0 at hour 5 next day
    const thermal = (1 - Math.cos(hoursSinceMin * Math.PI / 10)) / 2;
    return clamp01(thermal);
  })();

  // Lux contribution: solar radiation adds heat
  // 0-100 lux = negligible solar heat, 10000+ lux = full solar load
  const luxThermal = luxNow !== null
    ? clamp01(Math.log10(Math.max(1, luxNow)) / 4) // log scale: 1=0, 10=0.25, 100=0.5, 1000=0.75, 10000=1.0
    : 0;

  // Celestial phase weighting
  const PHASE_WEIGHT: Record<CelestialPhase, number> = {
    'pre-dawn': 0.10,
    'dawn':     0.25,
    'morning':  0.55,
    'midday':   0.90,
    'afternoon': 0.85,
    'dusk':     0.55,
    'evening':  0.30,
    'night':    0.10,
    'unknown':  0.40,
  };
  const phaseWeight = PHASE_WEIGHT[celestialPhase] ?? 0.40;

  // Blend: hour thermal (50%) + lux thermal (30%) + phase weight (20%)
  return clamp01(hourThermal * 0.50 + luxThermal * 0.30 + phaseWeight * 0.20);
}

// -- Skin Identity ------------------------------------------------------------

export function computeSkinIdentity(
  thermalLoad: number,
): SkinIdentity {
  if (thermalLoad < 0.20) return 'cold';
  if (thermalLoad < 0.40) return 'cool';
  if (thermalLoad < 0.65) return 'neutral';
  if (thermalLoad < 0.82) return 'warm';
  return 'hot';
}

// -- Skin Comfort (0-1, 1 = most comfortable) ---------------------------------
// Comfort is highest in the neutral range (0.40-0.65 thermal load).
// Discomfort increases at both extremes (cold and hot).

export function computeSkinComfort(
  thermalLoad: number,
  skyForesight: string,    // sky.foresight value
  noseOrientation: NoseOrientationType,
): number {
  // Base comfort: bell curve centered on neutral range
  // Peak comfort at thermalLoad = 0.52 (center of neutral)
  const distance = Math.abs(thermalLoad - 0.52);
  const baseComfort = clamp01(1 - distance * 2.2);

  // Sky foresight penalty: rapid change = less comfortable
  const shifting = skyForesight === 'brightening' || skyForesight === 'clearing';
  const comfortShift = shifting ? -0.08 : 0;

  // Nose orientation bonus: rising pressure (stable weather) = more comfortable
  const pressureBonus = noseOrientation === 'rising' ? 0.04 : 0;
  const pressurePenalty = noseOrientation === 'falling' ? -0.04 : 0;

  return clamp01(baseComfort + comfortShift + pressureBonus + pressurePenalty);
}

// -- Skin Continuity ----------------------------------------------------------
// Stability of the comfort signal over time. Since we don't have a ring of
// thermal loads (this is a composition layer, not a sensor layer), we
// derive continuity from the stability of the input signals:
//   - sky continuity (lux stability)
//   - nose continuity (pressure stability)
// Both are passed in as 0-1 values.

export function computeSkinContinuity(
  skyContinuity:  number,
  noseContinuity: number,
): number {
  // Average of the two source continuities, weighted toward sky
  // (lux changes are more relevant to thermal comfort than pressure)
  return clamp01(skyContinuity * 0.60 + noseContinuity * 0.40);
}

// -- Skin Orientation ---------------------------------------------------------
// Which direction is the comfort signal moving?
// Derived from sky foresight + nose orientation.

export function computeSkinOrientation(
  skyForesight:    string,
  noseOrientation: NoseOrientationType,
  thermalLoad:     number,
): SkinOrientationType {
  // Sky foresight is the primary signal: brightening = warming, dimming = cooling
  const skySignal = skyForesight === 'brightening' || skyForesight === 'clearing' ? 'warming'
    : skyForesight === 'dimming' || skyForesight === 'softening' ? 'cooling'
    : null;

  // Nose orientation is secondary
  const noseSignal = noseOrientation === 'falling' ? 'cooling'
    : noseOrientation === 'rising' ? 'warming'
    : null;

  // If both agree, that's the orientation
  if (skySignal && noseSignal && skySignal === noseSignal) return skySignal;
  // If sky says something, trust sky (primary thermal signal)
  if (skySignal) return skySignal;
  // If only nose says something
  if (noseSignal) return noseSignal;
  // Default: stable (no trend signals)
  return 'stable';
}

// -- Skin Foresight -----------------------------------------------------------
// Short-term comfort prediction. Does not forecast temperature (we don't
// have a temperature sensor). It forecasts the *direction of comfort change*.

export function computeSkinForesight(
  identity:    SkinIdentity,
  orientation:  SkinOrientationType,
  continuity:  number,
): SkinForecastType {
  if (orientation === 'unknown' || orientation === 'stable') return 'holding';
  // Suppress foresight if continuity is very low (chaotic signals)
  if (continuity < 0.30) return 'holding';

  if (orientation === 'warming') {
    // If already hot and warming -> continuing to warm
    if (identity === 'hot' || identity === 'warm') return 'warming';
    // If cool/cold and warming -> settling (becoming more comfortable)
    return 'settling';
  }
  // orientation === 'cooling'
  if (identity === 'hot' || identity === 'warm') return 'settling';
  return 'cooling';
}

// -- Full skin state composer --------------------------------------------------

export function computeSkinState(
  hour:            number,
  luxNow:          number | null,
  celestialPhase:  CelestialPhase,
  skyForesight:    string,
  skyContinuity:   number,
  noseOrientation: NoseOrientationType,
  noseContinuity:  number,
  isActive:        boolean,
): SkinState {
  const neutral: SkinState = {
    identity: 'unknown', comfort: 0.5, continuity: 0.5,
    orientation: 'unknown', foresight: 'unknown',
    thermalLoad: 0, isCalibrated: false, isActive: false,
  };

  if (!isActive) return neutral;

  const thermalLoad = computeThermalLoad(hour, luxNow, celestialPhase);
  const identity    = computeSkinIdentity(thermalLoad);
  const comfort     = computeSkinComfort(thermalLoad, skyForesight, noseOrientation);
  const continuity  = computeSkinContinuity(skyContinuity, noseContinuity);
  const orientation = computeSkinOrientation(skyForesight, noseOrientation, thermalLoad);
  const foresight   = computeSkinForesight(identity, orientation, continuity);

  return {
    identity, comfort, continuity, orientation, foresight,
    thermalLoad,
    // Calibrated when we have enough input signals (sky + nose both active)
    isCalibrated: skyContinuity > 0 && noseContinuity > 0,
    isActive: true,
  };
}
