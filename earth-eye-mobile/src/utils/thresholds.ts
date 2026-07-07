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

/**
 * Corridor proximity radii (meters). Previously hardcoded as local
 * constants inside corridor-engine.ts — moved here July 6 2026
 * (Mission 2 — Corridor Engine Stability) so the yard/trail hooks,
 * the pure engine, and any future consumer all read the same values.
 */
export const CORRIDOR_THRESHOLDS = {
  /** A 9x20ft plot is well below map scale — 50m is generous. */
  YARD_RADIUS_M: 50,
  NEAR_YARD_RADIUS_M: 200,
  NEAR_TRAIL_RADIUS_M: 500,
} as const;

/**
 * GPS fix quality thresholds. accuracy is expo-location's reported
 * horizontal accuracy in meters (68% confidence radius per Android/iOS
 * convention — smaller is better). Previously captured but never
 * actually used anywhere downstream — every fix was trusted equally
 * regardless of how noisy it was.
 */
export const GPS_THRESHOLDS = {
  /** Accuracy at or below this is a trustworthy fix. */
  GOOD_ACCURACY_M: 20,
  /** Accuracy at or above this is noisy — treat with reduced confidence. */
  POOR_ACCURACY_M: 65,
  /** A fix older than this with no update is stale — confidence degrades even without a new reading. */
  STALE_MS: 45000,
} as const;

/**
 * Seasonal phase date ranges (Mission 5 — Atlas Seasonal Profile,
 * July 6 2026). Centralized from atlas/seasonalProfile.ts, where these
 * were nested if/else month/day literals with no shared name. Ordered
 * chronologically (ordinal-ascending) on purpose — see the in-array
 * comment for why the order itself is load-bearing, not decorative.
 * getSeasonalPhase() finds the latest boundary at or before the
 * current date, defaulting to winter-night (the wraparound phase) if
 * the date is before all of them.
 */
export const SEASON_BOUNDARIES: ReadonlyArray<{
  phase: 'early-spring' | 'transitional' | 'high-summer' | 'late-autumn' | 'winter-night';
  startMonth: number; // 0-11
  startDay: number;
}> = [
  // Chronological (ordinal-ascending) order matters -- getSeasonalPhase()
  // scans this in order and keeps the LAST boundary at or before the
  // current date, so it must be sorted, not calendar-reading-order.
  // winter-night is last on purpose: it is the wraparound phase (Dec 1
  // through Feb 14, spanning the year boundary), and also the default
  // when the date falls before ALL boundaries (early January, which is
  // still chronologically inside the PRIOR year's winter-night).
  { phase: 'early-spring', startMonth: 1, startDay: 15 },   // Feb 15
  { phase: 'transitional', startMonth: 4, startDay: 1 },    // May 1
  { phase: 'high-summer', startMonth: 5, startDay: 15 },    // Jun 15
  { phase: 'late-autumn', startMonth: 8, startDay: 16 },    // Sep 16
  { phase: 'winter-night', startMonth: 11, startDay: 1 },   // Dec 1
] as const;

/**
 * Minimum accumulated Field Moments before a seasonal pattern can be
 * assessed at all, and the per-phase ratio a recent-moments window
 * must clear to call the pattern "confirmed" rather than "unclear."
 * Each phase watches a different signal (bright afternoons for high
 * summer, calm/still nights for winter, etc.) so the ratios are
 * deliberately different values, not one duplicated cutoff — but they
 * were previously inline literals in a switch statement with no name.
 */
export const SEASON_PATTERN_THRESHOLDS = {
  MIN_MOMENTS_FOR_PATTERN: 5,
  HIGH_SUMMER_BRIGHT_RATIO: 0.2,
  WINTER_NIGHT_CALM_RATIO: 0.4,
  EARLY_SPRING_CALM_RATIO: 0.3,
  LATE_AUTUMN_CALM_RATIO: 0.3,
  /** A confirmed ratio must clear its threshold by at least this multiple to count as 'high' confidence rather than 'medium'. */
  HIGH_CONFIDENCE_MARGIN: 1.5,
  /** Sample size (total moments) needed, in addition to margin, for 'high' confidence. */
  HIGH_CONFIDENCE_MIN_MOMENTS: 10,
} as const;

/**
 * Field Session boundary (Mission 6 — Field Memory, July 7 2026).
 * Sessions are DERIVED from time gaps between consecutive Field
 * Moments rather than driven by explicit start/end events wired to
 * app foreground/background — see fieldSession.ts header for why.
 * 45 minutes: long enough that the periodic 5-minute forced-capture
 * cadence (fieldMoment.ts::shouldCaptureMoment) never falsely splits
 * one continuous outing, short enough that a real gap (drove home,
 * came back tomorrow) reliably reads as two sessions.
 */
export const SESSION_GAP_THRESHOLD_MS = 45 * 60 * 1000;

/**
 * Lux cutoffs used OUTSIDE the sky-rendering domain (LUX_THRESHOLDS
 * above is calibrated for moon/sky luminance, not ecology or corridor
 * "feel"). Centralized here July 6 2026 (Mission 4 — Ecosystem Species
 * Model) after finding FOUR different lux cutoffs answering "is it
 * bright/dim right now" scattered across three files, none agreeing:
 * corridor-engine.ts used 800/20, ecosystem-engine.ts used 400/50, and
 * speciesArrival.ts independently used 100 (in two places) for what is
 * conceptually the identical question ecosystem-engine.ts already
 * answers — "is it bright enough for sun-loving canon species to be
 * active." Two genuinely different domains are kept as two named
 * groups rather than forced to one number: corridor tone is a general
 * ambience-feel classification, ecosystem/arrival is specifically
 * about the 10 canon species' light preferences.
 */
export const CORRIDOR_TONE_LUX_THRESHOLDS = {
  DIM: 20,
  BRIGHT: 800,
} as const;

export const ECOSYSTEM_LUX_THRESHOLDS = {
  /** Below this, low-light/nocturnal species conditions are met (bats, frogs after dark). */
  LOW: 50,
  /** Above this, diurnal sun-loving species conditions are met (basking lizards, ground squirrels). */
  BRIGHT: 400,
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
export type LocationConfidence = 'high' | 'medium' | 'low' | 'uncertain';

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

/**
 * Classifies a GPS fix's reliability from its reported accuracy and
 * how long ago it arrived. A fix can be accurate but stale (device
 * stopped updating) or fresh but noisy (poor signal) — both degrade
 * confidence, checked independently.
 */
export function classifyLocationConfidence(
  accuracyMeters: number | null,
  ageMs: number
): LocationConfidence {
  if (accuracyMeters === null) return 'uncertain';
  if (ageMs >= GPS_THRESHOLDS.STALE_MS) return 'uncertain';
  if (accuracyMeters >= GPS_THRESHOLDS.POOR_ACCURACY_M) return 'low';
  if (accuracyMeters > GPS_THRESHOLDS.GOOD_ACCURACY_M) return 'medium';
  return 'high';
}
