/**
 * atlas/fieldDrift.ts -- Arc 25 (DRIFT)
 *
 * Field Drift Engine.
 *
 * Measures how the field's constellation has changed over time by
 * comparing the "early field" (first half of moments) to the "current
 * field" (second half of moments). No new storage key -- drift is
 * derived entirely from the existing ring buffer, same design
 * philosophy as sessions-over-moments and memory-over-moments.
 *
 * Why no AsyncStorage snapshot:
 *   The ring already contains the full temporal record. A snapshot
 *   would introduce a new failure surface (stale data, version
 *   mismatch, failed write) for a signal that can be derived cleanly.
 *   Comparing early vs late ring halves is honest and needs no new
 *   infrastructure.
 *
 * Five drift directions:
 *   settling   -- field becoming more consistent/stable over time
 *   brightening -- field becoming more active/outward over time
 *   wandering  -- field ranging wider, more diverse tones over time
 *   returning  -- field cycling back, familiar corridors strengthening
 *   seeking    -- field expanding, new phases/tones appearing
 *
 * Three stability readings:
 *   stable   -- constellation direction is consistent
 *   shifting -- constellation is in transition
 *   volatile -- high variance, not enough signal
 *
 * Magnitude: 0.0-1.0, how much drift has occurred.
 * A stable, deeply established field has low magnitude.
 * A field actively shifting archetype has high magnitude.
 *
 * Confidence gate: 20+ moments (need enough for a meaningful split).
 * Below that: direction='settling', magnitude=0, stability='volatile'.
 *
 * Pure logic -- no React, no hooks.
 */

import type { FieldMoment } from '@/atlas/fieldMoment';
import type { FieldMemory } from '@/atlas/fieldMemory';
import type { FieldSoul } from '@/atlas/fieldSoul';
import type { ConstellationArchetype } from '@/atlas/fieldConstellation';
import type { SymbolicMode } from '@/contexts/mode-context';
import { evaluateFieldConstellation } from '@/atlas/fieldConstellation';
import { evaluateFieldMemory } from '@/atlas/fieldMemory';
import { evaluateFieldSoul } from '@/atlas/fieldSoul';

// ---- Types -----------------------------------------------------------

export type DriftDirection =
  | 'settling'
  | 'brightening'
  | 'wandering'
  | 'returning'
  | 'seeking';

export type DriftStability = 'stable' | 'shifting' | 'volatile';

export interface FieldDrift {
  direction:   DriftDirection;
  magnitude:   number;
  stability:   DriftStability;
  /** Chapter label tint phrase (three-register: label=constellation, suggestion=reweight, chapter=drift) */
  chapterNote: string;
  /** Whether drift has enough data to be meaningful */
  isMeasurable: boolean;
  /** Implied mode nudge from drift direction */
  impliedMode: SymbolicMode;
}

// ---- Thresholds ------------------------------------------------------

const MIN_MOMENTS_FOR_DRIFT = 20;

// ---- Chapter note text -----------------------------------------------

const CHAPTER_NOTES: Record<DriftDirection, string> = {
  settling:    'Pattern settling.',
  brightening: 'Field brightening.',
  wandering:   'Field ranging wider.',
  returning:   'Familiar ground returning.',
  seeking:     'New territory opening.',
};

// ---- Mode coupling ---------------------------------------------------

const DRIFT_MODE: Record<DriftDirection, SymbolicMode> = {
  settling:    'love',
  brightening: 'plur',
  wandering:   'plur',
  returning:   'love',
  seeking:     'plur',
};

// ---- Flat reweight emphasis for split-memory evaluation --------------
// We need to evaluate constellation for early/late halves without a
// live reweight signal. Use equal weights -- we're measuring the
// moment ring, not the reweight layer.

const NEUTRAL_EMPHASIS = {
  alignment:  1/6, presence: 1/6, initiative: 1/6,
  branch:     1/6, soul:     1/6, season:     1/6,
};

// ---- Archetype transition table -------------------------------------
// Maps (early archetype) -> (late archetype) -> drift direction

type TransitionMap = Partial<Record<ConstellationArchetype, DriftDirection>>;
const TRANSITIONS: Record<ConstellationArchetype, TransitionMap> = {
  wanderer:  { wanderer: 'settling', observer: 'settling', steady: 'returning', returner: 'returning', seeker: 'seeking' },
  observer:  { observer: 'settling', wanderer: 'brightening', steady: 'settling', returner: 'returning', seeker: 'seeking' },
  steady:    { steady: 'settling', wanderer: 'brightening', observer: 'settling', returner: 'returning', seeker: 'brightening' },
  returner:  { returner: 'settling', steady: 'settling', observer: 'returning', wanderer: 'wandering', seeker: 'seeking' },
  seeker:    { seeker: 'settling', wanderer: 'wandering', observer: 'brightening', steady: 'returning', returner: 'returning' },
};

// ---- Main evaluator --------------------------------------------------

export function evaluateFieldDrift(
  moments:       FieldMoment[],
  currentMemory: FieldMemory,
  currentSoul:   FieldSoul,
): FieldDrift {
  if (moments.length < MIN_MOMENTS_FOR_DRIFT) {
    return dormant();
  }

  // Split the ring into early (first half) and late (second half)
  const split     = Math.floor(moments.length / 2);
  const early     = moments.slice(0, split);
  const late      = moments.slice(split);

  // Derive constellation for each half
  const earlyMem   = evaluateFieldMemory(early);
  const earlySoul  = evaluateFieldSoul(earlyMem, early);
  const earlyConst = evaluateFieldConstellation(earlyMem, earlySoul, NEUTRAL_EMPHASIS);

  const lateMem    = evaluateFieldMemory(late);
  const lateSoul   = evaluateFieldSoul(lateMem, late);
  const lateConst  = evaluateFieldConstellation(lateMem, lateSoul, NEUTRAL_EMPHASIS);

  // Determine drift direction from archetype transition
  const fromArch = earlyConst.archetype;
  const toArch   = lateConst.archetype;
  const direction = TRANSITIONS[fromArch]?.[toArch] ?? 'settling';

  // Magnitude: how different are the two halves?
  // - Same archetype + same tone = low magnitude
  // - Different archetype + different tone = high magnitude
  const archetypeChanged = fromArch !== toArch ? 0.45 : 0;
  const toneChanged      = earlyConst.tone !== lateConst.tone ? 0.30 : 0;
  // Confidence gap between halves (low confidence = less certain = volatile)
  const confDelta        = Math.abs(earlyConst.confidence - lateConst.confidence);
  const magnitude        = clamp(archetypeChanged + toneChanged + confDelta * 0.25, 0, 1);

  // Stability: how clear is the late constellation's confidence?
  let stability: DriftStability;
  if (lateConst.confidence >= 0.65 && magnitude < 0.3) {
    stability = 'stable';
  } else if (lateConst.confidence >= 0.50 || magnitude < 0.55) {
    stability = 'shifting';
  } else {
    stability = 'volatile';
  }

  return {
    direction,
    magnitude,
    stability,
    chapterNote:  CHAPTER_NOTES[direction],
    isMeasurable: lateConst.isFormed && stability !== 'volatile',
    impliedMode:  DRIFT_MODE[direction],
  };
}

// ---- Helpers ---------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function dormant(): FieldDrift {
  return {
    direction:    'settling',
    magnitude:    0,
    stability:    'volatile',
    chapterNote:  CHAPTER_NOTES.settling,
    isMeasurable: false,
    impliedMode:  'love',
  };
}
