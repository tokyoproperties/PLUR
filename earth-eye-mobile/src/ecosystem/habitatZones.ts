/**
 * ecosystem/habitatZones.ts
 *
 * Habitat Zones — EarthEye begins identifying micro-habitats based on
 * corridor tone, drift direction, seasonal phase, suit readings, and
 * species canon affinities.
 *
 * It doesn't draw polygons. It doesn't claim certainty.
 * It simply says: "This place favors lizards."
 *
 * Pure logic — no React, no hooks.
 */

import type { SeasonalPhase } from '@/atlas/seasonalProfile';
import type { CorridorDrift } from '@/corridor/drift';
import type { ArrivalSummary } from '@/ecosystem/speciesArrival';
import type { SensorSnapshot } from '@/hooks/useSensors';

// ─── Types ────────────────────────────────────────────────

export type HabitatZoneType =
  | 'shade-pocket'
  | 'moist-pocket'
  | 'bright-ridge'
  | 'stillness-lane'
  | 'coastal-edge'
  | 'yard-anchor'
  | 'trail-micro-habitat';

export type HabitatConfidence = 'low' | 'medium' | 'high';

export interface HabitatZone {
  type: HabitatZoneType;
  label: string;
  speciesAffinity: string[];
  confidence: HabitatConfidence;
  seasonalAlignment: boolean;
  description: string;
}

export interface HabitatAssessment {
  zones: HabitatZone[];
  /** The most prominent zone right now */
  primary: HabitatZone | null;
  /** Poetic line for the Atlas panel */
  atlasLine: string;
  /** Whether there's enough data to assess habitats */
  isAssessed: boolean;
}

// ─── Zone definitions ─────────────────────────────────────

interface ZoneRule {
  type: HabitatZoneType;
  label: string;
  speciesAffinity: string[];
  /** Function to determine if this zone is active and how confident */
  evaluate: (ctx: HabitatContext) => { active: boolean; confidence: HabitatConfidence };
  description: (ctx: HabitatContext) => string;
}

interface HabitatContext {
  season: SeasonalPhase;
  drift: CorridorDrift;
  snapshot: SensorSnapshot;
  arrival: ArrivalSummary;
  nearCoastal: boolean;
  inYard: boolean;
  nearTrail: boolean;
}

// ─── Evaluator ────────────────────────────────────────────

const ZONE_RULES: ZoneRule[] = [
  {
    type: 'shade-pocket',
    label: 'Shade Pocket',
    speciesAffinity: ['Pacific Chorus Frog'],
    evaluate: (ctx) => {
      const lowLight = ctx.snapshot.lux !== null && ctx.snapshot.lux < 50;
      const isStill = ctx.drift.direction === 'stillness-pooling' || ctx.drift.direction === 'calm-drifting';
      const seasonallyActive = ctx.season === 'early-spring' || ctx.season === 'late-autumn' || ctx.season === 'winter-night';
      
      if (lowLight && isStill && seasonallyActive) return { active: true, confidence: 'high' };
      if (lowLight && (isStill || seasonallyActive)) return { active: true, confidence: 'medium' };
      if (lowLight || (isStill && seasonallyActive)) return { active: true, confidence: 'low' };
      return { active: false, confidence: 'low' };
    },
    description: (ctx) => {
      const frog = ctx.arrival.species.find(s => s.name === 'Pacific Chorus Frog');
      if (frog && frog.likelihood === 'high') return 'Shade pocket deepening; chorus frog habitat favored.';
      if (frog && frog.likelihood === 'moderate') return 'Shade pocket forming; frog conditions favorable.';
      return 'Shade pocket present; cool, low-light refuge.';
    },
  },
  {
    type: 'moist-pocket',
    label: 'Moist Pocket',
    speciesAffinity: ['Turkey Tail', 'Pacific Chorus Frog'],
    evaluate: (ctx) => {
      const isStill = ctx.drift.direction === 'stillness-pooling' || ctx.drift.direction === 'calm-drifting';
      const seasonallyActive = ctx.season === 'late-autumn' || ctx.season === 'winter-night' || ctx.season === 'early-spring';
      
      if (isStill && seasonallyActive) return { active: true, confidence: 'high' };
      if (isStill || seasonallyActive) return { active: true, confidence: 'medium' };
      return { active: false, confidence: 'low' };
    },
    description: (ctx) => {
      const turkey = ctx.arrival.species.find(s => s.name === 'Turkey Tail');
      if (turkey && (turkey.likelihood === 'high' || turkey.likelihood === 'moderate'))
        return 'Moist pocket holds; turkey tail conditions favorable on fallen wood.';
      return 'Moist pocket present; decomposition corridor active.';
    },
  },
  {
    type: 'bright-ridge',
    label: 'Bright Ridge',
    speciesAffinity: ['Western Fence Lizard', 'California Ground Squirrel', 'Acorn Woodpecker'],
    evaluate: (ctx) => {
      const bright = ctx.snapshot.lux !== null && ctx.snapshot.lux > 100;
      const brightDrift = ctx.drift.direction === 'bright-expanding';
      const seasonallyActive = ctx.season === 'high-summer' || ctx.season === 'transitional' || ctx.season === 'early-spring';
      
      if (bright && brightDrift && seasonallyActive) return { active: true, confidence: 'high' };
      if (bright && (brightDrift || seasonallyActive)) return { active: true, confidence: 'medium' };
      if (bright || brightDrift) return { active: true, confidence: 'low' };
      return { active: false, confidence: 'low' };
    },
    description: (ctx) => {
      const lizard = ctx.arrival.species.find(s => s.name === 'Western Fence Lizard');
      if (lizard && lizard.likelihood === 'high') return 'Bright ridge forming along the corridor; lizard habitat favored.';
      if (lizard && lizard.likelihood === 'moderate') return 'Bright ridge present; lizard conditions favorable.';
      return 'Bright ridge present; sun-exposed basking corridor.';
    },
  },
  {
    type: 'stillness-lane',
    label: 'Stillness Lane',
    speciesAffinity: ['Big Brown Bat'],
    evaluate: (ctx) => {
      const still = ctx.drift.direction === 'stillness-pooling';
      const nightDriven = ctx.drift.character === 'night-driven';
      const lowLight = ctx.snapshot.lux !== null && ctx.snapshot.lux < 10;
      
      if (still && nightDriven) return { active: true, confidence: 'high' };
      if (still || (nightDriven && lowLight)) return { active: true, confidence: 'medium' };
      if (lowLight && ctx.drift.direction === 'calm-drifting') return { active: true, confidence: 'low' };
      return { active: false, confidence: 'low' };
    },
    description: (ctx) => {
      const bat = ctx.arrival.species.find(s => s.name === 'Big Brown Bat');
      if (bat && bat.likelihood === 'high') return 'Stillness lane pooling near yard; bat corridor strengthened.';
      if (bat && bat.likelihood === 'moderate') return 'Stillness lane forming; bat conditions favorable after dark.';
      return 'Stillness lane present; quiet nocturnal corridor.';
    },
  },
  {
    type: 'coastal-edge',
    label: 'Coastal Edge',
    speciesAffinity: ['Brown Pelican', 'Belted Kingfisher'],
    evaluate: (ctx) => {
      if (!ctx.nearCoastal) return { active: false, confidence: 'low' };
      const seasonallyActive = ctx.season === 'high-summer' || ctx.season === 'late-autumn' || ctx.season === 'winter-night';
      
      if (ctx.nearCoastal && seasonallyActive) return { active: true, confidence: 'high' };
      if (ctx.nearCoastal) return { active: true, confidence: 'medium' };
      return { active: false, confidence: 'low' };
    },
    description: (ctx) => {
      const pelican = ctx.arrival.species.find(s => s.name === 'Brown Pelican');
      const kingfisher = ctx.arrival.species.find(s => s.name === 'Belted Kingfisher');
      if (pelican && pelican.likelihood === 'high') return 'Coastal edge active; pelican corridor favored.';
      if (kingfisher && kingfisher.likelihood === 'moderate') return 'Coastal edge present; kingfisher conditions favorable.';
      return 'Coastal edge present; salt-air corridor.';
    },
  },
  {
    type: 'yard-anchor',
    label: 'Yard Anchor',
    speciesAffinity: ['Lemonade Berry', 'Purple Needlegrass'],
    evaluate: (ctx) => {
      if (!ctx.inYard) return { active: false, confidence: 'low' };
      const stable = ctx.drift.direction === 'stable' || ctx.drift.character === 'stable';
      const seasonallyActive = ctx.season === 'early-spring' || ctx.season === 'transitional';
      
      if (ctx.inYard && stable && seasonallyActive) return { active: true, confidence: 'high' };
      if (ctx.inYard && (stable || seasonallyActive)) return { active: true, confidence: 'medium' };
      if (ctx.inYard) return { active: true, confidence: 'low' };
      return { active: false, confidence: 'low' };
    },
    description: (ctx) => {
      const needlegrass = ctx.arrival.species.find(s => s.name === 'Purple Needlegrass');
      if (needlegrass && needlegrass.likelihood === 'high') return 'Yard anchor stable; needlegrass settling season.';
      return 'Yard anchor present; native plant corridor holds.';
    },
  },
  {
    type: 'trail-micro-habitat',
    label: 'Trail Micro-Habitat',
    speciesAffinity: ['Western Fence Lizard', 'California Ground Squirrel', 'Acorn Woodpecker'],
    evaluate: (ctx) => {
      if (!ctx.nearTrail) return { active: false, confidence: 'low' };
      const seasonallyActive = ctx.season === 'high-summer' || ctx.season === 'transitional' || ctx.season === 'late-autumn';
      
      if (ctx.nearTrail && seasonallyActive) return { active: true, confidence: 'medium' };
      if (ctx.nearTrail) return { active: true, confidence: 'low' };
      return { active: false, confidence: 'low' };
    },
    description: (ctx) => {
      return 'Trail micro-habitat present; edge corridor between human and natural paths.';
    },
  },
];

// ─── Main evaluator ───────────────────────────────────────

export function evaluateHabitatZones(args: {
  season: SeasonalPhase;
  drift: CorridorDrift;
  snapshot: SensorSnapshot;
  arrival: ArrivalSummary;
  nearCoastal: boolean;
  inYard: boolean;
  nearTrail: boolean;
}): HabitatAssessment {
  const ctx: HabitatContext = { ...args };

  const zones: HabitatZone[] = ZONE_RULES
    .filter((rule) => rule.evaluate(ctx).active)
    .map((rule) => {
      const result = rule.evaluate(ctx);
      return {
        type: rule.type,
        label: rule.label,
        speciesAffinity: rule.speciesAffinity,
        confidence: result.confidence,
        seasonalAlignment: isSeasonallyAligned(rule.type, ctx.season),
        description: rule.description(ctx),
      };
    });

  if (zones.length === 0) {
    return {
      zones: [],
      primary: null,
      atlasLine: 'No distinct habitat zones detected in current conditions.',
      isAssessed: false,
    };
  }

  // Sort by confidence (high → medium → low)
  const confidenceOrder: Record<HabitatConfidence, number> = { high: 0, medium: 1, low: 2 };
  zones.sort((a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence]);

  const primary = zones[0];

  // Build atlas line from primary zone
  const atlasLine = primary.description;

  return {
    zones,
    primary,
    atlasLine,
    isAssessed: true,
  };
}

// ─── Seasonal alignment ───────────────────────────────────

function isSeasonallyAligned(zoneType: HabitatZoneType, season: SeasonalPhase): boolean {
  switch (zoneType) {
    case 'shade-pocket':
      return season === 'early-spring' || season === 'late-autumn' || season === 'winter-night';
    case 'moist-pocket':
      return season === 'late-autumn' || season === 'winter-night' || season === 'early-spring';
    case 'bright-ridge':
      return season === 'high-summer' || season === 'transitional';
    case 'stillness-lane':
      return season === 'high-summer' || season === 'winter-night';
    case 'coastal-edge':
      return season === 'high-summer' || season === 'late-autumn';
    case 'yard-anchor':
      return season === 'early-spring' || season === 'transitional';
    case 'trail-micro-habitat':
      return season === 'high-summer' || season === 'transitional' || season === 'late-autumn';
    default:
      return false;
  }
}
