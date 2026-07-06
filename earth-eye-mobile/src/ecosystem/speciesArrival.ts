/**
 * ecosystem/speciesArrival.ts
 *
 * Species Arrival — the canon becomes anticipatory. Not predictive,
 * not speculative. Just aware of the rhythms of the land well enough
 * to say "tonight is a frog night" or "this corridor favors bats
 * after dark."
 *
 * Looks at:
 * - Seasonal phase (Phase XII)
 * - Time of day
 * - Corridor drift (Phase XIII)
 * - Environmental conditions (light, stillness)
 * - Species canon (Phase VIII)
 *
 * Derives for each canon species:
 * - Arrival likelihood: high | moderate | low | dormant
 * - Arrival window: short phrase
 * - Arrival reason: poetic, data-backed explanation
 *
 * Pure logic — no React, no hooks.
 */

import type { SeasonalPhase } from '@/atlas/seasonalProfile';
import type { CorridorDrift } from '@/corridor/drift';
import type { SensorSnapshot } from '@/hooks/useSensors';
import { ECOSYSTEM_LUX_THRESHOLDS } from '@/utils/thresholds';

// ─── Types ────────────────────────────────────────────────

export type ArrivalLikelihood = 'high' | 'moderate' | 'low' | 'dormant';

export interface SpeciesArrival {
  /** Species name */
  name: string;
  /** Likelihood of encountering this species soon */
  likelihood: ArrivalLikelihood;
  /** Short phrase describing when to expect them */
  window: string;
  /** Poetic, data-backed explanation */
  reason: string;
  /** Whether this species is in its peak season */
  inPeakSeason: boolean;
}

export interface ArrivalSummary {
  /** Per-species arrival assessments */
  species: SpeciesArrival[];
  /** Species with high likelihood, sorted */
  imminent: SpeciesArrival[];
  /** A one-line summary of what's arriving */
  headline: string;
  /** Poetic line for the Atlas panel */
  atlasLine: string;
}

// ─── Time helpers ─────────────────────────────────────────

function getTimeOfDay(date: Date): 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'night' {
  const h = date.getHours();
  if (h >= 5 && h < 7) return 'dawn';
  if (h >= 7 && h < 11) return 'morning';
  if (h >= 11 && h < 14) return 'midday';
  if (h >= 14 && h < 18) return 'afternoon';
  if (h >= 18 && h < 20) return 'dusk';
  return 'night';
}

function isNight(timeOfDay: string): boolean {
  return timeOfDay === 'night' || timeOfDay === 'dusk' || timeOfDay === 'dawn';
}

// ─── Species arrival data ─────────────────────────────────

interface SpeciesArrivalRule {
  name: string;
  peakSeasons: SeasonalPhase[];
  activeSeasons: SeasonalPhase[];
  preferredTime: ('dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'night' | 'any')[];
  preferredConditions: ('bright' | 'still' | 'moist' | 'coastal' | 'warm' | 'any')[];
  window: string;
  reasonTemplate: (context: ArrivalContext) => string;
}

interface ArrivalContext {
  season: SeasonalPhase;
  timeOfDay: string;
  drift: CorridorDrift;
  snapshot: SensorSnapshot;
  nearCoastal: boolean;
}

const SPECIES_RULES: SpeciesArrivalRule[] = [
  {
    name: 'Pacific Chorus Frog',
    peakSeasons: ['early-spring'],
    activeSeasons: ['early-spring', 'winter-night', 'transitional'],
    preferredTime: ['night', 'dusk', 'dawn'],
    preferredConditions: ['still', 'moist'],
    window: 'tonight after dark',
    reasonTemplate: (ctx) => {
      const still = ctx.drift.direction === 'stillness-pooling' || ctx.drift.direction === 'calm-drifting';
      return `${still ? 'Stillness and' : 'Moisture and'} early ${ctx.season === 'early-spring' ? 'spring' : 'season'} rhythm favor Pacific Chorus Frog.`;
    },
  },
  {
    name: 'Big Brown Bat',
    peakSeasons: ['high-summer'],
    activeSeasons: ['high-summer', 'late-autumn', 'transitional'],
    preferredTime: ['night', 'dusk'],
    preferredConditions: ['warm', 'still'],
    window: 'after dark',
    reasonTemplate: (ctx) => {
      const still = ctx.drift.direction === 'stillness-pooling';
      return `${still ? 'Stillness pooling' : 'Night corridor'} ${ctx.season === 'high-summer' ? 'on a warm summer night' : 'after dusk'} favors Big Brown Bat.`;
    },
  },
  {
    name: 'Western Fence Lizard',
    peakSeasons: ['high-summer'],
    activeSeasons: ['high-summer', 'early-spring', 'transitional'],
    preferredTime: ['midday', 'afternoon', 'morning'],
    preferredConditions: ['bright', 'warm'],
    window: 'bright afternoons',
    reasonTemplate: (ctx) => {
      const bright = ctx.drift.direction === 'bright-expanding' || (ctx.snapshot.lux !== null && ctx.snapshot.lux > ECOSYSTEM_LUX_THRESHOLDS.BRIGHT);
      return `${bright ? 'Bright drift and' : 'Warm'} ${ctx.season === 'high-summer' ? 'high summer' : 'conditions'} favor Fence Lizard.`;
    },
  },
  {
    name: 'California Ground Squirrel',
    peakSeasons: ['high-summer'],
    activeSeasons: ['high-summer', 'late-autumn', 'transitional'],
    preferredTime: ['morning', 'midday', 'afternoon'],
    preferredConditions: ['warm', 'bright'],
    window: 'warm mornings and afternoons',
    reasonTemplate: (ctx) =>
      `${ctx.season === 'high-summer' ? 'High summer' : 'Warm'} corridors favor Ground Squirrel — active below and above ground.`,
  },
  {
    name: 'Acorn Woodpecker',
    peakSeasons: ['late-autumn'],
    activeSeasons: ['late-autumn', 'early-spring', 'transitional'],
    preferredTime: ['morning', 'midday', 'afternoon'],
    preferredConditions: ['still', 'any'],
    window: 'autumn mornings',
    reasonTemplate: (ctx) =>
      `${ctx.season === 'late-autumn' ? 'Late autumn' : 'The season'} brings Acorn Woodpecker — storing and foraging in calm corridors.`,
  },
  {
    name: 'Turkey Tail',
    peakSeasons: ['late-autumn', 'winter-night'],
    activeSeasons: ['late-autumn', 'winter-night', 'transitional'],
    preferredTime: ['any'],
    preferredConditions: ['moist', 'still'],
    window: 'after rain, on fallen wood',
    reasonTemplate: (ctx) =>
      `${ctx.season === 'late-autumn' || ctx.season === 'winter-night' ? 'Cool, moist conditions' : 'Moist conditions'} favor Turkey Tail — decomposer on fallen branches.`,
  },
  {
    name: 'Brown Pelican',
    peakSeasons: ['high-summer'],
    activeSeasons: ['high-summer', 'late-autumn', 'transitional'],
    preferredTime: ['morning', 'midday', 'afternoon'],
    preferredConditions: ['coastal', 'bright'],
    window: 'coastal days',
    reasonTemplate: (ctx) =>
      `${ctx.nearCoastal ? 'Salt air corridor and' : 'Coastal proximity and'} ${ctx.season === 'high-summer' ? 'summer' : 'the season'} favor Brown Pelican.`,
  },
  {
    name: 'Belted Kingfisher',
    peakSeasons: ['late-autumn', 'winter-night'],
    activeSeasons: ['late-autumn', 'winter-night', 'transitional', 'early-spring'],
    preferredTime: ['morning', 'midday', 'afternoon'],
    preferredConditions: ['coastal', 'still'],
    window: 'along water, daytime',
    reasonTemplate: (ctx) =>
      `${ctx.nearCoastal ? 'Water corridor and' : 'Riparian conditions and'} ${ctx.season === 'late-autumn' ? 'autumn' : 'the season'} favor Belted Kingfisher.`,
  },
  {
    name: 'Lemonade Berry',
    peakSeasons: ['early-spring', 'transitional'],
    activeSeasons: ['early-spring', 'transitional', 'high-summer', 'late-autumn'],
    preferredTime: ['any'],
    preferredConditions: ['any'],
    window: 'present through the seasons',
    reasonTemplate: () =>
      'Lemonade Berry holds the ground — roots run deep, always present in the corridor.',
  },
  {
    name: 'Purple Needlegrass',
    peakSeasons: ['early-spring'],
    activeSeasons: ['early-spring', 'transitional'],
    preferredTime: ['any'],
    preferredConditions: ['any'],
    window: 'early spring growth',
    reasonTemplate: (ctx) =>
      `${ctx.season === 'early-spring' ? 'Early spring' : 'The season'} favors Purple Needlegrass — California\'s state grass anchoring the soil.`,
  },
];

// ─── Evaluator ────────────────────────────────────────────

export function evaluateSpeciesArrival(args: {
  season: SeasonalPhase;
  drift: CorridorDrift;
  snapshot: SensorSnapshot;
  nearCoastal: boolean;
  now?: Date;
}): ArrivalSummary {
  const { season, drift, snapshot, nearCoastal, now = new Date() } = args;
  const timeOfDay = getTimeOfDay(now);

  const ctx: ArrivalContext = {
    season,
    timeOfDay,
    drift,
    snapshot,
    nearCoastal,
  };

  const species = SPECIES_RULES.map((rule) => {
    const inPeakSeason = rule.peakSeasons.includes(season);
    const isActiveSeason = rule.activeSeasons.includes(season);

    let likelihood: ArrivalLikelihood;

    if (!isActiveSeason) {
      likelihood = 'dormant';
    } else {
      // Check time and conditions alignment
      const timeMatch = rule.preferredTime.includes('any') || rule.preferredTime.includes(timeOfDay as any);
      const isStill = drift.direction === 'stillness-pooling' || drift.direction === 'calm-drifting';
      const isBright = drift.direction === 'bright-expanding' || (snapshot.lux !== null && snapshot.lux > ECOSYSTEM_LUX_THRESHOLDS.BRIGHT);

      const conditionMatch = rule.preferredConditions.includes('any') ||
        rule.preferredConditions.some((c) => {
          if (c === 'still') return isStill;
          if (c === 'bright') return isBright;
          if (c === 'coastal') return nearCoastal;
          if (c === 'warm') return season === 'high-summer';
          if (c === 'moist') return season === 'early-spring' || season === 'late-autumn';
          return false;
        });

      if (inPeakSeason && timeMatch && conditionMatch) {
        likelihood = 'high';
      } else if (inPeakSeason && (timeMatch || conditionMatch)) {
        likelihood = 'moderate';
      } else if (isActiveSeason) {
        likelihood = timeMatch || conditionMatch ? 'low' : 'low';
      } else {
        likelihood = 'dormant';
      }
    }

    return {
      name: rule.name,
      likelihood,
      window: rule.window,
      reason: rule.reasonTemplate(ctx),
      inPeakSeason,
    };
  });

  // Sort: high → moderate → low → dormant
  const likelihoodOrder: Record<ArrivalLikelihood, number> = {
    high: 0,
    moderate: 1,
    low: 2,
    dormant: 3,
  };
  const sorted = [...species].sort(
    (a, b) => likelihoodOrder[a.likelihood] - likelihoodOrder[b.likelihood]
  );

  const imminent = sorted.filter((s) => s.likelihood === 'high' || s.likelihood === 'moderate');

  // Build headline from imminent species
  let headline = 'No species likely in current conditions.';
  if (imminent.length > 0) {
    const high = imminent.filter((s) => s.likelihood === 'high');
    if (high.length > 0) {
      headline = `${high.map((s) => s.name).join(', ')} likely ${high[0].window}.`;
    } else {
      headline = `${imminent[0].name} — conditions favorable ${imminent[0].window}.`;
    }
  }

  // Build atlas line — poetic summary
  const atlasParts: string[] = [];
  const highNames = sorted.filter((s) => s.likelihood === 'high').map((s) => s.name);
  const moderateNames = sorted.filter((s) => s.likelihood === 'moderate').map((s) => s.name);

  if (highNames.length > 0) {
    atlasParts.push(`${seasonLabel(season)} favors ${highNames.map((s) => s.toLowerCase()).join(' and ')}.`);
  }
  if (moderateNames.length > 0 && highNames.length === 0) {
    atlasParts.push(`${moderateNames.join(' and ')} may appear — conditions are favorable.`);
  }
  if (atlasParts.length === 0) {
    atlasParts.push('The corridor is quiet — few species likely in current conditions.');
  }

  return {
    species: sorted,
    imminent,
    headline,
    atlasLine: atlasParts.join(' '),
  };
}

function seasonLabel(phase: SeasonalPhase): string {
  switch (phase) {
    case 'early-spring': return 'Early spring';
    case 'high-summer': return 'High summer';
    case 'late-autumn': return 'Late autumn';
    case 'winter-night': return 'Winter';
    case 'transitional': return 'The transitional season';
    default: return 'This season';
  }
}
