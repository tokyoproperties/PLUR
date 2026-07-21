/**
 * fieldNarrator.ts
 * Arc 67: EARTHNARRATOR V1.0 -- unified narrator synthesis.
 *
 * THE VOICE:
 *   This module composes a single naturalist sentence from all eight
 *   environmental registers. It does NOT replace the individual register
 *   phrases -- those still render in the vertical stack. This is the
 *   TOP-OF-CARD narrator line that gives the moment its identity.
 *
 * STRUCTURE:
 *   Up to three clauses in strict order:
 *     Clause 1 -- Essence:  "A quiet field" / "A dimming sky"
 *     Clause 2 -- Drift:    "settling" / "rising" / "turning"
 *     Clause 3 -- Foresight: "opening into morning" / "holding steady"
 *
 *   Cadence: [identity], [drift], [foresight]
 *   Example: "A quiet field, settling, leaning toward dusk."
 *
 * COMPRESSION:
 *   Mode A (3 clauses): harmony >= 0.6, moments >= 80, |drift| >= 0.12
 *   Mode B (2 clauses): harmony >= 0.4, |drift| >= 0.08, foresight inactive
 *   Mode C (1 clause):  harmony < 0.4, |drift| < 0.08, foresight inactive
 *
 * SUPPRESSION:
 *   The narrator line is suppressed when mouthPhrase is active.
 *   Mouth is the tri-field synthesis (Arc 59) -- it overrides this line.
 *
 * All pure functions. No React. No hooks. No side effects.
 */

import type { SkyState } from '@/atlas/fieldSky';
import type { CelestialState } from '@/atlas/fieldCelestial';
import type { NoseState } from '@/atlas/fieldNose';
import type { SkinState } from '@/atlas/fieldSkin';
import type { FootState } from '@/atlas/fieldFoot';
import type { PulseState } from '@/atlas/fieldPulse';
import type { MomentIdentity } from '@/atlas/fieldThreadMoment';

// -- Types --------------------------------------------------------------------

export interface NarratorInputs {
  sky:       SkyState;
  celestial: CelestialState;
  nose:      NoseState;
  skin:      SkinState;
  foot:      FootState;
  pulse:     PulseState;
  moment:    MomentIdentity;
  harmony:   number;   // harmony agreement (0-1)
  moments:   number;   // total atlas moments
}

export type NarratorCompressionMode = 'full' | 'two-clause' | 'single-clause';

export interface NarratorLine {
  phrase:           string | null;
  mode:             NarratorCompressionMode;
  hasEssence:       boolean;
  hasDrift:         boolean;
  hasForesight:     boolean;
}

// -- Drift magnitude ----------------------------------------------------------
// Max absolute drift across all drift-bearing fields.

export function computeDriftMagnitude(
  sky:   SkyState,
  nose:  NoseState,
  foot:  FootState,
  pulse: PulseState,
): number {
  // Arc 68: NaN-safe -- || 0 catches null/undefined, isNaN check catches NaN
  const safe = (v: number) => { const n = v || 0; return isNaN(n) ? 0 : Math.abs(n); };
  return Math.max(safe(sky.drift), safe(nose.drift), safe(foot.drift), safe(pulse.drift));
}

// -- Foresight magnitude ------------------------------------------------------
// 0 if all foresights are stable/holding/unknown, else a positive value.

export function computeForesightMagnitude(
  celestial: CelestialState,
  pulse:     PulseState,
): number {
  const cActive = celestial.foresight !== 'stable' && celestial.foresight !== 'unknown';
  const pActive = pulse.foresight !== 'holding' && pulse.foresight !== 'unknown';
  // Arc 68: safe boolean checks (foresight strings are never NaN, but guard for null)
  if (cActive && pActive) return 0.10;
  if (cActive || pActive) return 0.06;
  return 0;
}

// -- Compression mode selection ------------------------------------------------

export function selectCompressionMode(
  harmony:         number,
  moments:         number,
  driftMagnitude:  number,
  foresightMag:     number,
): NarratorCompressionMode {
  // Mode A: Full (3 clauses)
  if (harmony >= 0.6 && moments >= 80 && driftMagnitude >= 0.12) {
    return 'full';
  }
  // Mode B: Two clauses (essence + drift)
  if (harmony >= 0.4 && driftMagnitude >= 0.08 && foresightMag < 0.05) {
    return 'two-clause';
  }
  // Mode C: Single clause (essence only)
  return 'single-clause';
}

// -- Clause 1: Essence --------------------------------------------------------
// The identity of the moment -- a noun phrase describing what the environment IS.
//
// Sky-derived identities (brightening, dimming) become the essence directly.
// Motion/comfort identities (settling, rising, softening, turning) split into
// a static essence + a dynamic drift clause.

function buildEssenceClause(
  moment:    MomentIdentity,
  celestial: CelestialState,
  pulse:     PulseState,
): string | null {
  // Moment-derived essence (primary driver)
  const ESSENCE: Record<string, string> = {
    brightening: 'A brightening horizon',
    dimming:     'A dimming sky',
    settling:    'A quiet field',
    rising:      'A restless corridor',
    softening:   'A gentle field',
    turning:     'A shifting corridor',
    stable:      'A steady field',
    quiet:       'A quiet field',
  };

  const essence = ESSENCE[moment];
  if (essence) return essence;

  // Fallback: derive from celestial phase + pulse identity
  const PHASE_NOUN: Record<string, string> = {
    'pre-dawn':  'horizon',
    'dawn':      'horizon',
    'morning':   'horizon',
    'midday':    'corridor',
    'afternoon': 'corridor',
    'dusk':      'sky',
    'twilight':  'sky',
    'night':     'sky',
  };
  const PULSE_ADJ: Record<string, string> = {
    calm:     'A quiet',
    rising:   'A restless',
    elevated: 'An active',
    spiking:  'An urgent',
    unknown:  'A',
  };

  const noun = PHASE_NOUN[celestial.phase] || 'field';
  const adj  = PULSE_ADJ[pulse.identity] || 'A';
  return `${adj} ${noun}`;
}

// -- Clause 2: Drift ----------------------------------------------------------
// A present participle describing what's happening.
// Only for transitional identities (not sky-derived brightening/dimming).

function buildDriftClause(moment: MomentIdentity): string | null {
  const DRIFT: Record<string, string> = {
    settling:  'settling',
    rising:    'rising',
    softening: 'softening',
    turning:   'turning',
  };
  return DRIFT[moment] || null;
}

// -- Clause 3: Foresight ------------------------------------------------------
// A phrase describing what's coming.
// Prioritizes celestial foresight (richer phrases), falls back to pulse.

function buildForesightClause(
  celestial: CelestialState,
  pulse:     PulseState,
): string | null {
  // Celestial foresight has rich directional phrases
  const CELESTIAL_FORE: Record<string, string> = {
    'brightening toward day': 'opening into morning',
    'clearing into morning':  'clearing into morning',
    'settling toward dusk':   'leaning toward dusk',
    'dimming toward night':    'fading toward night',
  };

  if (CELESTIAL_FORE[celestial.foresight]) {
    return CELESTIAL_FORE[celestial.foresight];
  }

  // Fall back to pulse foresight
  const PULSE_FORE: Record<string, string> = {
    rising:    'still rising',
    settling:  'settling',
    spiking:   'still climbing',
    softening: 'softening at the edges',
    holding:   'holding steady',
  };

  if (PULSE_FORE[pulse.foresight]) {
    return PULSE_FORE[pulse.foresight];
  }

  return null;
}

// -- Narrator line composer ---------------------------------------------------

export function composeNarratorLine(inputs: NarratorInputs): NarratorLine {
  const { sky, celestial, nose, skin, foot, pulse, moment, harmony, moments } = inputs;

  const empty: NarratorLine = {
    phrase: null, mode: 'single-clause',
    hasEssence: false, hasDrift: false, hasForesight: false,
  };

  // Gate: need at least sky or pulse active to narrate
  if (!sky.isActive && !pulse.isActive && !foot.isActive) return empty;

  // Gate: moment identity must be known
  if (moment === 'unknown') return empty;

  // Compute magnitudes
  const driftMag     = computeDriftMagnitude(sky, nose, foot, pulse);
  const foresightMag = computeForesightMagnitude(celestial, pulse);

  // Select compression mode
  const mode = selectCompressionMode(harmony, moments, driftMag, foresightMag);

  // Build clauses
  const essence   = buildEssenceClause(moment, celestial, pulse);
  const drift     = mode === 'single-clause' ? null : buildDriftClause(moment);
  const foresight = mode === 'full' ? buildForesightClause(celestial, pulse) : null;

  if (!essence) return empty;

  // Compose with cadence: [essence], [drift], [foresight].
  // Arc 68: tautology guard -- skip drift if it appears in essence
  const parts: string[] = [essence];
  if (drift && !essence.toLowerCase().includes(drift.toLowerCase())) {
    parts.push(drift);
  }
  // Arc 68: empty clause guard -- skip foresight if null or empty string
  if (foresight && foresight.trim().length > 0) {
    parts.push(foresight);
  }

  // Arc 68: if only essence remains after guards, it's single-clause
  if (parts.length === 1) {
    return { phrase: `${essence}.`, mode: 'single-clause',
             hasEssence: true, hasDrift: false, hasForesight: false };
  }

  const phrase = `${parts.join(', ')}.`;

  return {
    phrase,
    mode,
    hasEssence:   true,
    hasDrift:     drift !== null,
    hasForesight: foresight !== null,
  };
}
