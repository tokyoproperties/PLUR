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

/** Motion magnitude thresholds (derived from accelerometer, in g). */
export const MOTION_THRESHOLDS = {
  /** Below this magnitude delta, device/observer is considered stationary. */
  STILL: 0.05,
  /** Gentle handheld movement — walking pace observation. */
  GENTLE: 0.25,
  /** Abrupt movement — startles wildlife, should trigger dampening. */
  ABRUPT: 0.6,
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
export type MotionBand = 'still' | 'gentle' | 'abrupt';
export type SoundBand = 'quiet' | 'moderate' | 'loud';

export function classifyLux(lux: number): LuxBand {
  if (lux < LUX_THRESHOLDS.DARK) return 'dark';
  if (lux < LUX_THRESHOLDS.TWILIGHT) return 'twilight';
  if (lux < LUX_THRESHOLDS.OVERCAST) return 'overcast';
  return 'daylight';
}

export function classifyMotion(magnitude: number): MotionBand {
  if (magnitude < MOTION_THRESHOLDS.STILL) return 'still';
  if (magnitude < MOTION_THRESHOLDS.ABRUPT) return 'gentle';
  return 'abrupt';
}

export function classifySound(db: number): SoundBand {
  if (db < SOUND_THRESHOLDS.QUIET) return 'quiet';
  if (db < SOUND_THRESHOLDS.LOUD) return 'moderate';
  return 'loud';
}
