/**
 * atlas/fieldForesight.ts -- Arc 28 (FORESIGHT)
 *
 * Field Foresight Engine.
 *
 * The first anticipatory layer. Reads outputs of harmony + the three
 * slow siblings to compute where the field is likely to go next.
 *
 * Inputs: FieldReweight + FieldConstellation + FieldDrift + FieldHarmony
 * Does NOT read atlas.moments directly.
 * Does NOT call evaluateFieldSoul or evaluateFieldMemory.
 * Arc 26 doctrine: each layer reads from its appropriate source.
 * Foresight is a coherence+trajectory reader, one level above harmony.
 *
 * Architecture position:
 *   ring -> [reweight, constellation, drift] -> harmony -> foresight
 *
 * Five forecast states:
 *   opening    -- field likely to broaden, expand attention range
 *   deepening  -- field likely to stabilize, concentrate inward
 *   turning    -- field likely to shift its archetype character
 *   brightening -- field likely to increase activity/initiative
 *   cooling    -- field likely to reduce intensity, settle
 *
 * These are predictions, not moods or directives. They are derived from
 * the weighted consensus of four independent signals.
 *
 * Voting system (not arbitrary weighting):
 *   Each of the four sources casts a vote for a forecast state.
 *   The state with the most weighted votes wins.
 *   Tie: harmony mood is the tiebreaker (most recent coherence signal).
 *
 * Confidence gate: harmony.isReadable (at least one slow sibling active).
 * Below that: forecast='deepening', confidence=0, isActive=false.
 *
 * Pure logic -- no React, no hooks.
 */

import type { FieldReweight, ReweightSignal } from '@/atlas/fieldReweight';
import type { FieldConstellation, ConstellationArchetype } from '@/atlas/fieldConstellation';
import type { FieldDrift, DriftDirection } from '@/atlas/fieldDrift';
import type { FieldHarmony, HarmonyMood } from '@/atlas/fieldHarmony';

// ---- Types -----------------------------------------------------------

export type ForesightState =
  | 'opening'
  | 'deepening'
  | 'turning'
  | 'brightening'
  | 'cooling';

export interface FieldForesight {
  forecast:   ForesightState;
  confidence: number;    // 0-1: vote share of winning state
  label:      string;    // single ambient word for the footer
  isActive:   boolean;   // whether foresight has enough signal
}

// ---- Forecast labels (ambient, not directive) -----------------------

const LABELS: Record<ForesightState, string> = {
  opening:     'opening',
  deepening:   'deepening',
  turning:     'turning',
  brightening: 'brightening',
  cooling:     'cooling',
};

// ---- Vote tables (source -> forecast state) -------------------------

const DRIFT_VOTES: Record<DriftDirection, ForesightState> = {
  wandering:   'opening',
  returning:   'deepening',
  brightening: 'brightening',
  settling:    'cooling',
  seeking:     'turning',
};

const ARCHETYPE_VOTES: Record<ConstellationArchetype, ForesightState> = {
  wanderer:  'opening',
  observer:  'deepening',
  steady:    'cooling',
  returner:  'turning',
  seeker:    'brightening',
};

// Real ReweightSignal values: alignment | presence | initiative | branch | soul | season
const REWEIGHT_VOTES: Record<ReweightSignal, ForesightState> = {
  alignment:  'cooling',      // cycle-following, predictable = settling tendency
  presence:   'deepening',    // attention concentration = inward tendency
  initiative: 'brightening',  // action-oriented = outward tendency
  branch:     'opening',      // path-exploring = expanding tendency
  soul:       'deepening',    // identity-deepening = stabilizing tendency
  season:     'turning',      // seasonal transition = shifting tendency
};

const HARMONY_VOTES: Record<HarmonyMood, ForesightState> = {
  settled:     'deepening',
  restless:    'opening',
  turning:     'turning',
  brightening: 'brightening',
  cooling:     'cooling',
};

// ---- Vote weights ---------------------------------------------------
// Drift is the most temporally honest signal (actual behavior change).
// Harmony is the tiebreaker (coherence of all slow layers).
// Constellation is the identity anchor.
// Reweight is the current emphasis signal.
const DRIFT_WEIGHT     = 0.35;
const ARCHETYPE_WEIGHT = 0.25;
const REWEIGHT_WEIGHT  = 0.20;
const HARMONY_WEIGHT   = 0.20;

// ---- Main evaluator -------------------------------------------------

export function evaluateFieldForesight(
  reweight:      FieldReweight,
  constellation: FieldConstellation,
  drift:         FieldDrift,
  harmony:       FieldHarmony,
): FieldForesight {
  if (!harmony.isReadable) return dormant();

  // Accumulate weighted votes
  const tally: Record<ForesightState, number> = {
    opening: 0, deepening: 0, turning: 0, brightening: 0, cooling: 0,
  };

  // Drift vote (active weight only if drift is measurable)
  const driftWeight = drift.isMeasurable ? DRIFT_WEIGHT : DRIFT_WEIGHT * 0.3;
  tally[DRIFT_VOTES[drift.direction]] += driftWeight;

  // Constellation vote (active weight only if constellation is formed)
  const archWeight = constellation.isFormed ? ARCHETYPE_WEIGHT : ARCHETYPE_WEIGHT * 0.4;
  tally[ARCHETYPE_VOTES[constellation.archetype]] += archWeight;

  // Reweight vote (active weight only if reweight is mature)
  const rwWeight = reweight.isMature ? REWEIGHT_WEIGHT : REWEIGHT_WEIGHT * 0.4;
  tally[REWEIGHT_VOTES[reweight.dominant]] += rwWeight;

  // Harmony vote (always weighted -- harmony is already a meta-signal)
  tally[HARMONY_VOTES[harmony.mood]] += HARMONY_WEIGHT;

  // Find winner
  const entries = Object.entries(tally) as [ForesightState, number][];
  const sorted  = entries.sort((a, b) => b[1] - a[1]);
  const winner  = sorted[0];
  const total   = entries.reduce((a, b) => a + b[1], 0);
  const confidence = total > 0 ? winner[1] / total : 0;

  // Tiebreaker: if top two states are within 0.03 of each other, harmony wins
  const second = sorted[1];
  const forecast = (winner[1] - second[1] < 0.03)
    ? HARMONY_VOTES[harmony.mood]
    : winner[0];

  return {
    forecast,
    confidence: clamp(confidence, 0, 1),
    label:      LABELS[forecast],
    isActive:   true,
  };
}

// ---- Helpers --------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function dormant(): FieldForesight {
  return { forecast: 'deepening', confidence: 0, label: LABELS.deepening, isActive: false };
}
