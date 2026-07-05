/**
 * atlas/fieldMythology.ts
 *
 * Field Mythology — the land begins telling the story of itself.
 * Not fantasy. Not invention. Myth in the old sense: the symbolic
 * truth of a place, the way a field understands itself across time.
 *
 * EarthEye derives mythic motifs from continuity arcs, species
 * anchors, seasonal chapters, drift behavior, and habitat evolution.
 *
 * Pure logic — no React, no hooks.
 */

import type { FieldContinuity } from '@/atlas/fieldContinuity';
import type { FieldMemory } from '@/atlas/fieldMemory';
import type { SeasonalPhase } from '@/atlas/seasonalProfile';
import type { ContinuityArc } from '@/atlas/fieldContinuity';
import type { SpeciesContinuity } from '@/atlas/fieldContinuity';

// ─── Types ────────────────────────────────────────────────

export type MythicArchetype =
  | 'calm-hearth'
  | 'bright-ridge-wanderer'
  | 'nocturnal-keeper'
  | 'moist-pocket-healer'
  | 'coastal-messenger'
  | 'seasonal-weaver'
  | 'emerging-spirit';

export interface MythicArchetypeAssessment {
  archetype: MythicArchetype;
  label: string;
  /** Poetic description of the archetype */
  description: string;
  /** Mythic line for the Atlas panel */
  mythologyLine: string;
}

export interface SpeciesMythicRole {
  name: string;
  role: string;
  /** Poetic role description */
  roleLabel: string;
  /** Whether this role is earned through continuity */
  isEarned: boolean;
}

export interface SeasonalMythology {
  phase: SeasonalPhase;
  mythicTone: string;
  mythicLabel: string;
}

export interface DriftMythology {
  direction: string;
  mythicName: string;
  isEarned: boolean;
}

export interface HabitatMythology {
  zoneType: string;
  mythicName: string;
  isEarned: boolean;
}

export interface FieldMythology {
  archetype: MythicArchetypeAssessment;
  speciesRoles: SpeciesMythicRole[];
  seasonalMythology: SeasonalMythology[];
  driftMythology: DriftMythology | null;
  habitatMythology: HabitatMythology[];
  /** Full mythology line for the Atlas panel */
  mythologyLine: string;
  /** Whether mythology is established */
  isEstablished: boolean;
}

// ─── Mythic mappings ──────────────────────────────────────

const SPECIES_ROLES: Record<string, { role: string; roleLabel: string }> = {
  'Western Fence Lizard':      { role: 'the ridge runner',        roleLabel: 'ridge runner' },
  'Big Brown Bat':             { role: 'the night keeper',        roleLabel: 'night keeper' },
  'Pacific Chorus Frog':       { role: 'the shade singer',        roleLabel: 'shade singer' },
  'Acorn Woodpecker':          { role: 'the granary architect',   roleLabel: 'granary architect' },
  'Turkey Tail':               { role: 'the decomposer healer',   roleLabel: 'decomposer healer' },
  'Brown Pelican':             { role: 'the coastal sentinel',    roleLabel: 'coastal sentinel' },
  'Belted Kingfisher':         { role: 'the corridor messenger',  roleLabel: 'corridor messenger' },
  'Purple Needlegrass':        { role: 'the anchor root',         roleLabel: 'anchor root' },
  'Lemonade Berry':            { role: 'the drought guardian',    roleLabel: 'drought guardian' },
  'California Ground Squirrel':{ role: 'the burrow engineer',     roleLabel: 'burrow engineer' },
};

const SEASONAL_MYTH: Record<SeasonalPhase, { tone: string; label: string }> = {
  'early-spring':  { tone: 'the waking',     label: 'The Waking' },
  'high-summer':   { tone: 'the blaze',      label: 'The Blaze' },
  'late-autumn':   { tone: 'the storing',    label: 'The Storing' },
  'winter-night':  { tone: 'the stillness',  label: 'The Stillness' },
  'transitional':  { tone: 'the shifting',   label: 'The Shifting' },
};

const DRIFT_MYTH: Record<string, string> = {
  'calm-drifting':       'the northward breath',
  'bright-expanding':    'the ridge flare',
  'stillness-pooling':   'the night well',
  'noisy-creeping':      'the restless border',
  'mixed-oscillating':   'the breathing edge',
  'stable':              'the steady ground',
};

const HABITAT_MYTH: Record<string, string> = {
  'shade-pocket':          'the cool refuge',
  'moist-pocket':          'the autumn cradle',
  'bright-ridge':          'the summer spine',
  'stillness-lane':        'the night corridor',
  'yard-anchor':           'the home root',
  'coastal-edge':          'the salt threshold',
  'trail-micro-habitat':   'the wandering edge',
};

// ─── Archetype determination ──────────────────────────────

function determineArchetype(
  continuity: FieldContinuity,
  memory: FieldMemory
): MythicArchetypeAssessment {
  const arc = continuity.arc;

  const archetypeMap: Record<ContinuityArc, MythicArchetype> = {
    'calm-anchored':       'calm-hearth',
    'bright-ridge':        'bright-ridge-wanderer',
    'nocturnal-leaning':   'nocturnal-keeper',
    'moist-pocket':        'moist-pocket-healer',
    'coastal-influenced':  'coastal-messenger',
    'native-stable':       'calm-hearth',
    'variable':            'seasonal-weaver',
    'emerging':            'emerging-spirit',
  };

  const archetype = archetypeMap[arc];

  const archetypeData: Record<MythicArchetype, { label: string; description: string }> = {
    'calm-hearth': {
      label: 'The Calm Hearth',
      description: 'A field anchored in stillness, yard stability, and native species.',
    },
    'bright-ridge-wanderer': {
      label: 'The Bright Ridge Wanderer',
      description: 'A field defined by movement, lizards, squirrels, and summer drift.',
    },
    'nocturnal-keeper': {
      label: 'The Nocturnal Keeper',
      description: 'A field shaped by night lanes, bats, and winter stillness.',
    },
    'moist-pocket-healer': {
      label: 'The Moist Pocket Healer',
      description: 'A field shaped by moisture cycles, fungi, and autumn renewal.',
    },
    'coastal-messenger': {
      label: 'The Coastal Messenger',
      description: 'A field touched by salt-air corridors, pelicans, and kingfishers.',
    },
    'seasonal-weaver': {
      label: 'The Seasonal Weaver',
      description: 'A field whose identity shifts with each chapter.',
    },
    'emerging-spirit': {
      label: 'The Emerging Spirit',
      description: 'A young field still forming its myth.',
    },
  };

  const data = archetypeData[archetype];

  // Build mythology line
  let mythologyLine = '';

  if (archetype === 'emerging-spirit') {
    mythologyLine = 'The field is still forming its myth — its story is gathering in the land.';
  } else {
    // Gather supporting details
    const details: string[] = [];

    // Seasonal details
    if (memory.currentChapter) {
      const seasonMyth = SEASONAL_MYTH[memory.currentChapter.phase];
      if (seasonMyth) {
        details.push(`${seasonMyth.tone} across ${memory.currentChapter.label.toLowerCase()}`);
      }
    }

    // Species anchor details
    const anchors = continuity.speciesContinuity
      .filter((s) => s.continuity === 'long-term-anchor' || s.continuity === 'recurring')
      .slice(0, 2);
    if (anchors.length > 0) {
      const anchorNames = anchors.map((a) => a.name.toLowerCase());
      details.push(`${anchorNames.join(' and ')} ${anchors.length > 1 ? 'persist' : 'persists'}`);
    }

    // Drift detail
    if (continuity.driftContinuity.isConsistent && continuity.driftContinuity.pattern !== 'insufficient data') {
      if (continuity.driftContinuity.pattern.includes('stable')) {
        details.push('the corridor holds steady');
      } else if (continuity.driftContinuity.pattern.includes('variable')) {
        details.push('the corridor wanders');
      }
    }

    mythologyLine = `This field carries the myth of ${data.label}`;
    if (details.length > 0) {
      mythologyLine += ` — ${details.join(', ')}`;
    }
    mythologyLine += '.';
  }

  return {
    archetype,
    label: data.label,
    description: data.description,
    mythologyLine,
  };
}

// ─── Species mythology ────────────────────────────────────

function deriveSpeciesMythicRoles(
  speciesContinuity: { name: string; continuity: SpeciesContinuity; continuityLabel: string }[]
): SpeciesMythicRole[] {
  return speciesContinuity
    .map((sc) => {
      const roleData = SPECIES_ROLES[sc.name];
      if (!roleData) return null;

      // Role is earned when species has at least seasonal-visitor continuity
      const isEarned = sc.continuity !== 'transient';

      return {
        name: sc.name,
        role: roleData.role,
        roleLabel: roleData.roleLabel,
        isEarned,
      };
    })
    .filter((r): r is SpeciesMythicRole => r !== null);
}

// ─── Seasonal mythology ───────────────────────────────────

function deriveSeasonalMythology(chapters: { phase: SeasonalPhase }[]): SeasonalMythology[] {
  const seen = new Set<SeasonalPhase>();
  const result: SeasonalMythology[] = [];

  for (const ch of chapters) {
    if (seen.has(ch.phase)) continue;
    seen.add(ch.phase);
    const myth = SEASONAL_MYTH[ch.phase];
    if (myth) {
      result.push({
        phase: ch.phase,
        mythicTone: myth.tone,
        mythicLabel: myth.label,
      });
    }
  }

  return result;
}

// ─── Drift mythology ──────────────────────────────────────

function deriveDriftMythology(
  driftDirection: string,
  driftConsistent: boolean
): DriftMythology | null {
  const mythicName = DRIFT_MYTH[driftDirection];
  if (!mythicName) return null;

  // Only earned if drift is consistent across chapters
  return {
    direction: driftDirection,
    mythicName,
    isEarned: driftConsistent,
  };
}

// ─── Habitat mythology ────────────────────────────────────

function deriveHabitatMythology(
  recurringZones: string[]
): HabitatMythology[] {
  return recurringZones
    .map((zone) => {
      const mythicName = HABITAT_MYTH[zone];
      if (!mythicName) return null;
      return {
        zoneType: zone,
        mythicName,
        isEarned: true,
      };
    })
    .filter((h): h is HabitatMythology => h !== null);
}

// ─── Main evaluator ───────────────────────────────────────

export function evaluateFieldMythology(
  continuity: FieldContinuity,
  memory: FieldMemory
): FieldMythology {
  if (!continuity.isEstablished) {
    return {
      archetype: {
        archetype: 'emerging-spirit',
        label: 'The Emerging Spirit',
        description: 'A young field still forming its myth.',
        mythologyLine: 'The field is still forming its myth — its story is gathering in the land.',
      },
      speciesRoles: [],
      seasonalMythology: [],
      driftMythology: null,
      habitatMythology: [],
      mythologyLine: 'The field is still forming its myth — its story is gathering in the land.',
      isEstablished: false,
    };
  }

  const archetype = determineArchetype(continuity, memory);
  const speciesRoles = deriveSpeciesMythicRoles(continuity.speciesContinuity);
  const seasonalMyth = deriveSeasonalMythology(memory.chapters);

  // Derive drift mythology from current drift direction and consistency
  const driftMyth = deriveDriftMythology(
    continuity.driftContinuity.pattern.includes('stable') ? 'stable' :
    continuity.driftContinuity.pattern.includes('variable') ? 'mixed-oscillating' :
    'stable',
    continuity.driftContinuity.isConsistent
  );

  const habitatMyth = deriveHabitatMythology(continuity.habitatContinuity.recurringZones);

  return {
    archetype,
    speciesRoles,
    seasonalMythology: seasonalMyth,
    driftMythology: driftMyth,
    habitatMythology: habitatMyth,
    mythologyLine: archetype.mythologyLine,
    isEstablished: true,
  };
}
