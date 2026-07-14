/**
 * fieldCelestial.ts
 * Arc 60: CELESTIAL FIELD -- time-of-day vertical intelligence.
 *
 * The celestial layer is the third vertical axis, sitting above sky.
 * It interprets the *temporal* character of the sky: what phase of the
 * day-night cycle the field is in, how fast it is moving through that
 * cycle, and what the horizon is leaning toward.
 *
 * WHAT THIS IS:
 *   Not new sensors. Not a camera. Not GPS sun-position.
 *   A pure interpretation of hourOfDay + luxNow + sky.drift + sky.continuity.
 *   Honest about what is available on-device without new permissions.
 *
 * WHY IT EXISTS:
 *   skyIdentity already contains 'dawn' | 'dusk' | 'night' | 'midday'.
 *   But sky does not give the narrator temporal trajectory:
 *     "Is this dusk settling toward night?"
 *     "Is this dawn brightening toward day?"
 *     "Is this midday stable or sliding toward afternoon?"
 *   CelestialState answers those questions with a typed interface the
 *   narrator can compose from directly.
 *
 * FIVE LAYERS (all pure functions):
 *   celestialPhase      categorical time-of-day phase
 *   celestialGradient   0-1 measure of temporal transition intensity
 *   celestialDrift      -1..+1 slope: negative=toward night, positive=toward day
 *   celestialOrientation directional lean of the time-of-day cycle
 *   celestialForesight  short-term temporal prediction
 *
 * All pure functions. No React. No hooks. No AsyncStorage.
 * Consumed by useFieldCelestial (hook) and SeasonalFieldCard.
 */

// ------ Types ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export type CelestialPhase =
  | 'pre-dawn'   // 04:00-06:00 and lux < 50
  | 'dawn'       // 05:30-08:00 and rising lux
  | 'morning'    // 08:00-11:00
  | 'midday'     // 11:00-14:00
  | 'afternoon'  // 14:00-17:00
  | 'dusk'       // 17:00-20:00 and falling lux
  | 'evening'    // 20:00-22:00
  | 'night'      // 22:00-04:00
  | 'unknown';

export type CelestialOrientationType =
  | 'leaning dawn'
  | 'leaning day'
  | 'leaning dusk'
  | 'leaning night'
  | 'stable'
  | 'unknown';

export type CelestialForecastType =
  | 'brightening toward day'
  | 'clearing into morning'
  | 'settling toward dusk'
  | 'dimming toward night'
  | 'stable'
  | 'unknown';

export interface CelestialState {
  phase:        CelestialPhase;
  gradient:     number;                // 0-1: how intense the temporal transition is
  drift:        number;                // -1..+1: negative=toward night, positive=toward day
  orientation:  CelestialOrientationType;
  foresight:    CelestialForecastType;
  hourOfDay:    number;                // 0-23, passed through for narrator use
  isCalibrated: boolean;              // true once lux + hour are both available
  isActive:     boolean;
}

export const MIN_CELESTIAL_LUX_SAMPLES = 8;   // fewer than sky -- phase needs less history

// ------ Helpers ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Classify the time-of-day phase from hour + luxNow.
// Lux is used as a tie-breaker for boundary zones (e.g. 6am dark vs 6am bright).
export function computeCelestialPhase(
  hour:   number,
  luxNow: number | null,
): CelestialPhase {
  const lux = luxNow ?? 0;

  if (hour >= 22 || hour < 4)  return 'night';
  if (hour >= 20)              return 'evening';
  if (hour >= 17) {
    // Dusk zone: confirm with lux (overcast 17:00 can be dim already)
    return lux < 500 ? 'dusk' : 'afternoon';
  }
  if (hour >= 14)              return 'afternoon';
  if (hour >= 11)              return 'midday';
  if (hour >= 8)               return 'morning';
  if (hour >= 6) {
    // Dawn zone: confirm with lux
    return lux >= 100 ? 'morning' : 'dawn';
  }
  if (hour >= 4)               return 'pre-dawn';
  return 'night';
}

// Gradient: how strongly the field is in a transitional zone (0=stable, 1=peak transition).
// Transitions are highest near phase boundaries: pre-dawn, dawn, dusk, evening.
export function computeCelestialGradient(
  hour:       number,
  skyDrift:   number,   // Arc 58 numeric slope
  luxNow:     number | null,
): number {
  const lux = luxNow ?? 0;

  // Hour-based transition intensity (boundary zones score higher)
  const hourIntensity = (() => {
    // Pre-dawn: 4-6
    if (hour >= 4 && hour < 6)   return 0.80;
    // Dawn: 6-8
    if (hour >= 6 && hour < 8)   return 0.65;
    // Evening: 19-21
    if (hour >= 19 && hour < 21) return 0.65;
    // Dusk: 17-19
    if (hour >= 17 && hour < 19) return 0.70;
    // Night boundaries: 21-24 / 0-4
    if (hour >= 21 || hour < 4)  return 0.30;
    // Stable daytime
    return 0.10;
  })();

  // Lux transition intensity: low lux during daytime hours = transition signal
  const luxIntensity = (lux > 0 && lux < 200 && hour >= 6 && hour < 20)
    ? Math.max(0, 1 - lux / 200)
    : 0;

  // Sky drift absolute value (already normalized 0-1)
  const driftIntensity = Math.abs(skyDrift);

  // Weighted blend
  const raw = hourIntensity * 0.50 + driftIntensity * 0.30 + luxIntensity * 0.20;
  return Math.max(0, Math.min(1, raw));
}

// Drift: signed slope of the day-night cycle.
// Positive = moving toward day (dawn, brightening morning).
// Negative = moving toward night (dusk, deepening evening).
// Derived from skyDrift + hour position within the cycle.
export function computeCelestialDrift(
  hour:     number,
  skyDrift: number,  // Arc 58 numeric slope (-1..+1)
): number {
  // Hour bias: morning hours positive, evening hours negative
  // Maps 0-23 to a sinusoidal bias centered on noon (positive) and midnight (negative)
  const hourBias = Math.sin((hour - 6) * Math.PI / 12);  // peaks at 12:00 -> +1
  // Normalise to -0.5..+0.5 range so it doesn't overpower measured drift
  const normHourBias = hourBias * 0.50;

  // Blend measured sky drift (60%) with hour bias (40%)
  const raw = skyDrift * 0.60 + normHourBias * 0.40;
  return Math.max(-1, Math.min(1, raw));
}

// Orientation: which temporal direction is the field leaning.
export function computeCelestialOrientation(
  phase:     CelestialPhase,
  drift:     number,
): CelestialOrientationType {
  if (phase === 'unknown') return 'unknown';

  if (drift > 0.25) {
    if (phase === 'pre-dawn' || phase === 'dawn') return 'leaning dawn';
    return 'leaning day';
  }
  if (drift < -0.25) {
    if (phase === 'dusk' || phase === 'evening') return 'leaning night';
    return 'leaning dusk';
  }
  return 'stable';
}

// Foresight: short-term temporal prediction from orientation + phase.
export function computeCelestialForesight(
  phase:       CelestialPhase,
  orientation: CelestialOrientationType,
  gradient:    number,
): CelestialForecastType {
  // Only meaningful in transitional phases with gradient > 0.25
  if (gradient < 0.25) return 'stable';
  if (orientation === 'unknown') return 'unknown';

  if (orientation === 'leaning dawn')  return 'brightening toward day';
  if (orientation === 'leaning day')   return 'clearing into morning';
  if (orientation === 'leaning dusk')  return 'settling toward dusk';
  if (orientation === 'leaning night') return 'dimming toward night';
  return 'stable';
}

// ------ Top-level compositor ------------------------------------------------------------------------------------------------------------------------------------------------------------------

export function computeCelestialState(
  hour:       number,
  luxNow:     number | null,
  luxRingLen: number,
  skyDrift:   number,
  isActive:   boolean,
): CelestialState {
  const neutral: CelestialState = {
    phase: 'unknown', gradient: 0, drift: 0, orientation: 'unknown',
    foresight: 'unknown', hourOfDay: hour,
    isCalibrated: false, isActive: false,
  };

  if (!isActive || luxNow === null) return neutral;

  const phase       = computeCelestialPhase(hour, luxNow);
  const gradient    = computeCelestialGradient(hour, skyDrift, luxNow);
  const drift       = computeCelestialDrift(hour, skyDrift);
  const orientation = computeCelestialOrientation(phase, drift);
  const foresight   = computeCelestialForesight(phase, orientation, gradient);

  return {
    phase, gradient, drift, orientation, foresight,
    hourOfDay: hour,
    isCalibrated: luxRingLen >= MIN_CELESTIAL_LUX_SAMPLES,
    isActive: true,
  };
}
