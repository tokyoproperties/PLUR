/**
 * hybrid-engine.ts
 *
 * The unified field state — the "one sentence summary" of the world
 * around you. Sits on top of the corridor engine and adds symbolic
 * mode shaping, yard/lite overrides, and a single suggestion field.
 *
 * This is pure logic — no React, no hooks. All inputs passed in.
 *
 * Fusion pipeline (renumbered Mission 3, July 6 2026 — a redundant
 * "sensor dominance" step that used to sit before corridor tone was
 * removed as dead code; it was unconditionally overwritten every time):
 *   1. Corridor tone → base field state (the one real classifier —
 *      see corridor-engine.ts::classifyTone)
 *   2. Yard firework window → dim override
 *   3. Symbolic mode → PLUR softens, LOVE warms (mode is a *lens the
 *      user chooses*, see mode-context.tsx — never derived from sensors)
 *   4. Lite stillness → suggestion
 *   5. Confidence → weakest-signal-wins fusion of motion confidence
 *      (Mission 1) and corridor confidence (Mission 2)
 *
 * Data quality (NOT the same axis as confidence — this is about sensor
 * availability, confidence is about classification reliability):
 *   'live'    — both light and sound sensors active
 *   'partial' — one sensor active (motion always present)
 *   'forming' — no sensors active, field state is a guess
 */

import type { CorridorState, CorridorTone, CorridorConfidence } from '@/corridor/corridor-engine';
import type { SensorSnapshot } from '@/hooks/useSensors';
import type { MotionConfidence } from '@/sensors/useMotion';
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

export type HybridConfidence = 'high' | 'medium' | 'low' | 'uncertain';

// Rank order for "weakest signal wins" combination — Hybrid's overall
// confidence can never be more certain than its least certain input.
const CONFIDENCE_RANK: Record<HybridConfidence, number> = {
  high: 3,
  medium: 2,
  low: 1,
  uncertain: 0,
};

/**
 * Combines motion confidence (Mission 1) and corridor confidence
 * (Mission 2) into a single Hybrid confidence, always taking the
 * weaker of the two — Hybrid fuses both signals, so it can't be more
 * certain than whichever one it's least sure about.
 */
export function combineConfidence(
  motionConfidence: MotionConfidence,
  corridorConfidence: CorridorConfidence
): HybridConfidence {
  return CONFIDENCE_RANK[motionConfidence] <= CONFIDENCE_RANK[corridorConfidence]
    ? motionConfidence
    : corridorConfidence;
}

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
  /** Weakest-signal-wins combination of motion confidence (Mission 1) and corridor confidence (Mission 2). */
  confidence: HybridConfidence;
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
  const { lux, soundRelativeDb } = snapshot;

  // --- 0. Data quality assessment ---
  const hasLight = lux !== null;
  const hasSound = soundRelativeDb !== null;
  const sensorCount = (hasLight ? 1 : 0) + (hasSound ? 1 : 0);
  const dataQuality: DataQuality =
    sensorCount === 2 ? 'live' : sensorCount === 1 ? 'partial' : 'forming';

  // If no sensors are active, the field state is a guess
  const confidence = combineConfidence(snapshot.motionConfidence, corridor.confidence);

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
      confidence,
    };
  }

  // --- 1. Base field state from corridor tone ---
  // NOTE (Mission 3, July 6 2026): this used to be TWO independent
  // classifiers reading the same sensor snapshot — a "sensor dominance"
  // block right here, and corridor-engine.ts's own classifyTone(). The
  // corridor-tone assignment below unconditionally overwrote whatever
  // this local block computed, on every single evaluation, with no
  // exception — meaning the local block was 100% dead code. Removed it;
  // corridor.tone (see corridor-engine.ts::classifyTone) is now the one
  // real classifier for "how does the sensor field feel here." This is
  // a pure dead-code removal — behavior is identical to before, since
  // the deleted block's result was never actually used.
  let fieldState: HybridFieldState = TONE_TO_FIELD[corridor.tone] ?? 'mixed';
  let intensity = 0.30;

  // --- 2. Yard firework window override ---
  if (yard.isFireworkWindow) {
    fieldState = 'dim';
    intensity = 0.35;
  }

  // --- 3. Symbolic mode shaping ---
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

  // --- 4. Suggestion ---
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

  // --- 5. Summary ---
  const parts: string[] = [fieldState];
  if (corridor.proximity === 'in-yard') parts.push('in yard');
  else if (corridor.proximity === 'near-yard') parts.push('near yard');
  else if (corridor.proximity === 'near-trail') parts.push('near trail');
  if (suggestion !== 'none') parts.push(suggestion);
  if (yard.isFireworkWindow) parts.push('firework window');
  if (dataQuality === 'partial') parts.push('partial sensors');

  // --- 6. Accent color ---
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
    confidence,
  };
}
