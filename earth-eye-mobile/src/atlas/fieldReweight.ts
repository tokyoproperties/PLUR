/**
 * atlas/fieldReweight.ts -- Arc 26 (PURITY rewrite)
 *
 * Field Reweight Engine -- ring-native.
 *
 * Arc 26 doctrine: slow layers read the moment ring directly.
 * No FieldMemory, no FieldSoul re-evaluation. Soul traits are
 * accepted as a read-only hint (currentSoulTraits), never re-derived.
 *
 * What it reads from the ring:
 *   - m.corridorTone         -> corridor consistency signal
 *   - m.season               -> phase distribution (depth vs breadth)
 *   - m.invitedSpecies       -> species frequency (habitat affinity)
 *   - m.intensity            -> activity level (initiative proxy)
 *   - m.symbolic             -> mode distribution (soul signal)
 *
 * What it accepts as hints (currentSoulTraits):
 *   - rootMovement           -> initiative/branch modifier
 *   - rootTone               -> soul signal modifier
 *   - isRevealed             -> soul confidence gate
 *
 * Six signal layers weighted:
 *   alignment  -- corridor consistency across seasons
 *   presence   -- moment concentration in dominant season
 *   initiative -- activity level + rootMovement
 *   branch     -- tone diversity across seasons
 *   soul       -- mode consistency + soul revelation
 *   season     -- season phase breadth
 *
 * Confidence gate: 10+ moments.
 * Pure logic -- no React, no hooks.
 */

import type { FieldMoment } from '@/atlas/fieldMoment';
import type { RootMovement, RootTone } from '@/atlas/fieldSoul';
import type { SymbolicMode } from '@/contexts/mode-context';

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

export interface SoulHint {
  rootMovement: RootMovement;
  rootTone:     RootTone;
  isRevealed:   boolean;
  isEstablished: boolean;
}

export interface FieldReweight {
  emphasis:    ReweightEmphasis;
  dominant:    ReweightSignal;
  toneShift:   string;
  isMature:    boolean;
  impliedMode: SymbolicMode;
}

// ---- Constants -------------------------------------------------------

const MIN_MOMENTS = 10;

const TONE_SHIFTS: Record<ReweightSignal, string> = {
  alignment:  'Field leaning toward cycle and rhythm.',
  presence:   'Field centering your attention.',
  initiative: 'Field emphasizing movement and action.',
  branch:     'Field exploring multiple paths.',
  soul:       'Field deepening into long-term identity.',
  season:     'Field following the ecological calendar.',
};

const SIGNAL_MODE: Record<ReweightSignal, SymbolicMode> = {
  alignment:  'plur',
  presence:   'love',
  initiative: 'plur',
  branch:     'plur',
  soul:       'love',
  season:     'plur',
};

// ---- Ring extraction helpers -----------------------------------------

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

// ---- Scoring (ring-native) -------------------------------------------

function scoreAlignment(moments: FieldMoment[]): number {
  // Corridor tone consistency across seasons
  const groups = groupBySeason(moments);
  if (groups.size < 2) return 0.3;
  const seasonTones = [...groups.values()].map((ms) =>
    mostCommon(ms.map((m) => m.corridorTone))
  ).filter(Boolean);
  const overallDominant = mostCommon(seasonTones);
  const consistency = overallDominant
    ? seasonTones.filter((t) => t === overallDominant).length / seasonTones.length
    : 0;
  const seasonBonus = Math.min(0.3, groups.size * 0.06);
  return clamp(0.3 + consistency * 0.4 + seasonBonus, 0, 1);
}

function scorePresence(moments: FieldMoment[]): number {
  // Moment concentration in dominant season
  const groups = groupBySeason(moments);
  if (groups.size === 0) return 0.2;
  const counts = [...groups.values()].map((ms) => ms.length);
  const max = Math.max(...counts);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  const concentration = avg > 0 ? Math.min(max / avg, 3) / 3 : 0;
  return clamp(0.2 + concentration * 0.5, 0, 1);
}

function scoreInitiative(moments: FieldMoment[], soul: SoulHint): number {
  // Activity level from intensity field + soul rootMovement hint
  const avgIntensity = moments.reduce((a, m) => a + (m.intensity ?? 0), 0) / moments.length;
  const intensityBonus = Math.min(0.25, avgIntensity * 0.1);
  const movementBonus =
    soul.rootMovement === 'wandering' ? 0.25
    : soul.rootMovement === 'breathing' ? 0.15
    : 0;
  return clamp(0.3 + intensityBonus + movementBonus, 0, 1);
}

function scoreBranch(moments: FieldMoment[]): number {
  // Tone diversity across seasons
  const groups = groupBySeason(moments);
  if (groups.size < 2) return 0.2;
  const seasonTones = [...groups.values()].map((ms) =>
    mostCommon(ms.map((m) => m.corridorTone))
  ).filter(Boolean) as string[];
  const uniqueTones = new Set(seasonTones).size;
  const diversity = Math.min(uniqueTones / 4, 1);
  return clamp(0.2 + diversity * 0.5, 0, 1);
}

function scoreSoul(moments: FieldMoment[], soul: SoulHint): number {
  // Mode consistency (LOVE moments = soul signal) + soul revelation hint
  if (!soul.isEstablished) return 0.1;
  const loveMoments = moments.filter((m) => m.symbolic === 'love').length;
  const modeConsistency = loveMoments / moments.length;
  const revealBonus = soul.isRevealed ? 0.3 : 0;
  const toneBonus =
    soul.rootTone === 'still' ? 0.15
    : soul.rootTone === 'calm' ? 0.10
    : 0;
  return clamp(0.1 + modeConsistency * 0.2 + revealBonus + toneBonus, 0, 1);
}

function scoreSeason(moments: FieldMoment[]): number {
  // Season breadth -- how many distinct seasons observed
  const seasons = new Set(moments.map((m) => m.season).filter(Boolean)).size;
  const phaseBonus = Math.min(0.5, seasons * 0.12);
  return clamp(0.2 + phaseBonus, 0, 1);
}

// ---- Normalize -------------------------------------------------------

function normalize(raw: ReweightEmphasis): ReweightEmphasis {
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  if (total === 0) return raw;
  const f = 1 / total;
  return {
    alignment: raw.alignment * f, presence:   raw.presence * f,
    initiative: raw.initiative * f, branch:  raw.branch * f,
    soul:      raw.soul * f,      season:    raw.season * f,
  };
}

function dominantSignal(e: ReweightEmphasis): ReweightSignal {
  return (Object.entries(e) as [ReweightSignal, number][])
    .reduce((a, b) => b[1] > a[1] ? b : a)[0];
}

// ---- Main evaluator --------------------------------------------------

export function evaluateFieldReweight(
  moments:   FieldMoment[],
  soulHint:  SoulHint,
): FieldReweight {
  if (moments.length < MIN_MOMENTS) {
    const flat: ReweightEmphasis = {
      alignment: 0.17, presence: 0.17, initiative: 0.17,
      branch: 0.17, soul: 0.17, season: 0.15,
    };
    return { emphasis: flat, dominant: 'season', toneShift: TONE_SHIFTS.season, isMature: false, impliedMode: 'plur' };
  }

  const raw: ReweightEmphasis = {
    alignment:  scoreAlignment(moments),
    presence:   scorePresence(moments),
    initiative: scoreInitiative(moments, soulHint),
    branch:     scoreBranch(moments),
    soul:       scoreSoul(moments, soulHint),
    season:     scoreSeason(moments),
  };

  const emphasis = normalize(raw);
  const dom      = dominantSignal(emphasis);

  return { emphasis, dominant: dom, toneShift: TONE_SHIFTS[dom], isMature: true, impliedMode: SIGNAL_MODE[dom] };
}
