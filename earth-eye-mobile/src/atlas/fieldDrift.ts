/**
 * atlas/fieldDrift.ts -- Arc 25 (DRIFT) -- hotfix
 *
 * Field Drift Engine.
 *
 * Measures how the field's behavioral character has changed over time
 * by comparing the "early field" (first half of moments) to the
 * "current field" (second half of moments).
 *
 * No new AsyncStorage key. No full soul/memory re-evaluation chain
 * (which requires currentPhase, spirit, continuity, mythology, lore).
 * Drift derives its signal directly from what each half of the ring
 * recorded -- tone distribution, corridor tone variance, species
 * frequency -- without re-composing the entire intelligence stack.
 *
 * Five drift directions:
 *   settling   -- field becoming more consistent over time
 *   brightening -- field becoming more active/outward over time
 *   wandering  -- field ranging wider, more diverse over time
 *   returning  -- field cycling back, familiar patterns strengthening
 *   seeking    -- field expanding, new territory opening
 *
 * Three stability readings:
 *   stable   -- character is consistent between halves
 *   shifting -- character is in transition
 *   volatile -- not enough signal to determine
 *
 * Confidence gate: 20+ moments (needs enough for a meaningful split).
 *
 * Pure logic -- no React, no hooks.
 */

import type { FieldMoment } from '@/atlas/fieldMoment';
import type { SymbolicMode } from '@/contexts/mode-context';

// ---- Types -----------------------------------------------------------

export type DriftDirection =
  | 'settling'
  | 'brightening'
  | 'wandering'
  | 'returning'
  | 'seeking';

export type DriftStability = 'stable' | 'shifting' | 'volatile';

export interface FieldDrift {
  direction:    DriftDirection;
  magnitude:    number;
  stability:    DriftStability;
  /** Chapter label note when measurable */
  chapterNote:  string;
  /** Whether drift has enough data to be meaningful */
  isMeasurable: boolean;
  /** Implied mode nudge from drift direction */
  impliedMode:  SymbolicMode;
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

// ---- Half-ring character extraction ----------------------------------
// Instead of re-running the full soul/memory evaluator chain (which
// requires currentPhase + 5 composed layers), we extract behavioral
// signals directly from each half of the moment ring.

interface HalfCharacter {
  /** Dominant corridor tone in this half */
  dominantTone: string | undefined;
  /** Number of unique tones seen */
  toneVariety: number;
  /** Number of unique species seen */
  speciesVariety: number;
  /** Average sensor activity (motion proxy) if available */
  activityLevel: number;
  /** Whether this half has enough data to characterize */
  isValid: boolean;
}

function characterizeHalf(moments: FieldMoment[]): HalfCharacter {
  if (moments.length < 3) {
    return { dominantTone: undefined, toneVariety: 0, speciesVariety: 0, activityLevel: 0, isValid: false };
  }

  // Tone distribution from corridor tones stored on moments
  const tones: string[] = [];
  const species = new Set<string>();
  let activitySum = 0;
  let activityCount = 0;

  for (const m of moments) {
    if (m.corridorTone) tones.push(m.corridorTone);
    if (m.speciesId)    species.add(m.speciesId);
    if (m.speciesName)  species.add(m.speciesName);
    // Motion/activity proxy: step count or sensor band if present
    if (typeof (m as any).stepCount === 'number') {
      activitySum  += (m as any).stepCount;
      activityCount++;
    }
  }

  const toneCounts: Record<string, number> = {};
  for (const t of tones) toneCounts[t] = (toneCounts[t] ?? 0) + 1;
  const sorted = Object.entries(toneCounts).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0]?.[0];

  return {
    dominantTone:   dominant,
    toneVariety:    Object.keys(toneCounts).length,
    speciesVariety: species.size,
    activityLevel:  activityCount > 0 ? activitySum / activityCount : 0,
    isValid:        true,
  };
}

// ---- Direction inference from early -> late comparison ---------------

function inferDirection(early: HalfCharacter, late: HalfCharacter): DriftDirection {
  // More species variety in late half = seeking (expanded range)
  if (late.speciesVariety > early.speciesVariety * 1.4) return 'seeking';

  // More tone variety in late half = wandering (diverse environments)
  if (late.toneVariety > early.toneVariety * 1.3) return 'wandering';

  // Less tone variety + same dominant = settling (consolidating)
  if (
    late.toneVariety <= early.toneVariety &&
    late.dominantTone === early.dominantTone &&
    early.dominantTone !== undefined
  ) return 'settling';

  // Same dominant tone but higher species = brightening (active in familiar ground)
  if (late.dominantTone === early.dominantTone && late.speciesVariety >= early.speciesVariety) {
    return late.activityLevel > early.activityLevel ? 'brightening' : 'returning';
  }

  // Tone changed but variety didn't grow much = returning (shifted to familiar)
  if (late.dominantTone !== early.dominantTone && late.toneVariety <= early.toneVariety + 1) {
    return 'returning';
  }

  // Default: field is settling
  return 'settling';
}

// ---- Magnitude -------------------------------------------------------

function computeMagnitude(early: HalfCharacter, late: HalfCharacter): number {
  let delta = 0;
  if (early.dominantTone !== late.dominantTone) delta += 0.35;
  const varietyRatio = early.toneVariety > 0
    ? Math.abs(late.toneVariety - early.toneVariety) / early.toneVariety
    : 0;
  delta += Math.min(0.30, varietyRatio * 0.3);
  const speciesRatio = early.speciesVariety > 0
    ? Math.abs(late.speciesVariety - early.speciesVariety) / early.speciesVariety
    : 0;
  delta += Math.min(0.25, speciesRatio * 0.25);
  return Math.min(1, delta);
}

// ---- Main evaluator --------------------------------------------------

export function evaluateFieldDrift(
  moments:       FieldMoment[],
): FieldDrift {
  if (moments.length < MIN_MOMENTS_FOR_DRIFT) {
    return dormant();
  }

  const split = Math.floor(moments.length / 2);
  const early = characterizeHalf(moments.slice(0, split));
  const late  = characterizeHalf(moments.slice(split));

  if (!early.isValid || !late.isValid) {
    return dormant();
  }

  const direction = inferDirection(early, late);
  const magnitude = computeMagnitude(early, late);

  let stability: DriftStability;
  if (magnitude < 0.25)       stability = 'stable';
  else if (magnitude < 0.55)  stability = 'shifting';
  else                        stability = 'volatile';

  return {
    direction,
    magnitude,
    stability,
    chapterNote:  CHAPTER_NOTES[direction],
    isMeasurable: stability !== 'volatile',
    impliedMode:  DRIFT_MODE[direction],
  };
}

// ---- Helpers ---------------------------------------------------------

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
