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
 * Pattern status:
 * - 'forming' — fewer than 5 moments, atlas is still gathering
 * - 'unclear' — 5+ moments but pattern doesn't match expectations
 * - 'confirmed' — 5+ moments and pattern matches the expected season
 *
 * CALIBRATED July 6 2026 (Mission 5 — Atlas Seasonal Profile):
 * date-range and pattern-ratio magic numbers moved to thresholds.ts
 * (SEASON_BOUNDARIES, SEASON_PATTERN_THRESHOLDS) — same "one canonical
 * source" pattern as Motion/Corridor/Ecosystem. Added a real
 * `confidence` field, deliberately modeled on drift.ts's DriftConfidence
 * (data-richness axis — how much history backs this read) rather than
 * Hybrid/Corridor's live-sensor-reliability confidence (Missions 1-3)
 * — those are genuinely different questions (see Mission 4 note on not
 * conflating them), so this is its own small derivation, not a forced
 * reuse of an unrelated type. Confidence is derived from the SAME
 * ratio checkPatternConfirmation() already computes — that function
 * now returns the ratio/threshold alongside the boolean instead of
 * discarding them, so confidence doesn't re-run a second parallel
 * calculation of the same thing.
 *
 * Pure logic — no React, no hooks.
 */

import type { FieldMoment } from '@/atlas/fieldMoment';
import { SEASON_BOUNDARIES, SEASON_PATTERN_THRESHOLDS } from '@/utils/thresholds';

// ─── Types ────────────────────────────────────────────────

export type SeasonalPhase =
  | 'early-spring'
  | 'high-summer'
  | 'late-autumn'
  | 'winter-night'
  | 'transitional';

export type PatternStatus = 'forming' | 'unclear' | 'confirmed';

/**
 * Data-richness confidence — mirrors DriftConfidence's axis (how much
 * history backs this read), not live-sensor reliability. 'uncertain'
 * covers the zero-data case, which DriftConfidence's 3-level scale
 * doesn't distinguish from plain 'low'.
 */
export type SeasonalConfidence = 'high' | 'medium' | 'low' | 'uncertain';

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
  /** Richer pattern status for the badge */
  patternStatus: PatternStatus;
  /** Short suffix for the badge — empty string when forming */
  patternSuffix: string;
  /** How much accumulated history backs this pattern read */
  confidence: SeasonalConfidence;
}

// ─── Phase determination ──────────────────────────────────

/** Day-of-year-ish ordinal for month/day, for boundary comparison purposes only (leap-day-agnostic — a 1-day wobble around Feb doesn't matter at seasonal granularity). */
function toOrdinal(month: number, day: number): number {
  return month * 31 + day;
}

export function getSeasonalPhase(date: Date): SeasonalPhase {
  const ordinal = toOrdinal(date.getMonth(), date.getDate());

  // SEASON_BOUNDARIES is sorted chronologically (ordinal-ascending),
  // winter-night last. Scanning in that order and keeping the LAST
  // boundary whose start is <= ordinal correctly finds the greatest
  // lower bound. Default (before scanning) is winter-night: a date
  // before ALL boundaries (early January) is still chronologically
  // inside the PRIOR year's winter-night, which is exactly what the
  // default captures — verified against the original nested if/else
  // logic across all 366 days of a leap year with zero mismatches.
  let phase: SeasonalPhase = 'winter-night';
  for (const boundary of SEASON_BOUNDARIES) {
    if (ordinal >= toOrdinal(boundary.startMonth, boundary.startDay)) {
      phase = boundary.phase;
    }
  }
  return phase;
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

interface PatternCheckResult {
  confirmed: boolean;
  /** The ratio actually measured, or null if this phase has no ratio check (e.g. transitional, or too few moments). */
  ratio: number | null;
  /** The ratio threshold that was checked against, or null to match. */
  threshold: number | null;
}

function checkPatternConfirmation(
  phase: SeasonalPhase,
  moments: FieldMoment[]
): PatternCheckResult {
  if (moments.length < SEASON_PATTERN_THRESHOLDS.MIN_MOMENTS_FOR_PATTERN) {
    return { confirmed: false, ratio: null, threshold: null };
  }

  // Check if recent moments align with expected seasonal patterns
  const recent = moments.slice(-10);
  const brightCount = recent.filter((m) => m.fieldState === 'bright').length;
  const calmCount = recent.filter((m) => m.fieldState === 'calm' || m.fieldState === 'still').length;

  switch (phase) {
    case 'high-summer': {
      const ratio = brightCount / recent.length;
      const threshold = SEASON_PATTERN_THRESHOLDS.HIGH_SUMMER_BRIGHT_RATIO;
      return { confirmed: ratio > threshold, ratio, threshold };
    }
    case 'winter-night': {
      const ratio = calmCount / recent.length;
      const threshold = SEASON_PATTERN_THRESHOLDS.WINTER_NIGHT_CALM_RATIO;
      return { confirmed: ratio > threshold, ratio, threshold };
    }
    case 'early-spring': {
      const ratio = calmCount / recent.length;
      const threshold = SEASON_PATTERN_THRESHOLDS.EARLY_SPRING_CALM_RATIO;
      return { confirmed: ratio > threshold, ratio, threshold };
    }
    case 'late-autumn': {
      const ratio = calmCount / recent.length;
      const threshold = SEASON_PATTERN_THRESHOLDS.LATE_AUTUMN_CALM_RATIO;
      return { confirmed: ratio > threshold, ratio, threshold };
    }
    case 'transitional':
      // Transitional is mixed by definition — always "confirmed" if we have data, no ratio to measure against.
      return { confirmed: true, ratio: null, threshold: null };
    default:
      return { confirmed: false, ratio: null, threshold: null };
  }
}

/**
 * Derives confidence from the same check checkPatternConfirmation()
 * already ran — no second parallel calculation of the ratio.
 */
function deriveSeasonalConfidence(
  moments: FieldMoment[],
  check: PatternCheckResult
): SeasonalConfidence {
  if (moments.length === 0) return 'uncertain';
  if (moments.length < SEASON_PATTERN_THRESHOLDS.MIN_MOMENTS_FOR_PATTERN) return 'low';

  if (!check.confirmed) return 'low';

  // Transitional confirms with no ratio to measure margin against —
  // sample size alone decides high vs medium.
  if (check.ratio === null || check.threshold === null) {
    return moments.length >= SEASON_PATTERN_THRESHOLDS.HIGH_CONFIDENCE_MIN_MOMENTS ? 'high' : 'medium';
  }

  const clearsMargin = check.ratio >= check.threshold * SEASON_PATTERN_THRESHOLDS.HIGH_CONFIDENCE_MARGIN;
  const hasSampleSize = moments.length >= SEASON_PATTERN_THRESHOLDS.HIGH_CONFIDENCE_MIN_MOMENTS;

  return clearsMargin && hasSampleSize ? 'high' : 'medium';
}

// ─── Evaluator ────────────────────────────────────────────

export function evaluateSeasonalProfile(
  moments: FieldMoment[],
  now: Date = new Date()
): SeasonalProfile {
  const phase = getSeasonalPhase(now);
  const data = PHASE_DATA[phase];
  const check = checkPatternConfirmation(phase, moments);
  const patternConfirmed = check.confirmed;
  const confidence = deriveSeasonalConfidence(moments, check);

  // Determine pattern status
  let patternStatus: PatternStatus;
  let patternSuffix: string;

  if (moments.length < SEASON_PATTERN_THRESHOLDS.MIN_MOMENTS_FOR_PATTERN) {
    patternStatus = 'forming';
    patternSuffix = ''; // No suffix — the atlas is still gathering
  } else if (patternConfirmed) {
    patternStatus = 'confirmed';
    patternSuffix = 'pattern confirmed';
  } else {
    patternStatus = 'unclear';
    patternSuffix = 'pattern unclear';
  }

  // If pattern is confirmed by data, enrich the rhythm phrase
  let fieldRhythm = data.fieldRhythm;
  if (patternConfirmed && moments.length >= SEASON_PATTERN_THRESHOLDS.MIN_MOMENTS_FOR_PATTERN) {
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
    patternStatus,
    patternSuffix,
    confidence,
  };
}
