/**
 * yard.ts
 * High-sensitivity habitat protection mode.
 *
 * Yard Mode assumes the device is stationed near a wildlife-active zone
 * (a yard, patio, or garden edge) where luminance, motion, and sound
 * discipline actually matter to nearby species. It applies continuous
 * dampening curves rather than the coarse on/off checks in Lite Mode.
 *
 * Independence Day sensitivity: fireworks introduce sudden light and
 * sound spikes that are especially disruptive to nocturnal and startle-
 * prone species. During the July 4th window (see thresholds.ts),
 * Yard Mode widens its dampening curve automatically — no manual toggle
 * required. Pure logic module — no React, no hooks.
 */

import {
  classifyLux,
  classifyMotion,
  classifySound,
  isWithinJulyFourthWindow,
  LUX_THRESHOLDS,
  SOUND_THRESHOLDS,
  type LuxBand,
  type MotionBand,
  type SoundBand,
} from '@/utils/thresholds';

export interface YardModeInputs {
  lux: number | null;
  motionMagnitude: number;
  soundRelativeDb: number | null;
  /** Injectable for testing; defaults to `new Date()` inside evaluateYardMode. */
  now?: Date;
}

export interface YardModeResult {
  luxBand: LuxBand | null;
  motionBand: MotionBand;
  soundBand: SoundBand | null;
  /** 0 (no dampening) – 1 (maximum dampening) luminance dampening factor to apply to any UI glow/brightness. */
  luminanceDampening: number;
  /** 0 (no filtering) – 1 (maximum filtering) sound sensitivity multiplier. */
  soundSensitivity: number;
  /** True if today falls inside the July 4th firework sensitivity window. */
  isFireworkWindow: boolean;
  /** True if current abrupt motion should suppress non-essential UI activity. */
  suppressActivity: boolean;
  summary: string;
}

export const YARD_MODE_CONFIG = {
  name: 'yard' as const,
  label: 'Yard Mode',
  description: 'Species-safe luminance + sound discipline for stationary habitat observation.',
};

/**
 * Smoothly ramps a dampening factor (0–1) as lux drops below the
 * TWILIGHT threshold — darker conditions = more dampening.
 */
function luminanceDampeningFromLux(lux: number | null): number {
  if (lux === null) return 0;
  if (lux >= LUX_THRESHOLDS.TWILIGHT) return 0;
  if (lux <= LUX_THRESHOLDS.DARK) return 1;

  const range = LUX_THRESHOLDS.TWILIGHT - LUX_THRESHOLDS.DARK;
  const position = LUX_THRESHOLDS.TWILIGHT - lux;
  return Math.min(1, Math.max(0, position / range));
}

/**
 * Smoothly ramps a sensitivity factor (0–1) as ambient sound rises
 * above the QUIET threshold — louder conditions = more filtering.
 */
function soundSensitivityFromDb(db: number | null): number {
  if (db === null) return 0;
  if (db <= SOUND_THRESHOLDS.QUIET) return 0;
  if (db >= SOUND_THRESHOLDS.LOUD) return 1;

  const range = SOUND_THRESHOLDS.LOUD - SOUND_THRESHOLDS.QUIET;
  const position = db - SOUND_THRESHOLDS.QUIET;
  return Math.min(1, Math.max(0, position / range));
}

export function evaluateYardMode(inputs: YardModeInputs): YardModeResult {
  const now = inputs.now ?? new Date();
  const isFireworkWindow = isWithinJulyFourthWindow(now);

  const luxBand = inputs.lux !== null ? classifyLux(inputs.lux) : null;
  const motionBand = classifyMotion(inputs.motionMagnitude);
  const soundBand =
    inputs.soundRelativeDb !== null ? classifySound(inputs.soundRelativeDb) : null;

  let luminanceDampening = luminanceDampeningFromLux(inputs.lux);
  let soundSensitivity = soundSensitivityFromDb(inputs.soundRelativeDb);

  if (isFireworkWindow) {
    // Widen both curves during the firework sensitivity window — floor
    // dampening/sensitivity rather than waiting for extreme readings.
    luminanceDampening = Math.max(luminanceDampening, 0.4);
    soundSensitivity = Math.max(soundSensitivity, 0.4);
  }

  const suppressActivity = motionBand === 'abrupt';

  const summary = isFireworkWindow
    ? 'Firework sensitivity window active — luminance and sound dampening widened.'
    : suppressActivity
      ? 'Abrupt movement detected — non-essential activity suppressed.'
      : 'Habitat conditions stable.';

  return {
    luxBand,
    motionBand,
    soundBand,
    luminanceDampening,
    soundSensitivity,
    isFireworkWindow,
    suppressActivity,
    summary,
  };
}
