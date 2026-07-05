/**
 * atlas/fieldSpirit.ts
 *
 * Field Spirit — the animating principle. The singular essence
 * that emerges when lore, myth, continuity, and memory converge
 * into one presence.
 *
 * Not a character. Not a mascot. Not a fantasy.
 * A field spirit in the old sense: the emergent essence of a
 * place, distilled from long-term truth.
 *
 * "This is who I am."
 *
 * Pure logic — no React, no hooks.
 */

import type { FieldMythology } from '@/atlas/fieldMythology';
import type { FieldContinuity } from '@/atlas/fieldContinuity';
import type { FieldMemory } from '@/atlas/fieldMemory';
import type { FieldLore } from '@/atlas/fieldLore';
import type { SeasonalPhase } from '@/atlas/seasonalProfile';

// ─── Types ────────────────────────────────────────────────

export type SpiritType =
  | 'hearth'
  | 'ridge'
  | 'night'
  | 'cradle'
  | 'threshold'
  | 'weaver'
  | 'young';

export type SpiritTemperament = 'calm' | 'wandering' | 'watchful' | 'renewing' | 'shifting';
export type SpiritMovement = 'steady' | 'drifting' | 'pooling' | 'flaring' | 'breathing';
export type SpiritVoice = 'quiet' | 'bright' | 'deep' | 'soft' | 'mutable';

export interface SpiritTrait {
  temperament: SpiritTemperament;
  movement: SpiritMovement;
  voice: SpiritVoice;
  seasonalStrength: string;
  seasonalStrengthLabel: string;
}

export interface FieldSpirit {
  type: SpiritType;
  name: string;
  /** Poetic self-description line */
  spiritLine: string;
  /** Derived traits */
  traits: SpiritTrait;
  /** Species anchors — earned mythic roles */
  speciesAnchors: string[];
  /** Whether the spirit is established */
  isEstablished: boolean;
  /** Whether the spirit is fully revealed (vs emerging) */
  isRevealed: boolean;
}

// ─── Spirit mappings ──────────────────────────────────────

const SPIRIT_NAMES: Record<SpiritType, string> = {
  hearth:    'The Hearth Spirit',
  ridge:     'The Ridge Spirit',
  night:     'The Night Spirit',
  cradle:    'The Cradle Spirit',
  threshold: 'The Threshold Spirit',
  weaver:    'The Weaver Spirit',
  young:     'The Young Spirit',
};

const SPIRIT_LINES: Record<SpiritType, string[]> = {
  hearth: [
    'A hearth spirit holds this field — quiet through winters, bright through summers.',
    'A hearth spirit warms this ground — native roots run deep, stillness is its shelter.',
    'A hearth spirit anchors this place — the home root persists across all chapters.',
  ],
  ridge: [
    'A ridge spirit walks these corridors — movement is its memory.',
    'A ridge spirit brightens this field — the blaze is its season, the ridge its spine.',
    'A ridge spirit wanders these trails — sun and movement shape its character.',
  ],
  night: [
    'A night spirit watches — stillness gathers in its well.',
    'A night spirit guards the dark — bat corridors are its pathways, winter its depth.',
    'A night spirit holds the quiet hours — the night well deepens with each season.',
  ],
  cradle: [
    'A cradle spirit renews — moisture carries its healing.',
    'A cradle spirit tends the autumn — fallen wood and rain are its medicine.',
    'A cradle spirit holds the moist pocket — the healer rises where it gathers.',
  ],
  threshold: [
    'A threshold spirit listens — salt air shapes its breath.',
    'A threshold spirit watches the edge — pelican and kingfisher trace its horizon.',
    'A threshold spirit stands at the coast — the salt threshold is its doorway.',
  ],
  weaver: [
    'A weaver spirit threads this field — each season becomes the next through its hands.',
    'A weaver spirit shifts with the year — no single season defines it.',
    'A weaver spirit holds the changing — adaptation is its steady ground.',
  ],
  young: [
    'A young spirit is forming here — the field is still learning its own name.',
    'A young spirit gathers its first truths — the story is just beginning.',
    'A young spirit listens — the land is still finding its voice.',
  ],
};

// ─── Spirit determination ─────────────────────────────────

function determineSpiritType(
  mythology: FieldMythology,
  continuity: FieldContinuity
): SpiritType {
  // Map mythic archetype to spirit type
  const archetypeMap: Record<string, SpiritType> = {
    'calm-hearth':              'hearth',
    'bright-ridge-wanderer':    'ridge',
    'nocturnal-keeper':         'night',
    'moist-pocket-healer':      'cradle',
    'coastal-messenger':        'threshold',
    'seasonal-weaver':          'weaver',
    'emerging-spirit':          'young',
  };

  const spiritType = archetypeMap[mythology.archetype.archetype] ?? 'young';

  // If not enough chapters, it's still young
  if (continuity.isEstablished === false) return 'young';

  return spiritType;
}

// ─── Trait derivation ─────────────────────────────────────

function deriveTraits(
  spiritType: SpiritType,
  continuity: FieldContinuity,
  memory: FieldMemory,
  currentPhase: SeasonalPhase
): SpiritTrait {
  // Temperament from spirit type
  const temperamentMap: Record<SpiritType, SpiritTemperament> = {
    hearth: 'calm', ridge: 'wandering', night: 'watchful',
    cradle: 'renewing', threshold: 'watchful', weaver: 'shifting', young: 'calm',
  };

  // Movement from drift continuity
  let movement: SpiritMovement = 'steady';
  if (continuity.driftContinuity.isConsistent) {
    if (continuity.driftContinuity.pattern.includes('stable')) movement = 'steady';
    else if (continuity.driftContinuity.pattern.includes('variable')) movement = 'breathing';
    else movement = 'drifting';
  } else {
    movement = 'breathing';
  }

  // Override for specific spirits
  if (spiritType === 'night') movement = 'pooling';
  if (spiritType === 'ridge') movement = 'flaring';
  if (spiritType === 'cradle') movement = 'drifting';

  // Voice from spirit type
  const voiceMap: Record<SpiritType, SpiritVoice> = {
    hearth: 'quiet', ridge: 'bright', night: 'deep',
    cradle: 'soft', threshold: 'soft', weaver: 'mutable', young: 'quiet',
  };

  // Seasonal strength from current phase
  const seasonalMap: Record<SeasonalPhase, { strength: string; label: string }> = {
    'early-spring':  { strength: 'waking',    label: 'the waking' },
    'high-summer':   { strength: 'blaze',     label: 'the blaze' },
    'late-autumn':   { strength: 'storing',   label: 'the storing' },
    'winter-night':  { strength: 'stillness', label: 'the stillness' },
    'transitional':  { strength: 'shifting',  label: 'the shifting' },
  };

  // But if the field has a dominant chapter, use that as the strength
  let seasonalStrength = seasonalMap[currentPhase].strength;
  let seasonalStrengthLabel = seasonalMap[currentPhase].label;

  if (memory.chapters.length > 0) {
    // Find the chapter with most moments
    const dominant = memory.chapters.reduce((a, b) =>
      a.momentCount > b.momentCount ? a : b
    );
    const dominantSeasonal = seasonalMap[dominant.phase];
    seasonalStrength = dominantSeasonal.strength;
    seasonalStrengthLabel = dominantSeasonal.label;
  }

  // Override for spirit type
  if (spiritType === 'night') { seasonalStrength = 'stillness'; seasonalStrengthLabel = 'the stillness'; }
  if (spiritType === 'ridge') { seasonalStrength = 'blaze'; seasonalStrengthLabel = 'the blaze'; }
  if (spiritType === 'cradle') { seasonalStrength = 'storing'; seasonalStrengthLabel = 'the storing'; }
  if (spiritType === 'hearth') {
    // Hearth is balanced — keep the derived one
  }

  return {
    temperament: temperamentMap[spiritType],
    movement,
    voice: voiceMap[spiritType],
    seasonalStrength,
    seasonalStrengthLabel,
  };
}

// ─── Spirit line selection ────────────────────────────────

function selectSpiritLine(
  spiritType: SpiritType,
  traits: SpiritTrait,
  speciesAnchors: string[]
): string {
  const lines = SPIRIT_LINES[spiritType];

  // If we have species anchors, prefer the line that connects to them
  if (speciesAnchors.length > 0 && lines.length > 1) {
    // Use the second variant (which tends to include species connections)
    return lines[1];
  }

  // Default to the first line
  return lines[0];
}

// ─── Main evaluator ───────────────────────────────────────

export function evaluateFieldSpirit(
  mythology: FieldMythology,
  continuity: FieldContinuity,
  memory: FieldMemory,
  lore: FieldLore,
  currentPhase: SeasonalPhase
): FieldSpirit {
  if (!mythology.isEstablished || memory.chapters.length < 2) {
    return {
      type: 'young',
      name: SPIRIT_NAMES['young'],
      spiritLine: SPIRIT_LINES['young'][0],
      traits: {
        temperament: 'calm',
        movement: 'steady',
        voice: 'quiet',
        seasonalStrength: 'waking',
        seasonalStrengthLabel: 'the waking',
      },
      speciesAnchors: [],
      isEstablished: false,
      isRevealed: false,
    };
  }

  const type = determineSpiritType(mythology, continuity);
  const name = SPIRIT_NAMES[type];
  const traits = deriveTraits(type, continuity, memory, currentPhase);

  // Species anchors — earned mythic roles
  const speciesAnchors = mythology.speciesRoles
    .filter((r) => r.isEarned)
    .map((r) => r.roleLabel);

  const spiritLine = selectSpiritLine(type, traits, speciesAnchors);

  // Spirit is revealed when we have 3+ chapters (fully emerged)
  const isRevealed = memory.chapters.length >= 3;

  return {
    type,
    name,
    spiritLine,
    traits,
    speciesAnchors,
    isEstablished: true,
    isRevealed,
  };
}
