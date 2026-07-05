/**
 * atlas/fieldLore.ts
 *
 * Field Lore — the land begins to whisper. Not in chapters, not
 * in arcs, not in mythic archetypes — but in lore. Small fragments.
 * Short truths. Tiny symbolic echoes that accumulate over years
 * until they feel like tradition.
 *
 * Lore is not a summary. Lore is not analysis. Lore is not
 * prediction. Lore is the land's voice in miniature.
 *
 * Pure logic — no React, no hooks.
 */

import type { FieldMythology } from '@/atlas/fieldMythology';
import type { FieldContinuity } from '@/atlas/fieldContinuity';
import type { FieldMemory } from '@/atlas/fieldMemory';
import type { SeasonalPhase } from '@/atlas/seasonalProfile';

// ─── Types ────────────────────────────────────────────────

export type LoreCategory = 'origin' | 'season' | 'species' | 'corridor';

export interface LoreFragment {
  category: LoreCategory;
  categoryLabel: string;
  text: string;
  /** Whether this fragment is earned through sufficient data */
  isEarned: boolean;
}

export interface SpeciesLoreChip {
  name: string;
  roleLabel: string;
  loreText: string;
}

export interface FieldLore {
  /** All earned lore fragments */
  fragments: LoreFragment[];
  /** The primary lore line for the Atlas panel */
  loreLine: string;
  /** Per-species lore chips for the Micro-Ecosystem panel */
  speciesLore: SpeciesLoreChip[];
  /** Whether lore is established */
  isEstablished: boolean;
}

// ─── Lore templates ───────────────────────────────────────

// Species lore — tied to mythic roles and seasonal context
const SPECIES_LORE: Record<string, (season: SeasonalPhase) => string> = {
  'Western Fence Lizard': (s) =>
    s === 'high-summer' ? 'ridge runner returns with the blaze' :
    s === 'early-spring' ? 'ridge runner stirs as the waking begins' :
    'ridge runner holds the bright ridge',
  'Big Brown Bat': (s) =>
    s === 'winter-night' ? 'night keeper guards the stillness' :
    s === 'high-summer' ? 'night keeper sweeps the warm dark' :
    'night keeper watches the corridor',
  'Pacific Chorus Frog': (s) =>
    s === 'early-spring' ? 'shade singer wakes with early spring' :
    s === 'winter-night' ? 'shade singer holds the cool refuge' :
    'shade singer waits for moisture',
  'Acorn Woodpecker': (s) =>
    s === 'late-autumn' ? 'granary architect stores the autumn' :
    'granary architect minds the canopy',
  'Turkey Tail': (s) =>
    s === 'late-autumn' ? 'healer rises after rain' :
    s === 'winter-night' ? 'healer works the autumn cradle' :
    'healer tends the fallen wood',
  'Brown Pelican': () => 'coastal sentinel watches the salt threshold',
  'Belted Kingfisher': () => 'corridor messenger traces the water edge',
  'Purple Needlegrass': () => 'anchor root holds the home ground',
  'Lemonade Berry': () => 'drought guardian holds the home root through all seasons',
  'California Ground Squirrel': (s) =>
    s === 'high-summer' ? 'burrow engineer minds the summer spine' :
    'burrow engineer works the trail edge',
};

// Archetype-based origin lore
const ORIGIN_LORE: Record<string, string> = {
  'calm-hearth':              'The Calm Hearth holds its quiet through all chapters.',
  'bright-ridge-wanderer':    'Bright ridges wander, but the hearth remains.',
  'nocturnal-keeper':         'The night keeper stirs where stillness gathers.',
  'moist-pocket-healer':      'Where moisture cradles, the healer remembers.',
  'coastal-messenger':        'Salt thresholds whisper of distant corridors.',
  'seasonal-weaver':          'The weaver threads each season into the next.',
  'emerging-spirit':          'A young field begins its first story.',
};

// Season lore
const SEASON_LORE: Record<SeasonalPhase, string> = {
  'early-spring':  'The waking brings shade singers home.',
  'high-summer':   'The blaze marks the ridge runner\'s ground.',
  'late-autumn':   'The storing gathers what the canopy gives.',
  'winter-night':  'The stillness deepens the night well.',
  'transitional':  'The shifting turns the field\'s page.',
};

// Corridor lore — tied to drift patterns
const CORRIDOR_LORE: Record<string, string> = {
  'stable':              'The steady ground holds the corridor\'s shape.',
  'consistently stable':  'The steady ground holds the corridor\'s shape.',
  'shifting':            'The breathing edge moves with the seasons.',
  'shifting between seasons': 'The breathing edge moves with the seasons.',
  'consistently variable':     'The wandering corridor never settles, and that is its truth.',
  'mostly stable with seasonal shifts': 'The corridor holds, then breathes, then holds again.',
};

// ─── Evaluator ────────────────────────────────────────────

export function evaluateFieldLore(
  mythology: FieldMythology,
  continuity: FieldContinuity,
  memory: FieldMemory,
  currentPhase: SeasonalPhase
): FieldLore {
  // Lore requires: established mythology + 2+ chapters
  if (!mythology.isEstablished || memory.chapters.length < 2) {
    return {
      fragments: [],
      loreLine: 'The land is still gathering the words for its first story.',
      speciesLore: [],
      isEstablished: false,
    };
  }

  const fragments: LoreFragment[] = [];

  // ─── Origin Lore ────────────────────────────────────────
  const originText = ORIGIN_LORE[mythology.archetype.archetype] ?? ORIGIN_LORE['emerging-spirit'];
  fragments.push({
    category: 'origin',
    categoryLabel: 'Origin',
    text: originText,
    isEarned: true,
  });

  // ─── Season Lore ────────────────────────────────────────
  const seasonText = SEASON_LORE[currentPhase] ?? SEASON_LORE['transitional'];
  fragments.push({
    category: 'season',
    categoryLabel: 'Season',
    text: seasonText,
    isEarned: true,
  });

  // ─── Species Lore ───────────────────────────────────────
  const earnedRoles = mythology.speciesRoles.filter((r) => r.isEarned);
  const speciesLore: SpeciesLoreChip[] = [];

  for (const role of earnedRoles) {
    const loreFn = SPECIES_LORE[role.name];
    if (loreFn) {
      const loreText = loreFn(currentPhase);
      speciesLore.push({
        name: role.name,
        roleLabel: role.roleLabel,
        loreText,
      });
    }
  }

  // Pick one species lore fragment for the fragments list
  if (speciesLore.length > 0) {
    fragments.push({
      category: 'species',
      categoryLabel: 'Species',
      text: speciesLore[0].loreText.charAt(0).toUpperCase() + speciesLore[0].loreText.slice(1) + '.',
      isEarned: true,
    });
  }

  // ─── Corridor Lore ──────────────────────────────────────
  const driftPattern = continuity.driftContinuity.pattern;
  const corridorText = CORRIDOR_LORE[driftPattern] ??
    (continuity.driftContinuity.isConsistent
      ? 'The corridor holds its shape across seasons.'
      : 'The corridor breathes with the seasons.');
  fragments.push({
    category: 'corridor',
    categoryLabel: 'Corridor',
    text: corridorText,
    isEarned: true,
  });

  // ─── Lore Line for Atlas ────────────────────────────────
  // Pick the most evocative fragment based on current context
  let loreLine = '';

  // Prefer species lore that connects to current season
  const seasonalSpeciesLore = speciesLore.find((sl) => {
    const loreFn = SPECIES_LORE[sl.name];
    if (!loreFn) return false;
    const text = loreFn(currentPhase);
    // If the lore text mentions the current season's mythic tone, prefer it
    return text.length > 0;
  });

  if (seasonalSpeciesLore) {
    const text = seasonalSpeciesLore.loreText;
    loreLine = text.charAt(0).toUpperCase() + text.slice(1) + '.';
  } else if (originText) {
    loreLine = originText;
  } else {
    loreLine = seasonText;
  }

  return {
    fragments,
    loreLine,
    speciesLore,
    isEstablished: true,
  };
}
