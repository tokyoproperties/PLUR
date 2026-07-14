/**
 * atlas/fieldConstellation.ts -- Arc 26 (PURITY rewrite)
 *
 * Field Constellation Engine -- ring-native.
 *
 * Arc 26 doctrine: slow layers read the moment ring directly.
 * No FieldMemory, no FieldSoul re-evaluation. No ReweightEmphasis
 * dependency (avoids slow-layer-calls-slow-layer). Soul traits are
 * accepted as a read-only hint, never re-derived.
 *
 * What it reads from the ring:
 *   - m.corridorTone         -> tone distribution + corridor variety
 *   - m.season               -> phase distribution
 *   - m.invitedSpecies       -> species frequency
 *   - m.intensity            -> activity level
 *   - m.symbolic             -> mode distribution
 *   - m.nearestTrail         -> corridor variety proxy
 *   - m.conditionsScore      -> field quality signal
 *
 * What it accepts as hints (currentSoulTraits):
 *   - rootMovement           -> archetype anchor
 *   - rootTone               -> tone anchor
 *   - isEstablished          -> soul confidence gate
 *
 * Five archetypes:
 *   wanderer  -- diverse seasons, diverse corridors, ranging
 *   observer  -- concentrated season, high species, deep intensity
 *   steady    -- consistent corridor tone, low variance
 *   returner  -- repeated season patterns, consistent trails
 *   seeker    -- wide season coverage, new corridors, low consistency
 *
 * Five tones derived from corridor tone distribution.
 * Confidence gate: 15+ moments.
 * Pure logic -- no React, no hooks.
 */

import type { FieldMoment } from '@/atlas/fieldMoment';
import type { RootMovement, RootTone } from '@/atlas/fieldSoul';
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

export interface ConstellationSoulHint {
  rootMovement:  RootMovement;
  rootTone:      RootTone;
  isEstablished: boolean;
}

export interface FieldConstellation {
  archetype:   ConstellationArchetype;
  tone:        ConstellationTone;
  confidence:  number;
  character:   string;
  isFormed:    boolean;
  impliedMode: SymbolicMode;
}

// ---- Thresholds ------------------------------------------------------

const MIN_MOMENTS = 15;

// ---- Character phrases -----------------------------------------------

const CHARACTERS: Record<ConstellationArchetype, Record<ConstellationTone, string>> = {
  wanderer: {
    calm: 'Field wanders in calm.', bright: 'Field wanders in bright light.',
    still: 'Field wanders at the edge of stillness.', moist: 'Field wanders the riparian corridor.',
    shifting: 'Field wanders through shifting conditions.',
  },
  observer: {
    calm: 'Field observes from stillness.', bright: 'Field observes in open light.',
    still: 'Field observes in deep quiet.', moist: 'Field observes where water moves.',
    shifting: 'Field observes a changing landscape.',
  },
  steady: {
    calm: 'Field holds a steady, calm pattern.', bright: 'Field holds steady in the light.',
    still: 'Field holds steady in stillness.', moist: 'Field holds steady near water.',
    shifting: 'Field holds steady through change.',
  },
  returner: {
    calm: 'Field returns to familiar calm.', bright: 'Field returns to bright familiar ground.',
    still: 'Field returns through stillness.', moist: 'Field returns along the water corridor.',
    shifting: 'Field returns from shifting territory.',
  },
  seeker: {
    calm: 'Field seeks in quiet territory.', bright: 'Field seeks in open, expanding light.',
    still: 'Field seeks at the threshold of stillness.', moist: 'Field seeks along new water edges.',
    shifting: 'Field seeks through unfamiliar conditions.',
  },
};

const ARCHETYPE_MODE: Record<ConstellationArchetype, SymbolicMode> = {
  wanderer: 'plur', observer: 'love', steady: 'love', returner: 'love', seeker: 'plur',
};

// ---- Ring helpers ----------------------------------------------------

function groupBySeason(moments: FieldMoment[]): Map<string, FieldMoment[]> {
  const groups = new Map<string, FieldMoment[]>();
  for (const m of moments) {
    const s = m.season ?? 'unknown';
    if (!groups.has(s)) groups.set(s, []);
    groups.get(s)!.push(m);
  }
  return groups;
}

function mostCommon<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  const counts = new Map<T, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].reduce((a, b) => b[1] > a[1] ? b : a)[0];
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

// ---- Archetype scoring -----------------------------------------------

function scoreArchetypes(
  moments: FieldMoment[],
  soul:    ConstellationSoulHint,
): Record<ConstellationArchetype, number> {
  const groups        = groupBySeason(moments);
  const seasonCount   = groups.size;
  const tones         = moments.map((m) => m.corridorTone).filter(Boolean) as string[];
  const uniqueTones   = new Set(tones).size;
  const allSpecies    = moments.flatMap((m) => m.invitedSpecies ?? []);
  const uniqueSpecies = new Set(allSpecies).size;
  const trails        = moments.map((m) => m.nearestTrail).filter(Boolean) as string[];
  const uniqueTrails  = new Set(trails).size;
  const dominantTone  = mostCommon(tones);
  const toneConsistency = dominantTone
    ? tones.filter((t) => t === dominantTone).length / Math.max(tones.length, 1)
    : 0;
  const avgIntensity  = moments.reduce((a, m) => a + (m.intensity ?? 0), 0) / moments.length;
  const scores: Record<ConstellationArchetype, number> = {
    wanderer: 0, observer: 0, steady: 0, returner: 0, seeker: 0,
  };

  // Wanderer: wide season coverage, diverse tones/trails, soul=wandering
  if (soul.isEstablished && soul.rootMovement === 'wandering') scores.wanderer += 0.30;
  scores.wanderer += Math.min(0.25, uniqueTones * 0.07);
  scores.wanderer += Math.min(0.20, uniqueTrails * 0.04);
  scores.wanderer += Math.min(0.15, seasonCount * 0.05);

  // Observer: season depth, high species, high intensity, soul=pooling
  if (soul.isEstablished && soul.rootMovement === 'pooling') scores.observer += 0.30;
  scores.observer += Math.min(0.25, uniqueSpecies * 0.04);
  scores.observer += Math.min(0.20, avgIntensity * 0.08);
  if (soul.isEstablished && (soul.rootTone === 'still' || soul.rootTone === 'calm')) {
    scores.observer += 0.10;
  }
  // Deep in one season = concentrated attention
  if (seasonCount === 1) scores.observer += 0.10;

  // Steady: high corridor consistency, low tone variance, soul=steady
  if (soul.isEstablished && soul.rootMovement === 'steady') scores.steady += 0.30;
  scores.steady += toneConsistency * 0.35;
  if (uniqueTones === 1) scores.steady += 0.10;

  // Returner: repeated season patterns, consistent trails, soul=breathing
  if (soul.isEstablished && soul.rootMovement === 'breathing') scores.returner += 0.25;
  scores.returner += toneConsistency * 0.20;
  // Multiple moment groups in same season = return pattern
  const maxSeasonMoments = Math.max(...[...groups.values()].map((ms) => ms.length));
  const returnRatio = maxSeasonMoments / moments.length;
  scores.returner += returnRatio * 0.20;
  scores.returner += Math.min(0.15, (trails.length - uniqueTrails) * 0.03); // repeat trails

  // Seeker: many seasons, diverse corridors, expanding trail set
  scores.seeker += Math.min(0.30, seasonCount * 0.08);
  scores.seeker += Math.min(0.25, uniqueTrails * 0.05);
  if (soul.isEstablished && (soul.rootTone === 'bright' || soul.rootTone === 'shifting')) {
    scores.seeker += 0.10;
  }

  return scores;
}

// ---- Tone derivation -------------------------------------------------

function deriveTone(moments: FieldMoment[]): ConstellationTone {
  const tones = moments.map((m) => m.corridorTone).filter(Boolean) as string[];
  if (!tones.length) return 'calm';
  const counts: Record<string, number> = {};
  for (const t of tones) counts[t] = (counts[t] ?? 0) + 1;
  const uniqueCount = Object.keys(counts).length;
  if (uniqueCount >= 4) return 'shifting';
  const dominant = (Object.entries(counts) as [string, number][])
    .reduce((a, b) => b[1] > a[1] ? b : a)[0];
  switch (dominant) {
    case 'calm':   return 'calm';
    case 'bright': return 'bright';
    case 'still':  return 'still';
    case 'moist':  return 'moist';
    default:       return 'shifting';
  }
}

// ---- Main evaluator --------------------------------------------------

export function evaluateFieldConstellation(
  moments:  FieldMoment[],
  soulHint: ConstellationSoulHint,
): FieldConstellation {
  if (moments.length < MIN_MOMENTS) return dormant();

  const scores  = scoreArchetypes(moments, soulHint);
  const entries = Object.entries(scores) as [ConstellationArchetype, number][];
  const sorted  = entries.sort((a, b) => b[1] - a[1]);
  const top     = sorted[0];
  const second  = sorted[1];
  const total   = entries.reduce((a, b) => a + b[1], 0);
  const gap     = total > 0 ? (top[1] - second[1]) / total : 0;
  const confidence = clamp(0.45 + gap * 1.2, 0, 1);
  const archetype  = top[0];
  const tone       = deriveTone(moments);

  return {
    archetype,
    tone,
    confidence,
    character:   CHARACTERS[archetype][tone],
    isFormed:    confidence >= 0.50,
    impliedMode: ARCHETYPE_MODE[archetype],
  };
}

function dormant(): FieldConstellation {
  return { archetype: 'steady', tone: 'calm', confidence: 0, character: CHARACTERS.steady.calm, isFormed: false, impliedMode: 'love' };
}
