/**
 * lite.ts
 * Low-impact operational mode — the default, general-purpose mode.
 *
 * Lite Mode does the minimum necessary sensing to be helpful without
 * being invasive: it notices gross conditions (dark / loud / jostled)
 * but does not apply the aggressive dampening curves that Yard Mode does.
 * Pure logic module — no React, no hooks. Takes sensor snapshots in,
 * returns a decision out. Easy to unit test.
 */

import {
  classifyLux,
  classifyMotion,
  classifySound,
  type LuxBand,
  type MotionBand,
  type SoundBand,
} from '@/utils/thresholds';

export interface LiteModeInputs {
  lux: number | null;
  motionMagnitude: number;
  soundRelativeDb: number | null;
}

export interface LiteModeResult {
  luxBand: LuxBand | null;
  motionBand: MotionBand;
  soundBand: SoundBand | null;
  /** True if inputs jointly suggest the user should ease up (dark + moving + loud). */
  suggestStillness: boolean;
  /** Human-readable one-line status for a settings/status screen. */
  summary: string;
}

export const LITE_MODE_CONFIG = {
  name: 'lite' as const,
  label: 'Lite Mode',
  description: 'General field use. Minimal sensing overhead, no dampening curves.',
};

export function evaluateLiteMode(inputs: LiteModeInputs): LiteModeResult {
  const luxBand = inputs.lux !== null ? classifyLux(inputs.lux) : null;
  const motionBand = classifyMotion(inputs.motionMagnitude);
  const soundBand =
    inputs.soundRelativeDb !== null ? classifySound(inputs.soundRelativeDb) : null;

  const isDark = luxBand === 'dark' || luxBand === 'twilight';
  const isMoving = motionBand !== 'still';
  const isLoud = soundBand === 'loud';

  const suggestStillness = isDark && isMoving && isLoud;

  return {
    luxBand,
    motionBand,
    soundBand,
    suggestStillness,
    summary: suggestStillness
      ? 'Low light, movement, and noise detected together — consider pausing.'
      : 'Conditions nominal for general observation.',
  };
}
