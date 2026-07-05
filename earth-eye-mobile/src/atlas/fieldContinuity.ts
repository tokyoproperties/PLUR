/**
 * atlas/fieldContinuity.ts
 *
 * Field Continuity — EarthEye forms a long-term identity from
 * accumulated chapters, drift patterns, habitat evolution, and
 * species continuity. The land develops a through-line, a character
 * arc across seasons and years.
 *
 * "This is who I've been." — not just this season, but across
 * the whole arc of memory.
 *
 * Pure logic — no React, no hooks.
 */

import type { FieldMemory, SeasonalChapter, SpeciesFrequency } from '@/atlas/fieldMemory';
import type { SeasonalPhase } from '@/atlas/seasonalProfile';

// ─── Types ────────────────────────────────────────────────

export type ContinuityArc =
  | 'calm-anchored'
  | 'bright-ridge'
  | 'nocturnal-leaning'
  | 'moist-pocket'
  | 'coastal-influenced'
  | 'native-stable'
  | 'emerging'
  | 'variable';

export type SpeciesContinuity =
  | 'recurring'
  | 'seasonally-persistent'
  | 'long-term-anchor'
  | 'seasonal-visitor'
  | 'transient';

export interface SpeciesContinuityRecord {
  name: string;
  continuity: SpeciesContinuity;
  continuityLabel: string;
  chapterCount: number;
  totalCount: number;
}

export interface DriftContinuity {
  /** Dominant drift direction across chapters */
  pattern: string;
  /** Whether drift is consistent across seasons */
  isConsistent: boolean;
  /** Poetic description */
  description: string;
}

export interface HabitatContinuity {
  /** Which habitat zones recur across chapters */
  recurringZones: string[];
  /** Whether habitat is stable or evolving */
  character: 'stable' | 'evolving' | 'forming';
  /** Poetic description */
  description: string;
}

export interface FieldContinuity {
  /** The field's long-term arc */
  arc: ContinuityArc;
  /** Human-readable arc label */
  arcLabel: string;
  /** Poetic continuity line for the Atlas panel */
  continuityLine: string;
  /** Per-species continuity assessments */
  speciesContinuity: SpeciesContinuityRecord[];
  /** Drift continuity across chapters */
  driftContinuity: DriftContinuity;
  /** Habitat continuity across chapters */
  habitatContinuity: HabitatContinuity;
  /** Whether there's enough data for continuity assessment */
  isEstablished: boolean;
}

// ─── Arc determination ────────────────────────────────────

function determineArc(
  chapters: SeasonalChapter[],
  speciesHistory: SpeciesFrequency[]
): { arc: ContinuityArc; label: string } {
  if (chapters.length === 0) return { arc: 'emerging', label: 'Emerging' };
  if (chapters.length === 1) return { arc: 'emerging', label: 'Emerging' };

  // Count dominant tones across chapters
  const toneCounts: Record<string, number> = {};
  for (const ch of chapters) {
    toneCounts[ch.dominantTone] = (toneCounts[ch.dominantTone] ?? 0) + 1;
  }
  const sortedTones = Object.entries(toneCounts).sort((a, b) => b[1] - a[1]);
  const topTone = sortedTones[0]?.[0] ?? 'unknown';

  // Check for recurring species across chapters
  const coastalSpecies = ['Brown Pelican', 'Belted Kingfisher'];
  const nativeSpecies = ['Lemonade Berry', 'Purple Needlegrass'];
  const nocturnalSpecies = ['Big Brown Bat'];
  const moistSpecies = ['Turkey Tail', 'Pacific Chorus Frog'];

  const hasCoastal = speciesHistory.some(s => coastalSpecies.includes(s.name) && s.count >= 2);
  const hasNative = speciesHistory.some(s => nativeSpecies.includes(s.name) && s.count >= 3);
  const hasNocturnal = speciesHistory.some(s => nocturnalSpecies.includes(s.name) && s.count >= 2);
  const hasMoist = speciesHistory.some(s => moistSpecies.includes(s.name) && s.count >= 2);

  // Determine arc based on dominant patterns
  if (topTone === 'calm' || topTone === 'still') {
    if (hasNocturnal) return { arc: 'nocturnal-leaning', label: 'Nocturnal-leaning' };
    return { arc: 'calm-anchored', label: 'Calm-anchored' };
  }
  if (topTone === 'bright') {
    return { arc: 'bright-ridge', label: 'Bright-ridge' };
  }
  if (hasCoastal) return { arc: 'coastal-influenced', label: 'Coastal-influenced' };
  if (hasMoist) return { arc: 'moist-pocket', label: 'Moist-pocket' };
  if (hasNative) return { arc: 'native-stable', label: 'Native-stable' };

  // Multiple chapters but mixed signals
  if (chapters.length >= 3) return { arc: 'variable', label: 'Variable' };
  return { arc: 'emerging', label: 'Emerging' };
}

// ─── Species continuity ───────────────────────────────────

function evaluateSpeciesContinuity(
  chapters: SeasonalChapter[],
  speciesHistory: SpeciesFrequency[]
): SpeciesContinuityRecord[] {
  return speciesHistory.map((sf) => {
    // Count how many chapters this species appears in
    let chapterCount = 0;
    for (const ch of chapters) {
      if (ch.speciesSeen.includes(sf.name)) chapterCount++;
    }

    let continuity: SpeciesContinuity;
    let continuityLabel: string;

    if (chapterCount >= 3 && sf.count >= 5) {
      continuity = 'long-term-anchor';
      continuityLabel = 'long-term anchor species';
    } else if (chapterCount >= 2) {
      continuity = 'recurring';
      continuityLabel = 'recurring across chapters';
    } else if (sf.count >= 3) {
      continuity = 'seasonally-persistent';
      continuityLabel = 'seasonally persistent';
    } else if (sf.count >= 2) {
      continuity = 'seasonal-visitor';
      continuityLabel = 'seasonal visitor';
    } else {
      continuity = 'transient';
      continuityLabel = 'transient';
    }

    return {
      name: sf.name,
      continuity,
      continuityLabel,
      chapterCount,
      totalCount: sf.count,
    };
  });
}

// ─── Drift continuity ─────────────────────────────────────

function evaluateDriftContinuity(chapters: SeasonalChapter[]): DriftContinuity {
  if (chapters.length < 2) {
    return {
      pattern: 'insufficient data',
      isConsistent: false,
      description: 'Drift continuity still forming.',
    };
  }

  const driftPatterns = chapters.map((c) => c.driftPattern);
  const allStable = driftPatterns.every((p) => p === 'stable');
  const allVariable = driftPatterns.every((p) => p === 'variable');
  const mixedCount = driftPatterns.filter((p) => p === 'shifting' || p === 'variable').length;

  let pattern: string;
  let isConsistent: boolean;
  let description: string;

  if (allStable) {
    pattern = 'consistently stable';
    isConsistent = true;
    description = 'Drift holds steady across seasons; the corridor is well-rooted.';
  } else if (allVariable) {
    pattern = 'consistently variable';
    isConsistent = true;
    description = 'The corridor wanders across all seasons; movement is its character.';
  } else if (mixedCount > chapters.length / 2) {
    pattern = 'shifting between seasons';
    isConsistent = false;
    description = 'Drift shifts with the seasons; the corridor breathes between stable and wandering.';
  } else {
    pattern = 'mostly stable with seasonal shifts';
    isConsistent = true;
    description = 'The corridor holds mostly steady, shifting with seasonal rhythm.';
  }

  return { pattern, isConsistent, description };
}

// ─── Habitat continuity ───────────────────────────────────

function evaluateHabitatContinuity(chapters: SeasonalChapter[]): HabitatContinuity {
  if (chapters.length < 2) {
    return {
      recurringZones: [],
      character: 'forming',
      description: 'Habitat continuity still forming.',
    };
  }

  // Find habitat notes that appear across multiple chapters
  const zoneCounts: Record<string, number> = {};
  for (const ch of chapters) {
    for (const note of ch.habitatNotes) {
      zoneCounts[note] = (zoneCounts[note] ?? 0) + 1;
    }
  }

  const recurringZones = Object.entries(zoneCounts)
    .filter(([, count]) => count >= 2)
    .map(([zone]) => zone);

  let character: 'stable' | 'evolving' | 'forming';
  if (recurringZones.length >= 2) {
    character = 'stable';
  } else if (recurringZones.length === 1) {
    character = 'evolving';
  } else {
    character = 'forming';
  }

  let description: string;
  if (recurringZones.length >= 2) {
    description = `${recurringZones.join(' and ')} recur across chapters; habitat holds its shape.`;
  } else if (recurringZones.length === 1) {
    description = `${recurringZones[0]} persists; habitat evolving.`;
  } else {
    description = 'Habitat zones shift with each season; the field is still finding its shape.';
  }

  return { recurringZones, character, description };
}

// ─── Continuity line builder ──────────────────────────────

function buildContinuityLine(
  arc: ContinuityArc,
  arcLabel: string,
  drift: DriftContinuity,
  habitat: HabitatContinuity,
  speciesCont: SpeciesContinuityRecord[],
  chapterCount: number
): string {
  if (chapterCount < 2) {
    return 'Continuity still forming — the field is gathering its first chapters.';
  }

  const parts: string[] = [];

  // Arc identity
  switch (arc) {
    case 'calm-anchored':
      parts.push('This field holds a calm-anchored identity across seasons');
      break;
    case 'bright-ridge':
      parts.push('This field leans bright-ridge; sun-exposed corridors define its character');
      break;
    case 'nocturnal-leaning':
      parts.push('This field leans nocturnal; stillness lanes shape its identity');
      break;
    case 'moist-pocket':
      parts.push('This field holds moist pockets; decomposition corridors are its character');
      break;
    case 'coastal-influenced':
      parts.push('This field is coastal-influenced; salt-air corridors recur across seasons');
      break;
    case 'native-stable':
      parts.push('This field holds native stability; yard anchor species recur across years');
      break;
    case 'variable':
      parts.push('This field is variable; its character shifts with the seasons');
      break;
    case 'emerging':
      parts.push('This field is still emerging; its long identity is forming');
      break;
  }

  // Add a recurring detail
  const anchors = speciesCont.filter((s) => s.continuity === 'long-term-anchor' || s.continuity === 'recurring');
  if (anchors.length > 0) {
    const anchorNames = anchors.slice(0, 2).map((a) => a.name.toLowerCase());
    parts.push(`${anchorNames.join(' and ')} ${anchors.length > 1 ? 'recur' : 'recurs'} across chapters`);
  }

  // Add drift or habitat detail
  if (habitat.character === 'stable' && habitat.recurringZones.length > 0) {
    // Already covered by arc
  } else if (drift.isConsistent && drift.pattern !== 'insufficient data') {
    // Already covered by arc
  }

  return parts.join('; ') + '.';
}

// ─── Main evaluator ───────────────────────────────────────

export function evaluateFieldContinuity(memory: FieldMemory): FieldContinuity {
  if (!memory.isEstablished || memory.chapters.length === 0) {
    return {
      arc: 'emerging',
      arcLabel: 'Emerging',
      continuityLine: 'Continuity still forming — the field is gathering its first chapters.',
      speciesContinuity: [],
      driftContinuity: {
        pattern: 'insufficient data',
        isConsistent: false,
        description: 'Drift continuity still forming.',
      },
      habitatContinuity: {
        recurringZones: [],
        character: 'forming',
        description: 'Habitat continuity still forming.',
      },
      isEstablished: false,
    };
  }

  const { arc, label } = determineArc(memory.chapters, memory.speciesHistory);
  const speciesCont = evaluateSpeciesContinuity(memory.chapters, memory.speciesHistory);
  const driftCont = evaluateDriftContinuity(memory.chapters);
  const habitatCont = evaluateHabitatContinuity(memory.chapters);
  const continuityLine = buildContinuityLine(arc, label, driftCont, habitatCont, speciesCont, memory.chapters.length);

  // Established when we have 2+ chapters
  const isEstablished = memory.chapters.length >= 2;

  return {
    arc,
    arcLabel: label,
    continuityLine,
    speciesContinuity: speciesCont,
    driftContinuity: driftCont,
    habitatContinuity: habitatCont,
    isEstablished,
  };
}
