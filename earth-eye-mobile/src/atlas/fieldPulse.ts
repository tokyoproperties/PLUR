/**
 * fieldPulse.ts
 * Arc 64: EARTHPULSE -- synthetic physiological load field.
 *
 * THE HONEST REALITY:
 *   Expo does not export a heart-rate sensor. There is no pulse oximeter,
 *   no biometric sensor, no health API in the sensor stack.
 *   EarthPulse is NOT heart rate.
 *
 * WHAT THIS IS INSTEAD:
 *   A pure composition layer that synthesizes an environmental + mobility
 *   load index from four existing field states. It reads from:
 *     - foot (movement load: cadence, motion, speed)
 *     - sky (environmental load: lux, drift)
 *     - nose (pressure load: drift magnitude)
 *     - skin (comfort load: thermal load)
 *
 *   The "pulse" is the aggregate stress/load of the environment on the
 *   naturalist standing in the field. High pulse = the field is demanding
 *   attention (movement + changing light + falling pressure + heat).
 *   Low pulse = the field is calm (still, stable, comfortable).
 *
 *   This is the same architectural pattern as:
 *     Arc 59 (EarthMouth) -- tri-field synthesis
 *     Arc 62 (EarthSkin) -- derived thermal comfort
 *     Arc 63 (EarthFoot) -- derived mobility
 *
 * WHAT IT MEASURES:
 *   pulseIdentity   categorical load regime (calm/rising/elevated/spiking)
 *   pulseLoad       0-1 normalized aggregate load
 *   pulseContinuity 0-1 stability of the load signal
 *   pulseDrift      -1..+1 signed slope of load ring
 *   pulseForesight   rising|settling|spiking|softening|holding
 *
 * All pure functions. No React. No hooks. No sensors.
 */

// -- Types --------------------------------------------------------------------

export type PulseIdentity =
  | 'calm'       // load < 0.25 -- the field is quiet
  | 'rising'     // 0.25-0.45 -- something is happening
  | 'elevated'   // 0.45-0.70 -- the field is active
  | 'spiking'    // > 0.70 -- the field is demanding attention
  | 'unknown';

export type PulseForecastType =
  | 'rising'
  | 'settling'
  | 'spiking'
  | 'softening'
  | 'holding'
  | 'unknown';

export interface PulseState {
  identity:       PulseIdentity;
  load:           number;          // 0-1 aggregate load
  continuity:     number;         // 0-1 stability of load
  drift:          number;         // -1..+1 slope of load ring
  foresight:      PulseForecastType;
  isCalibrated:   boolean;
  isActive:       boolean;
}

// -- Input type (values from existing field states) ---------------------------

export interface PulseInputs {
  /** Foot: normalized movement intensity (0-1) */
  footIntensity:     number;
  /** Sky: normalized environmental intensity (0-1) */
  skyIntensity:      number;
  /** Nose: pressure load (0-1, derived from drift magnitude) */
  noseIntensity:     number;
  /** Skin: comfort displacement (0-1, how far from neutral) */
  skinIntensity:     number;
  /** Cross-field variance (0-1, 1 = all fields chaotic) */
  continuityIntensity: number;
}

// -- Helpers ------------------------------------------------------------------

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// Arc 68: sensor value safety -- clamps load to 0-1, guards NaN
function safeClamp01(v: number): number {
  if (isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

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

// -- Pulse Load (aggregate) ---------------------------------------------------
// Weighted blend of four intensity signals.
// Foot is primary (40%) because movement is the biggest load factor.
// Sky is secondary (25%) because light/heat is the biggest environmental factor.
// Nose is tertiary (20%) because pressure changes signal weather stress.
// Continuity is quaternary (15%) because rapid cross-field change adds load.

export function computePulseLoad(inputs: PulseInputs): number {
  return clamp01(
    0.40 * inputs.footIntensity +
    0.25 * inputs.skyIntensity +
    0.20 * inputs.noseIntensity +
    0.15 * inputs.continuityIntensity
  );
}

// -- Pulse Identity -----------------------------------------------------------

export function computePulseIdentity(load: number): PulseIdentity {
  if (load < 0.25) return 'calm';
  if (load < 0.45) return 'rising';
  if (load < 0.70) return 'elevated';
  return 'spiking';
}

// -- Pulse Continuity ---------------------------------------------------------
// Stability of the load signal over time. Low variance = high continuity.

export function computePulseContinuity(pulseRing: number[]): number {
  if (pulseRing.length < 2) return 1;
  const sd = stddev(pulseRing);
  // Normalize: 0 variance = 1.0 (stable), 0.20 variance = 0.0 (chaotic)
  // Pulse load values are 0-1, so 0.20 variance is a very wide swing
  return clamp01(1 - sd / 0.20);
}

// -- Pulse Drift --------------------------------------------------------------
// Signed slope of the pulse ring. Linear regression, same pattern as
// Arc 58 (sky drift) and Arc 61 (nose drift).

export function computePulseDrift(pulseRing: number[]): number {
  if (pulseRing.length < MIN_PULSE_SAMPLES) return 0;
  const n = pulseRing.length;
  const m = mean(pulseRing);
  if (m <= 0) return 0;

  const meanI = (n - 1) / 2;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanI) * (pulseRing[i]! - m);
    den += (i - meanI) ** 2;
  }
  const slope = den > 0 ? num / den : 0;
  // Normalize: 0.02 load/sample = full scale.
  // Load changes slowly. A 0.02 change per sample = significant shift.
  const normSlope = slope / 0.02;
  return clamp(normSlope, -1, 1);
}

// -- Pulse Foresight ----------------------------------------------------------
// Predict the direction of load change.

export function computePulseForesight(
  identity:    PulseIdentity,
  drift:       number,
  continuity:  number,
): PulseForecastType {
  if (Math.abs(drift) < 0.08) return 'holding';

  // Suppress foresight if continuity is very low (chaotic load)
  if (continuity < 0.30) return 'holding';

  if (drift > 0.08) {
    // Load rising
    if (identity === 'spiking') return 'spiking';
    return 'rising';
  }
  // drift < -0.08: load falling
  if (identity === 'calm') return 'settling';
  return 'softening';
}

// -- Full pulse state composer ------------------------------------------------

export const MIN_PULSE_SAMPLES = 8;

export function computePulseState(
  inputs:      PulseInputs,
  pulseRing:   number[],
  isActive:    boolean,
): PulseState {
  const neutral: PulseState = {
    identity: 'unknown', load: 0, continuity: 1, drift: 0,
    foresight: 'unknown', isCalibrated: false, isActive: false,
  };

  if (!isActive) return neutral;

  const load       = safeClamp01(computePulseLoad(inputs));  // Arc 68: clamp 0-1, guard NaN
  const identity   = computePulseIdentity(load);
  const continuity = computePulseContinuity(pulseRing);
  const drift      = computePulseDrift(pulseRing);
  const foresight  = computePulseForesight(identity, drift, continuity);

  return {
    identity, load, continuity, drift, foresight,
    isCalibrated: pulseRing.length >= MIN_PULSE_SAMPLES,
    isActive: true,
  };
}

// -- Input derivation helpers -------------------------------------------------
// These functions derive the intensity values from existing field states.
// They are exported so the hook can use them without duplicating logic.

/** Foot intensity: normalize cadence + motion into 0-1 */
export function deriveFootIntensity(
  cadence:       number,
  motionBand:    string,   // 'still' | 'forming' | 'active'
  gpsSpeed:      number | null,
): number {
  // Cadence: 0 = still, 120+ = full intensity
  const cadenceLoad = clamp01(cadence / 120);

  // Motion band adds intensity
  const bandLoad = motionBand === 'active' ? 0.60
    : motionBand === 'forming' ? 0.30
    : 0.05;

  // GPS speed: 0 = still, 5+ m/s = full
  const speedLoad = gpsSpeed !== null ? clamp01(gpsSpeed / 5) : 0;

  // Blend: cadence (50%) + band (30%) + speed (20%)
  return clamp01(cadenceLoad * 0.50 + bandLoad * 0.30 + speedLoad * 0.20);
}

/** Sky intensity: log-scaled lux + drift magnitude */
export function deriveSkyIntensity(
  luxNow:    number | null,
  skyDrift:  number,
): number {
  // Lux: log scale, 1 = 0, 10000 = 1.0
  const luxLoad = luxNow !== null
    ? clamp01(Math.log10(Math.max(1, luxNow)) / 4)
    : 0.30; // unknown lux = moderate baseline

  // Drift magnitude: |drift| * 0.3 adds load for rapid change
  const driftLoad = Math.abs(skyDrift) * 0.30;

  return clamp01(luxLoad * 0.70 + driftLoad);
}

/** Nose intensity: pressure drift magnitude (falling pressure = higher load) */
export function deriveNoseIntensity(
  noseDrift:      number,
  noseIdentity:   string,
): number {
  // Falling pressure (negative drift) = higher load
  // Rising pressure (positive drift) = lower load
  const driftMag = Math.abs(noseDrift);
  // Falling pressure carries more load than rising
  const directionBias = noseDrift < 0 ? 0.10 : 0;

  // Low pressure identity adds load
  const identityLoad = noseIdentity === 'low' ? 0.20
    : noseIdentity === 'high' ? 0.05
    : 0.10;

  return clamp01(driftMag * 0.60 + directionBias + identityLoad);
}

/** Skin intensity: comfort displacement from neutral */
export function deriveSkinIntensity(
  skinComfort:    number,
  skinThermalLoad: number,
): number {
  // Discomfort = 1 - comfort
  const discomfortLoad = 1 - skinComfort;

  // Thermal displacement from 0.52 (neutral center)
  const thermalDisplacement = Math.abs(skinThermalLoad - 0.52);

  // Blend: discomfort (60%) + thermal displacement (40%)
  return clamp01(discomfortLoad * 0.60 + thermalDisplacement * 0.40 * 2);
}

/** Continuity intensity: cross-field variance (1 = all fields chaotic) */
export function deriveContinuityIntensity(
  skyContinuity:   number,
  noseContinuity:  number,
  footContinuity:  number,
  skinContinuity:  number,
): number {
  // Average continuity across all fields
  const avgContinuity = (skyContinuity + noseContinuity + footContinuity + skinContinuity) / 4;
  // Invert: low continuity = high intensity (chaotic = loaded)
  return clamp01(1 - avgContinuity);
}
