/**
 * atlas/fieldConstellation.ts -- Arc 24 (CONSTELLATION)
 *
 * Field Constellation Engine.
 *
 * The field's long-term behavioral pattern -- its "style" across weeks.
 * Slower than reweight (days), slower than soul (which is structural).
 * Constellation is emergent from accumulated evidence, not computed
 * from a single moment or even a single chapter.
 *
 * Archetype vs Soul distinction (important):
 *   Soul (fieldSoul.ts) = structural identity -- what the field IS.
 *   Constellation = behavioral pattern -- how the field ACTS over time.
 *   Soul is named (quiet/warmth/watchfulness...). Constellation is typed.
 *
 * Five archetypes:
 *   wanderer  -- field moves, ranges, shifts chapter to chapter
 *   observer  -- field deepens, concentrates, species-rich
 *   steady    -- field consistent, low-variance, reliable
 *   returner  -- field cycles back, session velocity drops and recovers
 *   seeker    -- field expands, new phases, new corridor tones
 *
 * Five tones (derived from chapter tone distribution):
 *   calm     -- dominant quiet, still corridors, low variance
 *   bright   -- dominant bright/active, diurnal, movement-rich
 *   still    -- dominant stillness, nocturnal or low-motion
 *   moist    -- riparian/coastal corridor dominance
 *   shifting -- high variance, no dominant tone
 *
 * Data sources (all real, long-term):
 *   - chapters: phase distribution, tone distribution, momentCount per phase
 *   - corridorHistory: tone per chapter
 *   - speciesHistory: frequency distribution (frequent vs rare ratio)
 *   - reweight.emphasis: which signals have been most active over time
 *   - soul.traits: rootMovement + rootTone as structural anchors
 *
 * Confidence gate: 15+ moments AND 2+ formed chapters.
 * Below that threshold: archetype is 'steady' (neutral default), confidence = 0.
 *
 * Priority in stack: below reweight (reweight is faster/more reactive).
 * Constellation changes over weeks, reweight changes over days.
 *
 * Pure logic -- no React, no hooks.
 */

import type { FieldMemory } from '@/atlas/fieldMemory';
import type { FieldSoul } from '@/atlas/fieldSoul';
import type { ReweightEmphasis } from '@/atlas/fieldReweight';
import type { SymbolicMode } from '@/contexts/mode-context';

// ---- Types -----------------------------------------------------------

export type ConstellationArchetype =
  | 'wanderer'
  | 'observer'
  | 'steady'
  | 'returner'
  | 'seeker';

export type ConstellationTone =
  | 'calm'
  | 'bright'
  | 'still'
  | 'moist'
  | 'shifting';

export interface FieldConstellation {
  archetype:   ConstellationArchetype;
  tone:        ConstellationTone;
  confidence:  number;
  /** Short window label tint phrase */
  character:   string;
  /** Whether constellation has enough data to surface */
  isFormed:    boolean;
  /** Implied mode for this archetype */
  impliedMode: SymbolicMode;
}

// ---- Thresholds ------------------------------------------------------

const MIN_MOMENTS  = 15;
const MIN_CHAPTERS = 2;

// ---- Character phrases -----------------------------------------------

const CHARACTERS: Record<ConstellationArchetype, Record<ConstellationTone, string>> = {
  wanderer: {
    calm:     'Field wanders in calm.',
    bright:   'Field wanders in bright light.',
    still:    'Field wanders at the edge of stillness.',
    moist:    'Field wanders the riparian corridor.',
    shifting: 'Field wanders through shifting conditions.',
  },
  observer: {
    calm:     'Field observes from stillness.',
    bright:   'Field observes in open light.',
    still:    'Field observes in deep quiet.',
    moist:    'Field observes where water moves.',
    shifting: 'Field observes a changing landscape.',
  },
  steady: {
    calm:     'Field holds a steady, calm pattern.',
    bright:   'Field holds steady in the light.',
    still:    'Field holds steady in stillness.',
    moist:    'Field holds steady near water.',
    shifting: 'Field holds steady through change.',
  },
  returner: {
    calm:     'Field returns to familiar calm.',
    bright:   'Field returns to bright familiar ground.',
    still:    'Field returns through stillness.',
    moist:    'Field returns along the water corridor.',
    shifting: 'Field returns from shifting territory.',
  },
  seeker: {
    calm:     'Field seeks in quiet territory.',
    bright:   'Field seeks in open, expanding light.',
    still:    'Field seeks at the threshold of stillness.',
    moist:    'Field seeks along new water edges.',
    shifting: 'Field seeks through unfamiliar conditions.',
  },
};

// ---- Mode coupling ---------------------------------------------------

const ARCHETYPE_MODE: Record<ConstellationArchetype, SymbolicMode> = {
  wanderer: 'plur',
  observer: 'love',
  steady:   'love',
  returner: 'love',
  seeker:   'plur',
};

// ---- Archetype scoring -----------------------------------------------

interface ArchetypeScores {
  wanderer:  number;
  observer:  number;
  steady:    number;
  returner:  number;
  seeker:    number;
}

function scoreArchetypes(
  memory: FieldMemory,
  soul: FieldSoul,
  emphasis: ReweightEmphasis
): ArchetypeScores {
  const scores: ArchetypeScores = {
    wanderer: 0, observer: 0, steady: 0, returner: 0, seeker: 0,
  };

  const formed = memory.chapters.filter((c) => c.isFormed);

  // ---- Wanderer ----
  // Soul rootMovement = wandering
  if (soul.traits.rootMovement === 'wandering') scores.wanderer += 0.35;
  // Many different chapter tones (high diversity)
  const tones = formed.map((c) => c.dominantTone);
  const uniqueTones = new Set(tones).size;
  scores.wanderer += Math.min(0.3, uniqueTones * 0.08);
  // Reweight initiative/branch emphasis (action-oriented)
  scores.wanderer += emphasis.initiative * 0.2 + emphasis.branch * 0.15;

  // ---- Observer ----
  // Soul rootMovement = pooling (concentrated attention)
  if (soul.traits.rootMovement === 'pooling') scores.observer += 0.35;
  // High species frequency -- many frequent species seen
  const frequentSpecies = memory.speciesHistory.filter((s) => s.frequency === 'frequent').length;
  scores.observer += Math.min(0.25, frequentSpecies * 0.05);
  // Reweight presence/soul emphasis
  scores.observer += emphasis.presence * 0.2 + emphasis.soul * 0.15;
  // Soul rootTone = still/calm (contemplative)
  if (soul.traits.rootTone === 'still' || soul.traits.rootTone === 'calm') {
    scores.observer += 0.10;
  }

  // ---- Steady ----
  // Soul rootMovement = steady
  if (soul.traits.rootMovement === 'steady') scores.steady += 0.35;
  // Low chapter tone variance (same dominant tone across phases)
  const dominant = mostCommon(tones);
  const consistency = dominant
    ? tones.filter((t) => t === dominant).length / Math.max(tones.length, 1)
    : 0;
  scores.steady += consistency * 0.25;
  // Reweight alignment/season emphasis (cycle-following)
  scores.steady += emphasis.alignment * 0.2 + emphasis.season * 0.15;

  // ---- Returner ----
  // Soul rootMovement = breathing (rhythmic, cyclical)
  if (soul.traits.rootMovement === 'breathing') scores.returner += 0.30;
  // Corridor tone consistency -- returns to same corridors
  const corridorTones = memory.corridorHistory.map((c) => c.dominantTone);
  const corridorDom = mostCommon(corridorTones);
  const corridorConsistency = corridorDom
    ? corridorTones.filter((t) => t === corridorDom).length / Math.max(corridorTones.length, 1)
    : 0;
  scores.returner += corridorConsistency * 0.25;
  // Reweight alignment emphasis (time/cycle awareness)
  scores.returner += emphasis.alignment * 0.20;
  // Multiple formed chapters in same phase = return pattern
  const phaseCounts: Record<string, number> = {};
  for (const c of formed) {
    phaseCounts[c.phase] = (phaseCounts[c.phase] ?? 0) + 1;
  }
  const repeatedPhase = Object.values(phaseCounts).some((n) => n > 1);
  if (repeatedPhase) scores.returner += 0.10;

  // ---- Seeker ----
  // Many formed chapters (wide phase coverage)
  scores.seeker += Math.min(0.30, formed.length * 0.07);
  // Many unique corridor tones (explores different environments)
  const uniqueCorridors = new Set(corridorTones).size;
  scores.seeker += Math.min(0.20, uniqueCorridors * 0.07);
  // Reweight branch emphasis (path-branching)
  scores.seeker += emphasis.branch * 0.20 + emphasis.initiative * 0.10;
  // Soul rootTone = bright/shifting (expansive)
  if (soul.traits.rootTone === 'bright' || soul.traits.rootTone === 'shifting') {
    scores.seeker += 0.10;
  }

  return scores;
}

// ---- Tone derivation -------------------------------------------------

function deriveTone(memory: FieldMemory): ConstellationTone {
  const tones = memory.corridorHistory.map((c) => c.dominantTone);
  if (tones.length === 0) return 'calm';

  const counts: Record<string, number> = {};
  for (const t of tones) counts[t] = (counts[t] ?? 0) + 1;
  const uniqueCount = Object.keys(counts).length;

  // High variance = shifting
  if (uniqueCount >= 4) return 'shifting';
  if (uniqueCount === 3) {
    const max = Math.max(...Object.values(counts));
    const total = tones.length;
    if (max / total < 0.5) return 'shifting'; // no dominant
  }

  const dominant = (Object.entries(counts) as [string, number][])
    .reduce((a, b) => b[1] > a[1] ? b : a)[0] as string;

  switch (dominant) {
    case 'calm':   return 'calm';
    case 'bright': return 'bright';
    case 'still':  return 'still';
    case 'moist':  return 'moist';
    case 'noisy':  return 'shifting'; // noisy maps to shifting in constellation register
    case 'mixed':  return 'shifting';
    default:       return 'calm';
  }
}

// ---- Main evaluator --------------------------------------------------

export function evaluateFieldConstellation(
  memory:   FieldMemory,
  soul:     FieldSoul,
  emphasis: ReweightEmphasis
): FieldConstellation {
  const formed = memory.chapters.filter((c) => c.isFormed);

  if (memory.totalMoments < MIN_MOMENTS || formed.length < MIN_CHAPTERS) {
    return dormant();
  }

  const scores   = scoreArchetypes(memory, soul, emphasis);
  const entries  = Object.entries(scores) as [ConstellationArchetype, number][];
  const sorted   = entries.sort((a, b) => b[1] - a[1]);
  const top      = sorted[0];
  const second   = sorted[1];

  // Confidence: gap between top and second normalizes how clear the winner is
  const total    = entries.reduce((a, b) => a + b[1], 0);
  const gap      = total > 0 ? (top[1] - second[1]) / total : 0;
  const confidence = clamp(0.45 + gap * 1.2, 0, 1);

  const archetype = top[0];
  const tone      = deriveTone(memory);

  return {
    archetype,
    tone,
    confidence,
    character:   CHARACTERS[archetype][tone],
    isFormed:    confidence >= 0.50,
    impliedMode: ARCHETYPE_MODE[archetype],
  };
}

// ---- Helpers ---------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function mostCommon<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  const counts = new Map<T, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].reduce((a, b) => b[1] > a[1] ? b : a)[0];
}

function dormant(): FieldConstellation {
  return {
    archetype:   'steady',
    tone:        'calm',
    confidence:  0,
    character:   CHARACTERS.steady.calm,
    isFormed:    false,
    impliedMode: 'love',
  };
}
