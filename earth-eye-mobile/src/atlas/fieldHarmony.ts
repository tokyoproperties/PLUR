/**
 * atlas/fieldHarmony.ts -- Arc 27 (HARMONY)
 *
 * Field Harmony Engine.
 *
 * A meta-read of the three slow siblings: reweight, constellation,
 * drift. Measures how aligned or misaligned they are. Does NOT read
 * the moment ring directly -- harmony is derived from sibling outputs,
 * which is the correct level of abstraction. The siblings are already
 * ring-pure; harmony inherits that purity.
 *
 * Arc 26 doctrine holds: harmony does not call soul, memory, or any
 * composed layer. It reads only the typed outputs of three pure engines.
 *
 * Agreement signal: built on impliedMode (the one common output type
 * across all three engines). When all three agree on 'plur' or 'love',
 * the field is coherent. Divergence = tension.
 *
 * Secondary agreement axes:
 *   archetype <-> drift direction  (natural semantic pairs)
 *   reweight dominant <-> archetype  (emphasis vs identity)
 *   drift stability  (volatile = tension independent of direction)
 *
 * Five moods:
 *   settled     -- all three engines agree, drift is stable
 *   restless    -- reweight emphasis diverges from constellation identity
 *   turning     -- drift is actively shifting away from constellation
 *   brightening -- drift toward brightening/seeking, consistent tone
 *   cooling     -- drift toward settling/returning, consistent tone
 *
 * No new color system. No new row in the card.
 * Surfaces as "Field mood: X" in the chapter footer.
 *
 * Pure logic -- no React, no hooks.
 */

import type { FieldReweight, ReweightSignal } from '@/atlas/fieldReweight';
import type { FieldConstellation, ConstellationArchetype } from '@/atlas/fieldConstellation';
import type { FieldDrift, DriftDirection } from '@/atlas/fieldDrift';

// ---- Types -----------------------------------------------------------

export type HarmonyMood =
  | 'settled'
  | 'restless'
  | 'turning'
  | 'brightening'
  | 'cooling';

export interface FieldHarmony {
  agreement: number;    // 0-1: how much the three engines agree
  tension:   number;    // 0-1: how much they pull apart (1 - agreement, shaped)
  mood:      HarmonyMood;
  moodLabel: string;    // "Field mood: settled"
  /** Whether harmony has enough signal to surface */
  isReadable: boolean;
}

// ---- Mood labels -----------------------------------------------------

const MOOD_LABELS: Record<HarmonyMood, string> = {
  settled:     'settled',
  restless:    'restless',
  turning:     'turning',
  brightening: 'brightening',
  cooling:     'cooling',
};

// ---- Semantic coherence tables --------------------------------------

// Which drift directions are "natural" for each archetype?
// Natural = the field's long-term character matches how it's changing.
const ARCHETYPE_NATURAL_DRIFT: Record<ConstellationArchetype, DriftDirection[]> = {
  wanderer:  ['wandering', 'seeking'],
  observer:  ['settling', 'brightening'],
  steady:    ['settling', 'returning'],
  returner:  ['returning', 'settling'],
  seeker:    ['seeking', 'brightening', 'wandering'],
};

// Which reweight signals are "natural" for each archetype?
const ARCHETYPE_NATURAL_REWEIGHT: Record<ConstellationArchetype, ReweightSignal[]> = {
  wanderer:  ['initiative', 'branch', 'alignment'],
  observer:  ['presence', 'soul', 'season'],
  steady:    ['alignment', 'season', 'presence'],
  returner:  ['alignment', 'season', 'soul'],
  seeker:    ['branch', 'initiative', 'alignment'],
};

// ---- Mood inference from archetype + drift + reweight ---------------

function inferMood(
  archetype:    ConstellationArchetype,
  driftDir:     DriftDirection,
  driftMag:     number,
  driftStable:  boolean,
  reweightDom:  ReweightSignal,
  agreement:    number,
): HarmonyMood {
  // Turning: drift is actively pulling away from constellation's character
  // and drift magnitude is significant
  const naturalDrift  = ARCHETYPE_NATURAL_DRIFT[archetype];
  const driftIsNatural = naturalDrift.includes(driftDir);
  if (!driftIsNatural && driftMag > 0.35 && !driftStable) {
    return 'turning';
  }

  // Restless: reweight dominant doesn't match constellation's natural emphasis
  const naturalReweight = ARCHETYPE_NATURAL_REWEIGHT[archetype];
  const reweightIsNatural = naturalReweight.includes(reweightDom);
  if (!reweightIsNatural && agreement < 0.55) {
    return 'restless';
  }

  // Brightening: drift toward brightening/seeking, field coherent
  if ((driftDir === 'brightening' || driftDir === 'seeking') && agreement >= 0.5) {
    return 'brightening';
  }

  // Cooling: drift toward settling/returning, field coherent
  if ((driftDir === 'settling' || driftDir === 'returning') && agreement >= 0.5) {
    return 'cooling';
  }

  // Settled: high agreement and drift is stable or natural
  if (agreement >= 0.60 && (driftIsNatural || driftStable)) {
    return 'settled';
  }

  // Default: settled (field is coherent enough)
  return 'settled';
}

// ---- Main evaluator --------------------------------------------------

export function evaluateFieldHarmony(
  reweight:     FieldReweight,
  constellation: FieldConstellation,
  drift:        FieldDrift,
): FieldHarmony {
  // Harmony is not readable if none of the slow siblings are active
  const anyActive = reweight.isMature || constellation.isFormed || drift.isMeasurable;
  if (!anyActive) {
    return dormant();
  }

  // ---- Agreement: impliedMode agreement (primary axis) ---------------
  // Count how many engines agree on the same impliedMode
  const modes = [
    reweight.impliedMode,
    constellation.impliedMode,
    drift.impliedMode,
  ];
  const plurCount = modes.filter((m) => m === 'plur').length;
  const loveCount = modes.filter((m) => m === 'love').length;
  const modeAgreement = Math.max(plurCount, loveCount) / 3; // 0.33, 0.67, or 1.0

  // ---- Secondary axes ------------------------------------------------
  // Archetype <-> drift direction coherence
  const naturalDrift = ARCHETYPE_NATURAL_DRIFT[constellation.archetype];
  const driftCoherence = naturalDrift.includes(drift.direction) ? 1.0 : 0.0;

  // Reweight dominant <-> archetype coherence
  const naturalReweight = ARCHETYPE_NATURAL_REWEIGHT[constellation.archetype];
  const reweightCoherence = naturalReweight.includes(reweight.dominant) ? 1.0 : 0.0;

  // Drift stability contribution
  const stabilityBonus =
    drift.stability === 'stable'   ? 0.15
    : drift.stability === 'shifting' ? 0.05
    : 0; // volatile

  // Active engine count (more active = more signal = more readable agreement)
  const activeCount = [reweight.isMature, constellation.isFormed, drift.isMeasurable]
    .filter(Boolean).length;
  const activeWeight = activeCount / 3;

  // Weighted agreement score
  const agreement = clamp(
    modeAgreement * 0.45
    + driftCoherence * 0.20
    + reweightCoherence * 0.20
    + stabilityBonus
    + activeWeight * 0.10,
    0, 1
  );

  const tension = clamp(1 - agreement + (drift.magnitude * 0.2), 0, 1);

  const mood = inferMood(
    constellation.archetype,
    drift.direction,
    drift.magnitude,
    drift.stability === 'stable',
    reweight.dominant,
    agreement,
  );

  return {
    agreement,
    tension,
    mood,
    moodLabel: MOOD_LABELS[mood],
    isReadable: activeCount >= 1,
  };
}

// ---- Helpers ---------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function dormant(): FieldHarmony {
  return {
    agreement:  0,
    tension:    0,
    mood:       'settled',
    moodLabel:  MOOD_LABELS.settled,
    isReadable: false,
  };
}
