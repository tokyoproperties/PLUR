/**
 * atlas/fieldAlignment.ts -- Arc 19
 *
 * Field Alignment Engine.
 *
 * Computes whether the current moment is a window of alignment --
 * when field memory, soul state, mode, season, and time-of-day
 * converge into a receptive state for observation, movement, or rest.
 *
 * Three output states:
 *   aligned    -- conditions converge. Move, observe, engage.
 *   neutral    -- no strong signal. Proceed lightly.
 *   misaligned -- conditions diverge. Rest, wait, reflect.
 *
 * Alignment is NOT a mood. It is a field condition -- derived from
 * real data the system already holds. It changes with time and season.
 *
 * Pure logic -- no React, no hooks.
 */

import type { FieldWindowQuality } from '@/hooks/useSeasonalFieldWindow';
import type { FieldMemory } from '@/atlas/fieldMemory';
import type { FieldSoul } from '@/atlas/fieldSoul';
import type { SymbolicMode } from '@/contexts/mode-context';
import type { SolarWindow, CalendarSeason } from '@/hooks/useSeason';

// ---- Types -----------------------------------------------------------

export type AlignmentState = 'aligned' | 'neutral' | 'misaligned';

export type AlignmentMode = 'movement' | 'stillness' | 'observation';

export interface FieldAlignment {
  /** Overall alignment state */
  state: AlignmentState;
  /** What kind of alignment -- what the field recommends doing */
  mode: AlignmentMode;
  /** Short directive line for Field Window */
  directive: string;
  /** Whisper label for tile accents */
  label: string;
  /** 0.0 - 1.0 -- how strongly aligned (used for accent intensity) */
  strength: number;
  /** Whether the alignment engine has enough data to be meaningful */
  isCalibrated: boolean;
}

// ---- Scoring ---------------------------------------------------------

/**
 * Each factor contributes a score in [-1, +1].
 * Positive = toward aligned. Negative = toward misaligned.
 * Final score is averaged and bucketed into state.
 */

function scoreWindowQuality(quality: FieldWindowQuality): number {
  switch (quality) {
    case 'prime':    return  1.0;
    case 'good':     return  0.5;
    case 'marginal': return -0.3;
    case 'avoid':    return -1.0;
  }
}

function scoreSolarWindow(solar: SolarWindow, mode: SymbolicMode): number {
  // PLUR = outward/movement. Golden hours + morning are aligned for PLUR.
  // LOVE = inward/stillness. Night and dusk are aligned for LOVE.
  if (mode === 'plur') {
    switch (solar) {
      case 'golden-dawn': return  1.0;
      case 'morning':     return  0.8;
      case 'afternoon':   return  0.2;
      case 'golden-dusk': return  0.6;
      case 'midday':      return -0.2;
      case 'night':       return -0.5;
    }
  } else {
    switch (solar) {
      case 'night':       return  0.8;
      case 'golden-dusk': return  1.0;
      case 'golden-dawn': return  0.6;
      case 'morning':     return  0.2;
      case 'afternoon':   return -0.2;
      case 'midday':      return -0.5;
    }
  }
}

function scoreMemory(memory: FieldMemory): number {
  if (!memory.isEstablished) return 0.0; // neutral -- not enough data
  // Deep memory = stronger alignment signal
  if (memory.totalMoments >= 20) return 0.7;
  if (memory.totalMoments >= 10) return 0.4;
  if (memory.totalMoments >= 5)  return 0.2;
  return 0.0;
}

function scoreSoul(soul: FieldSoul, season: CalendarSeason): number {
  if (!soul.isEstablished) return 0.0;
  // Soul rootSeason matching current season = strong alignment
  if (soul.traits.rootSeason === season) return 0.8;
  // Soul revealed but season mismatch = mild misalignment
  if (soul.isRevealed) return -0.2;
  return 0.1;
}

// ---- Alignment mode derivation ---------------------------------------

function deriveAlignmentMode(
  solar: SolarWindow,
  mode: SymbolicMode,
  season: CalendarSeason
): AlignmentMode {
  if (mode === 'love') return 'stillness';
  // PLUR: movement during golden hours + morning in spring/fall
  if (
    (solar === 'golden-dawn' || solar === 'morning') &&
    (season === 'spring' || season === 'fall')
  ) return 'movement';
  // PLUR: observation during good-but-not-prime windows
  if (solar === 'afternoon' || solar === 'golden-dusk') return 'observation';
  if (solar === 'night') return 'stillness';
  return 'observation';
}

// ---- Directive text --------------------------------------------------

const DIRECTIVES: Record<AlignmentState, Record<AlignmentMode, string>> = {
  aligned: {
    movement:    'Field aligned. Conditions favor movement and observation.',
    stillness:   'Field aligned. Conditions favor stillness and reflection.',
    observation: 'Field aligned. Slow attention will be rewarded.',
  },
  neutral: {
    movement:    'Neutral window. Proceed lightly.',
    stillness:   'Neutral window. Rest or observe as the field offers.',
    observation: 'Neutral window. No strong signal -- follow your attention.',
  },
  misaligned: {
    movement:    'Conditions misaligned for movement. Wait for a better window.',
    stillness:   'Rest period. The field is not receptive right now.',
    observation: 'Quiet period. Observation will be limited.',
  },
};

const LABELS: Record<AlignmentState, string> = {
  aligned:    'Aligned',
  neutral:    'Neutral',
  misaligned: 'Misaligned',
};

// ---- Main evaluator --------------------------------------------------

export function evaluateFieldAlignment(
  quality: FieldWindowQuality,
  solar: SolarWindow,
  season: CalendarSeason,
  mode: SymbolicMode,
  memory: FieldMemory,
  soul: FieldSoul
): FieldAlignment {
  const isCalibrated = memory.totalMoments >= 3;

  const scores = [
    scoreWindowQuality(quality),
    scoreSolarWindow(solar, mode),
    scoreMemory(memory),
    scoreSoul(soul, season),
  ];

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  const state: AlignmentState =
    avg >= 0.35  ? 'aligned'
    : avg <= -0.3 ? 'misaligned'
    : 'neutral';

  const alignMode = deriveAlignmentMode(solar, mode, season);
  const strength = Math.min(1.0, Math.max(0.0, (avg + 1) / 2));

  return {
    state,
    mode:          alignMode,
    directive:     DIRECTIVES[state][alignMode],
    label:         LABELS[state],
    strength,
    isCalibrated,
  };
}
