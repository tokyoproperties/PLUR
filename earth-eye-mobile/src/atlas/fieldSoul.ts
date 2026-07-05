/**
 * atlas/fieldSoul.ts
 *
 * Field Soul — the enduring truth of the field. The part that
 * persists even when everything else changes. Not a feature, not
 * a role, not a story, not a spirit. The soul is the constant.
 *
 * "At its core, this field holds a soul of quiet."
 *
 * Emergent from all layers over time — not one layer, but the
 * convergence of everything the field has been.
 *
 * Pure logic — no React, no hooks.
 */

import type { FieldSpirit } from '@/atlas/fieldSpirit';
import type { FieldContinuity } from '@/atlas/fieldContinuity';
import type { FieldMemory } from '@/atlas/fieldMemory';
import type { FieldMythology } from '@/atlas/fieldMythology';
import type { FieldLore } from '@/atlas/fieldLore';
import type { SeasonalPhase } from '@/atlas/seasonalProfile';

// ─── Types ────────────────────────────────────────────────

export type SoulType =
  | 'quiet'
  | 'warmth'
  | 'watchfulness'
  | 'renewal'
  | 'passage'
  | 'change'
  | 'becoming';

export type RootTone = 'calm' | 'bright' | 'still' | 'moist' | 'shifting';
export type RootMovement = 'steady' | 'wandering' | 'pooling' | 'breathing';

export interface SoulTrait {
  rootTone: RootTone;
  rootMovement: RootMovement;
  rootSeason: string;
  rootSeasonLabel: string;
  /** The species that appears across the most chapters */
  rootAnchor: string | null;
  /** The habitat zone that persists across all seasons */
  rootHabitat: string | null;
}

export interface FieldSoul {
  type: SoulType;
  name: string;
  /** Poetic soul line — quieter than spirit, deeper than lore */
  soulLine: string;
  /** Derived root traits */
  traits: SoulTrait;
  /** Whether the soul is established */
  isEstablished: boolean;
  /** Whether the soul is fully revealed (deep memory required) */
  isRevealed: boolean;
}

// ─── Soul mappings ────────────────────────────────────────

const SOUL_NAMES: Record<SoulType, string> = {
  quiet:        'The Soul of Quiet',
  warmth:       'The Soul of Warmth',
  watchfulness: 'The Soul of Watchfulness',
  renewal:      'The Soul of Renewal',
  passage:      'The Soul of Passage',
  change:       'The Soul of Change',
  becoming:     'The Soul of Becoming',
};

const SOUL_LINES: Record<SoulType, string[]> = {
  quiet: [
    'At its core, this field holds a soul of quiet.',
    'Stillness is the deepest truth of this field — it endures beneath every season.',
    'Quiet rests at the center — the field holds its breath before it speaks.',
  ],
  warmth: [
    'Warmth is the soul of this field — bright through all seasons.',
    'Brightness endures at the core — even winter carries a warm ridge in memory.',
    'Warmth is the oldest truth — the field turns toward light as its nature.',
  ],
  watchfulness: [
    'Watchfulness rests at the center — the field sees before it speaks.',
    'Attention is the soul — the field watches the hours and remembers what passes.',
    'Watchfulness is the deep truth — the night keeper\'s patience is the field\'s own.',
  ],
  renewal: [
    'Renewal is the soul — moisture carries its truth.',
    'Healing is the deepest truth — the field decomposes and regrows as its nature.',
    'Renewal rests at the core — the cradle spirit\'s medicine is the field\'s own.',
  ],
  passage: [
    'Passage shapes the soul — movement is its oldest memory.',
    'The soul of this field is passage — things move through it, and that movement is its truth.',
    'Passage endures at the center — the corridor is not a path but the field itself.',
  ],
  change: [
    'Change is the soul — each season remakes the last.',
    'Transformation is the deepest truth — the field is never the same, and that is its constancy.',
    'Change rests at the center — the weaver\'s thread is the field\'s own essence.',
  ],
  becoming: [
    'Becoming is the soul — the field is still forming its deepest truth.',
    'At its core, this field is becoming — its soul is the act of learning itself.',
    'Becoming rests at the center — the field\'s deepest truth is that it has not yet arrived.',
  ],
};

// ─── Soul determination ───────────────────────────────────

function determineSoulType(
  spirit: FieldSpirit,
  continuity: FieldContinuity,
  memory: FieldMemory,
  mythology: FieldMythology
): SoulType {
  if (!spirit.isEstablished || memory.chapters.length < 2) return 'becoming';

  // Map spirit type to soul type — the soul is deeper, quieter
  const spiritToSoul: Record<string, SoulType> = {
    'hearth':    'quiet',
    'ridge':     'warmth',
    'night':     'watchfulness',
    'cradle':    'renewal',
    'threshold': 'passage',
    'weaver':    'change',
    'young':     'becoming',
  };

  let soul = spiritToSoul[spirit.type] ?? 'becoming';

  // Refine based on deeper signals — the soul can differ from the spirit
  // if the deepest patterns differ from the current ones

  // If the dominant chapter's tone differs from current spirit, the soul
  // reflects the deeper, more enduring pattern
  if (memory.chapters.length >= 3) {
    // Find the dominant chapter (most moments)
    const dominant = memory.chapters.reduce((a, b) =>
      a.momentCount > b.momentCount ? a : b
    );

    // Check if the dominant chapter's tone suggests a different soul
    const dominantTone = dominant.dominantTone;
    if (dominantTone === 'calm' || dominantTone === 'still') {
      // If the field is mostly calm across chapters, the soul leans quiet
      const calmChapters = memory.chapters.filter(c =>
        c.dominantTone === 'calm' || c.dominantTone === 'still'
      ).length;
      if (calmChapters >= 2) soul = 'quiet';
    } else if (dominantTone === 'bright') {
      const brightChapters = memory.chapters.filter(c =>
        c.dominantTone === 'bright'
      ).length;
      if (brightChapters >= 2) soul = 'warmth';
    }
  }

  // If continuity is variable across all chapters, the soul is change
  if (continuity.arc === 'variable' && memory.chapters.length >= 3) {
    soul = 'change';
  }

  // If not enough data for deep patterns, becoming
  if (!spirit.isRevealed) {
    // Still use the mapped soul, but it's not fully revealed
  }

  return soul;
}

// ─── Root traits ──────────────────────────────────────────

function deriveRootTraits(
  continuity: FieldContinuity,
  memory: FieldMemory,
  mythology: FieldMythology,
  currentPhase: SeasonalPhase
): SoulTrait {
  // Root tone — the most common dominant tone across all chapters
  let rootTone: RootTone = 'calm';
  if (memory.chapters.length > 0) {
    const toneCounts: Record<string, number> = {};
    for (const ch of memory.chapters) {
      toneCounts[ch.dominantTone] = (toneCounts[ch.dominantTone] ?? 0) + 1;
    }
    const sorted = Object.entries(toneCounts).sort((a, b) => b[1] - a[1]);
    const topTone = sorted[0]?.[0] ?? 'calm';
    if (topTone === 'calm' || topTone === 'still') rootTone = 'calm';
    else if (topTone === 'bright') rootTone = 'bright';
    else if (topTone === 'still') rootTone = 'still';
    else if (topTone === 'moist') rootTone = 'moist';
    else rootTone = 'shifting';
  }

  // Root movement — from drift continuity
  let rootMovement: RootMovement = 'steady';
  if (continuity.driftContinuity.isConsistent) {
    if (continuity.driftContinuity.pattern.includes('stable')) rootMovement = 'steady';
    else if (continuity.driftContinuity.pattern.includes('variable')) rootMovement = 'breathing';
    else rootMovement = 'wandering';
  } else {
    rootMovement = 'breathing';
  }

  // Root season — the season with the most moments across all chapters
  const seasonCounts: Record<string, number> = {};
  for (const ch of memory.chapters) {
    seasonCounts[ch.phase] = (seasonCounts[ch.phase] ?? 0) + ch.momentCount;
  }
  const sortedSeasons = Object.entries(seasonCounts).sort((a, b) => b[1] - a[1]);
  const rootSeasonPhase = (sortedSeasons[0]?.[0] as SeasonalPhase) ?? currentPhase;

  const seasonLabels: Record<SeasonalPhase, { strength: string; label: string }> = {
    'early-spring':  { strength: 'waking',    label: 'the waking' },
    'high-summer':   { strength: 'blaze',     label: 'the blaze' },
    'late-autumn':   { strength: 'storing',   label: 'the storing' },
    'winter-night':  { strength: 'stillness', label: 'the stillness' },
    'transitional':  { strength: 'shifting',  label: 'the shifting' },
  };

  // Root anchor — species that appears across the most chapters
  let rootAnchor: string | null = null;
  if (continuity.speciesContinuity.length > 0) {
    const sortedAnchors = [...continuity.speciesContinuity].sort((a, b) => b.chapterCount - a.chapterCount);
    rootAnchor = sortedAnchors[0]?.name ?? null;
  }

  // Root habitat — zone that persists across the most chapters
  let rootHabitat: string | null = null;
  if (continuity.habitatContinuity.recurringZones.length > 0) {
    rootHabitat = continuity.habitatContinuity.recurringZones[0];
  }

  return {
    rootTone,
    rootMovement,
    rootSeason: seasonLabels[rootSeasonPhase].strength,
    rootSeasonLabel: seasonLabels[rootSeasonPhase].label,
    rootAnchor,
    rootHabitat,
  };
}

// ─── Soul line selection ──────────────────────────────────

function selectSoulLine(
  soulType: SoulType,
  traits: SoulTrait,
  isRevealed: boolean
): string {
  const lines = SOUL_LINES[soulType];

  // If revealed (deep memory), use the deepest variant
  if (isRevealed && lines.length > 2) {
    return lines[2];
  }

  // If established, use the second variant (slightly deeper)
  if (lines.length > 1) {
    return lines[1];
  }

  return lines[0];
}

// ─── Main evaluator ───────────────────────────────────────

export function evaluateFieldSoul(
  spirit: FieldSpirit,
  continuity: FieldContinuity,
  memory: FieldMemory,
  mythology: FieldMythology,
  lore: FieldLore,
  currentPhase: SeasonalPhase
): FieldSoul {
  if (!spirit.isEstablished || memory.chapters.length < 2) {
    return {
      type: 'becoming',
      name: SOUL_NAMES['becoming'],
      soulLine: SOUL_LINES['becoming'][0],
      traits: {
        rootTone: 'calm',
        rootMovement: 'steady',
        rootSeason: 'waking',
        rootSeasonLabel: 'the waking',
        rootAnchor: null,
        rootHabitat: null,
      },
      isEstablished: false,
      isRevealed: false,
    };
  }

  const type = determineSoulType(spirit, continuity, memory, mythology);
  const name = SOUL_NAMES[type];
  const traits = deriveRootTraits(continuity, memory, mythology, currentPhase);

  // Soul is revealed when we have deep memory (3+ chapters)
  const isRevealed = memory.chapters.length >= 3 && spirit.isRevealed;

  const soulLine = selectSoulLine(type, traits, isRevealed);

  return {
    type,
    name,
    soulLine,
    traits,
    isEstablished: true,
    isRevealed,
  };
}
