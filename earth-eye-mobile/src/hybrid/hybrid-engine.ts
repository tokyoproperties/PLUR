/**
 * hybrid-engine.ts
 *
 * The unified field state — the "one sentence summary" of the world
 * around you. Sits on top of the corridor engine and adds symbolic
 * mode shaping, yard/lite overrides, and a single suggestion field.
 *
 * This is pure logic — no React, no hooks. All inputs passed in.
 *
 * Fusion pipeline:
 *   1. Sensor dominance → base field state
 *   2. Corridor tone → contextual override
 *   3. Yard firework window → dim override
 *   4. Symbolic mode → PLUR softens, LOVE warms
 *   5. Lite stillness → suggestion
 *   6. Proximity → from corridor engine
 *
 * Data quality:
 *   'live'    — both light and sound sensors active
 *   'partial' — one sensor active (motion always present)
 *   'forming' — no sensors active, field state is a guess
 */

import type { CorridorState, CorridorTone } from '@/corridor/corridor-engine';
import type { SensorSnapshot } from '@/hooks/useSensors';
import type { SymbolicMode } from '@/contexts/mode-context';
import type { LiteModeResult } from '@/modes/lite';
import type { YardModeResult } from '@/modes/yard';

export type HybridFieldState =
  | 'calm'
  | 'bright'
  | 'noisy'
  | 'still'
  | 'mixed'
  | 'alert'
  | 'dim'
  | 'forming';

export type HybridSuggestion = 'stillness' | 'explore' | 'quiet' | 'none';

export type DataQuality = 'live' | 'partial' | 'forming';

export interface HybridState {
  /** One-word summary of the environmental field */
  fieldState: HybridFieldState;
  /** Spatial relationship to mapped features (from corridor engine) */
  proximity: CorridorState['proximity'];
  /** Active symbolic mode */
  symbolic: SymbolicMode;
  /** What the system suggests the user do */
  suggestion: HybridSuggestion;
  /** 0.0–1.0, always subtle, modulated by mode */
  intensity: number;
  /** Human-readable one-line summary */
  summary: string;
  /** Whether sensors are providing real data */
  dataQuality: DataQuality;
  /** Mode-aware accent color key */
  accent: 'blue' | 'amber' | 'sage';
}

// Tone → field state mapping
const TONE_TO_FIELD: Record<CorridorTone, HybridFieldState> = {
  calm: 'calm',
  bright: 'bright',
  still: 'still',
  noisy: 'noisy',
  mixed: 'mixed',
};

export function evaluateHybrid(args: {
  snapshot: SensorSnapshot;
  corridor: CorridorState;
  mode: SymbolicMode;
  lite: LiteModeResult;
  yard: YardModeResult;
}): HybridState {
  const { snapshot, corridor, mode, lite, yard } = args;
  const { lux, motionMagnitude, soundRelativeDb } = snapshot;

  // --- 0. Data quality assessment ---
  const hasLight = lux !== null;
  const hasSound = soundRelativeDb !== null;
  const sensorCount = (hasLight ? 1 : 0) + (hasSound ? 1 : 0);
  const dataQuality: DataQuality =
    sensorCount === 2 ? 'live' : sensorCount === 1 ? 'partial' : 'forming';

  // If no sensors are active, the field state is a guess
  if (dataQuality === 'forming') {
    return {
      fieldState: 'forming',
      proximity: corridor.proximity,
      symbolic: mode,
      suggestion: 'none',
      intensity: 0,
      summary: 'forming · sensors not yet active',
      dataQuality,
      accent: mode === 'plur' ? 'blue' : 'amber',
    };
  }

  // --- 1. Base field state from sensor dominance ---
  let fieldState: HybridFieldState = 'mixed';
  let intensity = 0.30;

  if (lux !== null && lux > 800) {
    fieldState = 'bright';
    intensity = 0.40;
  } else if (soundRelativeDb !== null && soundRelativeDb > 60) {
    fieldState = 'noisy';
    intensity = 0.50;
  } else if (soundRelativeDb !== null && soundRelativeDb > 25) {
    fieldState = 'mixed';
    intensity = 0.35;
  } else if (motionMagnitude > 0.15) {
    fieldState = 'alert';
    intensity = 0.55;
  } else if (motionMagnitude < 0.02 && (soundRelativeDb === null || soundRelativeDb < 25)) {
    fieldState = 'still';
    intensity = 0.25;
  } else {
    fieldState = 'calm';
    intensity = 0.20;
  }

  // --- 2. Corridor tone override ---
  const corridorField = TONE_TO_FIELD[corridor.tone] ?? 'mixed';
  fieldState = corridorField;

  // --- 3. Yard firework window override ---
  if (yard.isFireworkWindow) {
    fieldState = 'dim';
    intensity = 0.35;
  }

  // --- 4. Symbolic mode shaping ---
  if (mode === 'plur') {
    intensity *= 0.70;
    if (fieldState === 'alert') fieldState = 'mixed';
    if (fieldState === 'noisy') fieldState = 'mixed';
  }

  if (mode === 'love') {
    intensity *= 0.80;
    if (fieldState === 'alert') fieldState = 'calm';
    if (fieldState === 'noisy') fieldState = 'calm';
  }

  // Clamp intensity
  intensity = Math.min(Math.max(intensity, 0), 0.7);

  // --- 5. Suggestion ---
  let suggestion: HybridSuggestion = 'none';

  if (lite.suggestStillness || yard.suppressActivity) {
    suggestion = 'stillness';
  } else if (fieldState === 'bright') {
    suggestion = 'quiet';
  } else if (fieldState === 'calm' || fieldState === 'still') {
    suggestion = 'explore';
  } else if (fieldState === 'dim') {
    suggestion = 'quiet';
  }

  // --- 6. Summary ---
  const parts: string[] = [fieldState];
  if (corridor.proximity === 'in-yard') parts.push('in yard');
  else if (corridor.proximity === 'near-yard') parts.push('near yard');
  else if (corridor.proximity === 'near-trail') parts.push('near trail');
  if (suggestion !== 'none') parts.push(suggestion);
  if (yard.isFireworkWindow) parts.push('firework window');
  if (dataQuality === 'partial') parts.push('partial sensors');

  // --- 7. Accent color ---
  const accent = mode === 'plur' ? 'blue' : 'amber';

  return {
    fieldState,
    proximity: corridor.proximity,
    symbolic: mode,
    suggestion,
    intensity,
    summary: parts.join(' · '),
    dataQuality,
    accent,
  };
}
