/**
 * atlas/fieldReweight.ts -- Arc 23 (REWEIGHT)
 *
 * Field Reweight Engine.
 *
 * The field's first act of self-organization. Reads long-term memory
 * patterns and soul state to determine which intelligence signals
 * carry the most weight for THIS field, over time.
 *
 * This is NOT moment-to-moment adaptation -- that is what alignment,
 * presence, initiative, and branch already do. Reweight is the
 * slow layer -- it shifts over days and weeks as chapters accumulate.
 *
 * What it reads (all real, long-term data):
 *   - Chapter distribution: which phases have the most moments
 *   - Chapter tone dominance: calm/bright/still/moist/shifting across phases
 *   - Corridor history: which corridor tones persist across chapters
 *   - Species frequency: frequent vs rare -- habitat affinity signal
 *   - Soul stability: rootMovement + rootTone + isRevealed
 *   - Total chapter count vs totalMoments ratio
 *
 * What it outputs:
 *   emphasis: weights for each signal layer (0.0-1.0 normalized)
 *   dominant: which signal layer the field is currently centering
 *   toneShift: a short phrase for Field Window tone coloring
 *
 * Six signal layers:
 *   alignment  -- field is responding to time-of-day + season cycles
 *   presence   -- field is centering the user's attention state
 *   initiative -- field is action-oriented, directive
 *   branch     -- field is exploring multiple paths
 *   soul       -- field is deepening into long-term identity
 *   season     -- field is following the ecological calendar
 *
 * Priority in stack: above branch, below danger.
 * Confidence gate: only meaningful after 10+ moments.
 *
 * Pure logic -- no React, no hooks.
 */

import type { FieldMemory } from '@/atlas/fieldMemory';
import type { FieldSoul } from '@/atlas/fieldSoul';
import type { BranchPath } from '@/atlas/fieldBranch';
import type { SymbolicMode } from '@/contexts/mode-context';
import type { CalendarSeason } from '@/hooks/useSeason';

// ---- Types -----------------------------------------------------------

export type ReweightSignal =
  | 'alignment'
  | 'presence'
  | 'initiative'
  | 'branch'
  | 'soul'
  | 'season';

export interface ReweightEmphasis {
  alignment:  number;
  presence:   number;
  initiative: number;
  branch:     number;
  soul:       number;
  season:     number;
}

export interface FieldReweight {
  /** Normalized 0.0-1.0 weights per signal */
  emphasis:   ReweightEmphasis;
  /** Which signal is currently dominant */
  dominant:   ReweightSignal;
  /** Short tone-shift phrase for Field Window */
  toneShift:  string;
  /** Whether reweight has enough data to be meaningful */
  isMature:   boolean;
  /** Implied mode from dominant signal */
  impliedMode: SymbolicMode;
}

// ---- Thresholds ------------------------------------------------------

const MIN_MOMENTS_FOR_REWEIGHT = 10;

// ---- Tone shift text -------------------------------------------------

const TONE_SHIFTS: Record<ReweightSignal, string> = {
  alignment:  'Field leaning toward cycle and rhythm.',
  presence:   'Field centering your attention.',
  initiative: 'Field emphasizing movement and action.',
  branch:     'Field exploring multiple paths.',
  soul:       'Field deepening into long-term identity.',
  season:     'Field following the ecological calendar.',
};

// ---- Mode coupling ---------------------------------------------------

const SIGNAL_MODE: Record<ReweightSignal, SymbolicMode> = {
  alignment:  'plur',
  presence:   'love',
  initiative: 'plur',
  branch:     'plur',
  soul:       'love',
  season:     'plur',
};

// ---- Scoring functions -----------------------------------------------

/**
 * Alignment signal strength.
 * High when: many chapters, consistent corridor tones across phases.
 * The field that responds predictably to time-of-day and season
 * is one where alignment is the reliable guide.
 */
function scoreAlignment(memory: FieldMemory): number {
  if (memory.chapters.length < 2) return 0.3;
  // Corridor tone consistency across chapters
  const tones = memory.corridorHistory.map((c) => c.dominantTone);
  const dominant = mostCommon(tones);
  const consistency = tones.filter((t) => t === dominant).length / tones.length;
  // More chapters + more consistency = stronger alignment signal
  const chapterBonus = Math.min(0.3, memory.chapters.length * 0.06);
  return clamp(0.3 + consistency * 0.4 + chapterBonus, 0, 1);
}

/**
 * Presence signal strength.
 * High when: many moments concentrated in few chapters (depth over breadth).
 * A field with dense moments in a single chapter has a strong presence pattern.
 */
function scorePresence(memory: FieldMemory): number {
  if (memory.chapters.length === 0) return 0.2;
  const momentCounts = memory.chapters.map((c) => c.momentCount);
  const max = Math.max(...momentCounts);
  const avg = momentCounts.reduce((a, b) => a + b, 0) / momentCounts.length;
  // High ratio of max to avg = concentrated presence
  const concentration = avg > 0 ? Math.min(max / avg, 3) / 3 : 0;
  return clamp(0.2 + concentration * 0.5, 0, 1);
}

/**
 * Initiative signal strength.
 * High when: soul rootMovement is 'wandering' or 'breathing',
 * and totalMoments is high (lots of field action).
 * The action-oriented field generates strong initiative.
 */
function scoreInitiative(memory: FieldMemory, soul: FieldSoul): number {
  if (!soul.isEstablished) return 0.3;
  const movementBonus =
    soul.traits.rootMovement === 'wandering' ? 0.25
    : soul.traits.rootMovement === 'breathing' ? 0.15
    : 0;
  const momentBonus = Math.min(0.25, memory.totalMoments * 0.005);
  return clamp(0.3 + movementBonus + momentBonus, 0, 1);
}

/**
 * Branch signal strength.
 * High when: multiple chapters with different dominant tones.
 * A field that changes character across chapters is one that branches.
 */
function scoreBranch(memory: FieldMemory): number {
  if (memory.chapters.length < 2) return 0.2;
  const tones = memory.chapters
    .filter((c) => c.isFormed)
    .map((c) => c.dominantTone);
  const uniqueTones = new Set(tones).size;
  // More unique tones = more branching character
  const diversity = Math.min(uniqueTones / 4, 1);
  return clamp(0.2 + diversity * 0.5, 0, 1);
}

/**
 * Soul signal strength.
 * High when: soul is revealed (deep memory, 20+ moments),
 * and rootTone is 'still' or 'calm' (identity-stable field).
 */
function scoreSoul(soul: FieldSoul, totalMoments: number): number {
  if (!soul.isEstablished) return 0.1;
  const revealBonus = soul.isRevealed ? 0.3 : 0;
  const toneBonus =
    soul.traits.rootTone === 'still' ? 0.15
    : soul.traits.rootTone === 'calm' ? 0.10
    : 0;
  const depthBonus = Math.min(0.2, totalMoments * 0.004);
  return clamp(0.2 + revealBonus + toneBonus + depthBonus, 0, 1);
}

/**
 * Season signal strength.
 * High when: formed chapters span multiple phases (the field has
 * been observed across seasons -- seasonal guidance is validated).
 */
function scoreSeason(memory: FieldMemory): number {
  const formedPhases = memory.chapters.filter((c) => c.isFormed).length;
  const phaseBonus = Math.min(0.5, formedPhases * 0.12);
  return clamp(0.2 + phaseBonus, 0, 1);
}

// ---- Normalize -------------------------------------------------------

function normalize(raw: ReweightEmphasis): ReweightEmphasis {
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  if (total === 0) return raw;
  const factor = 1 / total;
  return {
    alignment:  raw.alignment  * factor,
    presence:   raw.presence   * factor,
    initiative: raw.initiative * factor,
    branch:     raw.branch     * factor,
    soul:       raw.soul       * factor,
    season:     raw.season     * factor,
  };
}

function dominant(e: ReweightEmphasis): ReweightSignal {
  return (Object.entries(e) as [ReweightSignal, number][])
    .reduce((a, b) => b[1] > a[1] ? b : a)[0];
}

// ---- Main evaluator --------------------------------------------------

export function evaluateFieldReweight(
  memory: FieldMemory,
  soul:   FieldSoul,
): FieldReweight {
  if (memory.totalMoments < MIN_MOMENTS_FOR_REWEIGHT) {
    // Not enough data -- return a flat, neutral reweight
    const flat: ReweightEmphasis = {
      alignment: 0.17, presence: 0.17, initiative: 0.17,
      branch: 0.17, soul: 0.17, season: 0.15,
    };
    return {
      emphasis:    flat,
      dominant:    'season',
      toneShift:   TONE_SHIFTS.season,
      isMature:    false,
      impliedMode: 'plur',
    };
  }

  const raw: ReweightEmphasis = {
    alignment:  scoreAlignment(memory),
    presence:   scorePresence(memory),
    initiative: scoreInitiative(memory, soul),
    branch:     scoreBranch(memory),
    soul:       scoreSoul(soul, memory.totalMoments),
    season:     scoreSeason(memory),
  };

  const emphasis = normalize(raw);
  const dom      = dominant(emphasis);

  return {
    emphasis,
    dominant:    dom,
    toneShift:   TONE_SHIFTS[dom],
    isMature:    true,
    impliedMode: SIGNAL_MODE[dom],
  };
}

// ---- Utils -----------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function mostCommon<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  const counts = new Map<T, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].reduce((a, b) => b[1] > a[1] ? b : a)[0];
}
