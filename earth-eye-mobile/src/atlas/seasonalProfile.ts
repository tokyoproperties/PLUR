/**
 * atlas/seasonalProfile.ts
 *
 * Seasonal Intelligence — EarthEye begins to understand seasons, cycles,
 * migrations, and rhythms. The field identity becomes time-aware.
 *
 * It doesn't predict weather. It recognizes seasonal context and
 * connects it to the 10-species canon.
 *
 * Built from:
 * - Current date (month, approximate day length)
 * - Field Moments history (patterns over time)
 * - Species canon (peak seasons from Phase VIII)
 *
 * Pure logic — no React, no hooks.
 */

import type { FieldMoment } from '@/atlas/fieldMoment';

// ─── Types ────────────────────────────────────────────────

export type SeasonalPhase =
  | 'early-spring'
  | 'high-summer'
  | 'late-autumn'
  | 'winter-night'
  | 'transitional';

export interface SeasonalProfile {
  /** Current seasonal phase */
  phase: SeasonalPhase;
  /** Human-readable phase label */
  phaseLabel: string;
  /** Species from the 10-canon likely active in this phase */
  likelySpecies: string[];
  /** Short phrase describing the field rhythm this season */
  fieldRhythm: string;
  /** Gentle, observational guidance */
  guidance: string;
  /** Whether the atlas data confirms the expected seasonal pattern */
  patternConfirmed: boolean;
}

// ─── Phase determination ──────────────────────────────────

function getSeasonalPhase(date: Date): SeasonalPhase {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Early spring: Feb 15 – Apr 30
  if ((month === 1 && day >= 15) || month === 2 || month === 3) {
    return 'early-spring';
  }

  // Transitional: May 1 – Jun 14 (spring → summer shoulder)
  if (month === 4 || (month === 5 && day < 15)) {
    return 'transitional';
  }

  // High summer: Jun 15 – Sep 15
  if ((month === 5 && day >= 15) || month === 6 || month === 7 || (month === 8 && day <= 15)) {
    return 'high-summer';
  }

  // Late autumn: Sep 16 – Nov 30
  if ((month === 8 && day > 15) || month === 9 || month === 10) {
    return 'late-autumn';
  }

  // Winter night: Dec 1 – Feb 14
  return 'winter-night';
}

// ─── Phase content ────────────────────────────────────────

const PHASE_DATA: Record<SeasonalPhase, {
  label: string;
  likelySpecies: string[];
  fieldRhythm: string;
  guidance: string;
}> = {
  'early-spring': {
    label: 'Early Spring',
    likelySpecies: [
      'Pacific Chorus Frog',
      'Purple Needlegrass',
      'Lemonade Berry',
      'Western Fence Lizard',
    ],
    fieldRhythm: 'Nights are still and cool; frogs call when moisture holds. Grasses begin to anchor.',
    guidance: 'This is a good season for native grasses to settle — moisture lingers in the soil.',
  },
  'high-summer': {
    label: 'High Summer',
    likelySpecies: [
      'Western Fence Lizard',
      'California Ground Squirrel',
      'Big Brown Bat',
      'Brown Pelican',
    ],
    fieldRhythm: 'Afternoons are bright and hot; lizards bask, squirrels architect below. Bats sweep after dark.',
    guidance: 'The field is most active now — bright corridors favor sun-loving species. Shade is precious.',
  },
  'late-autumn': {
    label: 'Late Autumn',
    likelySpecies: [
      'Acorn Woodpecker',
      'Turkey Tail',
      'Belted Kingfisher',
      'Pacific Chorus Frog',
    ],
    fieldRhythm: 'The corridor cools. Woodpeckers store acorns, fungi emerge from moist wood, kingfishers rattle along water.',
    guidance: 'Dead wood and moisture create conditions for decomposers — turkey tail settles into fallen branches.',
  },
  'winter-night': {
    label: 'Winter Night',
    likelySpecies: [
      'Big Brown Bat',
      'Belted Kingfisher',
      'Turkey Tail',
      'Acorn Woodpecker',
    ],
    fieldRhythm: 'The field rests. Nights are long and still. Occasional coastal movement; bats on warm evenings.',
    guidance: 'This is a quiet season — the field conserves. Stillness is not emptiness; it is recovery.',
  },
  'transitional': {
    label: 'Transitional',
    likelySpecies: [
      'Lemonade Berry',
      'Western Fence Lizard',
      'Pacific Chorus Frog',
      'Purple Needlegrass',
    ],
    fieldRhythm: 'The field shifts between seasons. Patterns are mixed; species transition through the corridor.',
    guidance: 'The field is between rhythms — both spring and summer species pass through.',
  },
};

// ─── Pattern confirmation ─────────────────────────────────

function checkPatternConfirmation(
  phase: SeasonalPhase,
  moments: FieldMoment[]
): boolean {
  if (moments.length < 5) return false;

  // Check if recent moments align with expected seasonal patterns
  const recent = moments.slice(-10);
  const nightCount = recent.filter((m) => m.cardType === 'night').length;
  const brightCount = recent.filter((m) => m.fieldState === 'bright').length;
  const calmCount = recent.filter((m) => m.fieldState === 'calm' || m.fieldState === 'still').length;

  switch (phase) {
    case 'high-summer':
      // Expect bright afternoons
      return brightCount / recent.length > 0.2;
    case 'winter-night':
      // Expect calm/still and some night cards
      return calmCount / recent.length > 0.4;
    case 'early-spring':
      // Expect calm with some moisture-loving species
      return calmCount / recent.length > 0.3;
    case 'late-autumn':
      // Expect mixed but trending calm
      return calmCount / recent.length > 0.3;
    case 'transitional':
      // Transitional is mixed by definition — always "confirmed" if we have data
      return true;
    default:
      return false;
  }
}

// ─── Evaluator ────────────────────────────────────────────

export function evaluateSeasonalProfile(
  moments: FieldMoment[],
  now: Date = new Date()
): SeasonalProfile {
  const phase = getSeasonalPhase(now);
  const data = PHASE_DATA[phase];
  const patternConfirmed = checkPatternConfirmation(phase, moments);

  // If pattern is confirmed by data, enrich the rhythm phrase
  let fieldRhythm = data.fieldRhythm;
  if (patternConfirmed && moments.length >= 5) {
    const recent = moments.slice(-10);
    const confirmedSpecies = new Set<string>();
    for (const m of recent) {
      m.invitedSpecies.forEach((s) => confirmedSpecies.add(s));
    }
    // Check if any confirmed species match the expected ones
    const matches = data.likelySpecies.filter((s) =>
      confirmedSpecies.has(s)
    );
    if (matches.length > 0) {
      fieldRhythm += ` ${matches[0]} confirmed in recent moments.`;
    }
  }

  return {
    phase,
    phaseLabel: data.label,
    likelySpecies: data.likelySpecies,
    fieldRhythm,
    guidance: data.guidance,
    patternConfirmed,
  };
}
