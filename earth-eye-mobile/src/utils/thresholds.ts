/**
 * thresholds.ts
 * Centralized, static sensor limits for EarthEye Mobile.
 * Single source of truth — sensors and modes both read from here.
 * No magic numbers anywhere else in the sensor/mode layer.
 */

/** Ambient light (lux) bands used to classify species-safe conditions. */
export const LUX_THRESHOLDS = {
  /** Below this, treat as full dark — most sensitive nocturnal species window. */
  DARK: 2,
  /** Civil twilight / dusk-dawn band. */
  TWILIGHT: 50,
  /** Typical shaded daylight / overcast. */
  OVERCAST: 1000,
  /** Full daylight — no luminance-sensitivity concerns. */
  DAYLIGHT: 10000,
} as const;

/**
 * Motion magnitude thresholds (smoothed accelerometer delta, in g).
 *
 * CALIBRATED July 6 2026 — these were previously inconsistent across
 * the codebase: hybrid-engine.ts/sensorSummary.ts used 0.02/0.15,
 * corridor-engine.ts/plur-overlay-engine.ts used 0.03/0.15, and this
 * file's own classifyMotion() used 0.05/0.6 with GENTLE (0.25) defined
 * but never actually wired into the classify function. Different
 * engines could read the SAME raw motion sample and disagree on
 * whether the field was still or moving. Consolidated to the values
 * that already had the most convergence across the codebase (0.03
 * and 0.15) as the single canonical source — every consumer (Hybrid,
 * Corridor, PLUR overlay, Sensor Summary, Yard/Lite modes) now reads
 * through classifyMotion()/MOTION_THRESHOLDS instead of its own
 * magic numbers.
 */
export const MOTION_THRESHOLDS = {
  /** Below this windowed-mean magnitude, the field is truly at rest. */
  STILL: 0.03,
  /** Soft/gentle movement — the field waking up, not yet deliberate. */
  FORMING: 0.15,
  /** Above FORMING = active (deliberate movement with intent). No separate ceiling needed — it's the open top band. */
} as const;

/** Sound level thresholds (in dB, approximate/relative scale from mic metering). */
export const SOUND_THRESHOLDS = {
  /** Ambient quiet — safe for sensitive species observation. */
  QUIET: 40,
  /** Conversational / normal field noise. */
  MODERATE: 60,
  /** Loud — risk of disturbing wildlife, should trigger noise mitigation. */
  LOUD: 80,
} as const;

/**
 * Independence Day sensitivity window.
 * Firework activity in Orange County typically begins several days before
 * July 4th and tapers off shortly after. Yard Mode uses this to widen
 * its luminance-dampening + sound-filtering sensitivity automatically.
 */
export const JULY_FOURTH_WINDOW = {
  /** Month is 0-indexed to match JS Date — June = 5. */
  START_MONTH: 5,
  START_DAY: 28,
  END_MONTH: 6, // July = 6
  END_DAY: 6,
} as const;

/**
 * Returns true if the given date falls inside the July 4th sensitivity window.
 * Defaults to "now" if no date is provided.
 */
export function isWithinJulyFourthWindow(date: Date = new Date()): boolean {
  const month = date.getMonth();
  const day = date.getDate();

  const afterStart =
    month > JULY_FOURTH_WINDOW.START_MONTH ||
    (month === JULY_FOURTH_WINDOW.START_MONTH && day >= JULY_FOURTH_WINDOW.START_DAY);

  const beforeEnd =
    month < JULY_FOURTH_WINDOW.END_MONTH ||
    (month === JULY_FOURTH_WINDOW.END_MONTH && day <= JULY_FOURTH_WINDOW.END_DAY);

  return afterStart && beforeEnd;
}

export type LuxBand = 'dark' | 'twilight' | 'overcast' | 'daylight';
export type MotionBand = 'still' | 'forming' | 'active';
export type SoundBand = 'quiet' | 'moderate' | 'loud';

export function classifyLux(lux: number): LuxBand {
  if (lux < LUX_THRESHOLDS.DARK) return 'dark';
  if (lux < LUX_THRESHOLDS.TWILIGHT) return 'twilight';
  if (lux < LUX_THRESHOLDS.OVERCAST) return 'overcast';
  return 'daylight';
}

export function classifyMotion(magnitude: number): MotionBand {
  if (magnitude < MOTION_THRESHOLDS.STILL) return 'still';
  if (magnitude < MOTION_THRESHOLDS.FORMING) return 'forming';
  return 'active';
}

export function classifySound(db: number): SoundBand {
  if (db < SOUND_THRESHOLDS.QUIET) return 'quiet';
  if (db < SOUND_THRESHOLDS.LOUD) return 'moderate';
  return 'loud';
}
