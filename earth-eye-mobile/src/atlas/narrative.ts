/**
 * atlas/narrative.ts
 *
 * Narrative Overlays — Mission 7. A pure translation layer: takes the
 * ALREADY-COMPUTED state from Hybrid, Corridor, Ecosystem, Seasonal,
 * and Session, and turns it into five short, atomic, constitutional-
 * voice lines. Never re-derives anything — every phrase is chosen
 * from a real, verified enum value already sitting on another
 * engine's output.
 *
 * CORRECTION to the mission brief, found by mapping the real code
 * first (same discipline as Missions 1-6): the premise "engines
 * currently output raw states with no narrative" isn't quite right.
 * HybridState, CorridorState, and EcosystemState each already carry a
 * `summary: string` field — but those are dev-facing debug strings
 * built with `parts.join(' · ')` (e.g. "Near yard (120m) · tone: calm
 * · stillness suggested"), not the field-notebook prose voice used
 * everywhere else in Atlas (fieldIdentity.reflection, drift.description,
 * fieldMythology's description, fieldMemory.memoryLine). So fieldLine /
 * corridorLine / speciesLine below ARE genuinely new translation work.
 * seasonLine and sessionLine are different — SeasonalProfile and
 * FieldSessionSummary already carry real prose-adjacent fields
 * (phaseLabel/patternSuffix/fieldRhythm; summarizeSession's summary),
 * so those two are thin compositions of existing content, not new
 * derivation dressed up as new derivation.
 *
 * Also corrected against the ACTUAL type definitions rather than the
 * brief's assumed vocabulary: HybridFieldState is really
 * 'calm'|'bright'|'noisy'|'still'|'mixed'|'alert'|'dim'|'forming'
 * (the brief's list included a non-existent 'active' and omitted the
 * real 'noisy'). CorridorTone is really
 * 'calm'|'noisy'|'bright'|'still'|'mixed' (the brief's proposed
 * "steady/shifting/uncertain/quiet/open" vocabulary doesn't match any
 * of the real values at all). EcosystemState has no five-level
 * favorable/likely/possible/uncertain/inactive species gate — it has
 * `invitedSpecies` (array) + `conditionsScore` ('good'|'fair'|'poor'),
 * so speciesLine is built from those real fields instead.
 *
 * Pure logic — no React, no hooks. No engine logic lives here; this
 * file only chooses words for values other files already computed.
 */

import type { HybridState } from '@/hybrid/hybrid-engine';
import type { CorridorState } from '@/corridor/corridor-engine';
import type { EcosystemState } from '@/ecosystem/ecosystem-engine';
import type { SeasonalProfile } from '@/atlas/seasonalProfile';
import type { FieldSessionSummary } from '@/atlas/fieldSession';
import type { ArrivalSummary } from '@/ecosystem/speciesArrival';

export interface NarrativeLines {
  fieldLine: string;
  corridorLine: string;
  /** Real-time species gate (ecosystem-engine.ts) — "is this species invited right now?" */
  speciesLine: string;
  seasonLine: string;
  /**
   * Seasonal species forecast (speciesArrival.ts, Mission 8) — "is this
   * species seasonally likely?" A genuinely different question from
   * speciesLine above, per the Mission 8 architecture decision to keep
   * the two species engines separate rather than merge them. Thin
   * composition, not new derivation: speciesArrival.ts's ArrivalSummary
   * already produces a complete, well-formed one-line headline covering
   * every case (no species likely / high-likelihood species / moderate
   * only) -- reused directly rather than re-implemented here.
   */
  seasonalSpeciesLine: string;
  /** null when no session has started yet (mirrors useFieldSession()'s own null-before-first-moment contract) */
  sessionLine: string | null;
}

// ─── Field (Hybrid) ───────────────────────────────────────

function fieldNarrative(hybrid: HybridState): string {
  // Mission 11 Layer 1 follow-up (spotted live on-device, July 7 2026):
  // this guard ran before the switch and used its own one-off
  // construction with an em-dash -- exactly the pattern broken
  // everywhere else in this file. Unified to the same
  // 'base sentence. qualifier sentence.' shape corridorNarrative
  // already uses for its 'uncertain confidence' case.
  if (hybrid.dataQuality === 'forming') {
    return 'Field is forming. Sensors not yet active.';
  }
  switch (hybrid.fieldState) {
    case 'calm': return 'Field is calm.';
    case 'bright': return 'Field is bright.';
    case 'noisy': return 'Field is noisy.';
    case 'still': return 'Field is still.';
    case 'mixed': return 'Field is mixed.';
    case 'dim': return 'Field is dim.';
    case 'forming': return 'Field reading is forming.';
    case 'alert':
      // Not currently reachable — evaluateHybrid() only ever narrows
      // an existing 'alert' toward 'mixed'/'calm' by symbolic mode
      // (hybrid-engine.ts), but nothing actually assigns 'alert' in
      // the first place under present logic. Kept for exhaustiveness
      // and in case a future engine change makes it reachable.
      return 'Field is alert.';
  }
}

// ─── Corridor ─────────────────────────────────────────────

function corridorNarrative(corridor: CorridorState): string {
  // Mission 11: unified to one 'Corridor is {tone}.' pattern across all
  // five tones -- 'still' and 'mixed' previously broke the pattern
  // ('Corridor holds still.', 'Corridor tone is mixed.'), which read as
  // stitched-together fragments rather than one authored voice. Same
  // 'X is {value}.' shape fieldNarrative already uses.
  const base = `Corridor is ${corridor.tone}.`;
  if (corridor.confidence === 'uncertain') {
    return `${base} Reading is uncertain right now.`;
  }
  return base;
}

// ─── Species (Ecosystem) ─────────────────────────────────

function speciesNarrative(ecosystem: EcosystemState): string {
  const { invitedSpecies, canonSize, conditionsScore } = ecosystem;

  if (invitedSpecies.length === 0) {
    return conditionsScore === 'poor'
      ? 'Conditions poor. No species currently invited.'
      : 'No species currently invited.';
  }

  const qualifier =
    conditionsScore === 'good' ? 'favorable' :
    conditionsScore === 'fair' ? 'possible' :
    'uncertain';

  // Mission 11: dropped the em-dash construction ("Species possible —
  // 3 of 10 present.") -- it was the only VOICE line using that
  // fragment-and-dash shape; every other line is plain sentences.
  // Same information, same order, just two sentences like the rest.
  return `${invitedSpecies.length} of ${canonSize} species present. Conditions ${qualifier}.`;
}

// ─── Season ───────────────────────────────────────────────

function seasonNarrative(seasonal: SeasonalProfile): string {
  const phase = seasonal.phaseLabel.toLowerCase();
  switch (seasonal.patternStatus) {
    case 'forming': return `Pattern forming for ${phase}.`;
    case 'confirmed': return `Pattern clear for ${phase}.`;
    case 'unclear': return `Pattern unclear for ${phase}.`;
  }
}

// ─── Session ──────────────────────────────────────────────

function sessionNarrative(session: FieldSessionSummary | null): string | null {
  if (!session) return null;

  const stateClause = session.dominantFieldState ? `${session.dominantFieldState} field` : 'field';
  const stabilityClause =
    session.corridorStability === 'stable' ? ', steady corridor' :
    session.corridorStability === 'shifting' ? ', shifting corridor' :
    '';

  let line = `Session shows a ${stateClause}${stabilityClause}.`;

  // Mission 8: mention seasonal forecast species when present -- the
  // brief's "speciesSessionTone" ask, satisfied as an enrichment of
  // the existing session line rather than a separate new field, since
  // it's the same sentence just saying one more true thing.
  if (session.speciesSeasonalHighlights.length > 0) {
    line += ` ${session.speciesSeasonalHighlights[0]} in season.`;
  }

  return line;
}

// ─── Composer ─────────────────────────────────────────────

export function buildNarrative(args: {
  hybrid: HybridState;
  corridor: CorridorState;
  ecosystem: EcosystemState;
  seasonal: SeasonalProfile;
  arrivals: ArrivalSummary;
  session: FieldSessionSummary | null;
}): NarrativeLines {
  return {
    fieldLine: fieldNarrative(args.hybrid),
    corridorLine: corridorNarrative(args.corridor),
    speciesLine: speciesNarrative(args.ecosystem),
    seasonLine: seasonNarrative(args.seasonal),
    seasonalSpeciesLine: args.arrivals.headline,
    sessionLine: sessionNarrative(args.session),
  };
}
