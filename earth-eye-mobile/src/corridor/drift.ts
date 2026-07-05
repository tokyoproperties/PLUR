/**
 * corridor/drift.ts
 *
 * Corridor Drift — EarthEye stops treating corridors as fixed zones
 * and starts treating them as living currents. The system notices how
 * calm pockets migrate, how noisy edges creep, how bright zones expand
 * and contract, how stillness pools at night.
 *
 * It doesn't predict. It observes. It remembers. It reflects.
 *
 * Built from Field Moments (Phase X) + seasonal phase (Phase XII).
 * Pure logic — no React, no hooks.
 */

import type { FieldMoment } from '@/atlas/fieldMoment';
import type { CorridorState } from '@/corridor/corridor-engine';
import type { SeasonalPhase } from '@/atlas/seasonalProfile';

// ─── Types ────────────────────────────────────────────────

export type DriftDirection =
  | 'calm-drifting'
  | 'bright-expanding'
  | 'noisy-creeping'
  | 'stillness-pooling'
  | 'mixed-oscillating'
  | 'stable';

export type DriftConfidence = 'low' | 'medium' | 'high';

export type DriftCharacter =
  | 'stable'
  | 'wandering'
  | 'seasonally-shifting'
  | 'night-driven'
  | 'stress-driven';

export interface DriftEvent {
  /** When this drift pattern was detected */
  timestamp: number;
  direction: DriftDirection;
  character: DriftCharacter;
  confidence: DriftConfidence;
}

export interface CorridorDrift {
  /** Current drift direction */
  direction: DriftDirection;
  /** How confident the drift assessment is */
  confidence: DriftConfidence;
  /** What's driving the drift */
  character: DriftCharacter;
  /** Whether drift aligns with seasonal expectations */
  alignsWithSeason: boolean;
  /** Recent drift events (last 5) */
  recentEvents: DriftEvent[];
  /** Human-readable drift description */
  description: string;
  /** Whether there's enough data to assess drift */
  isAssessed: boolean;
}

// ─── Helpers ──────────────────────────────────────────────

function getHour(timestamp: number): number {
  return new Date(timestamp).getHours();
}

function isNight(hour: number): boolean {
  return hour >= 20 || hour < 5;
}

function toneValue(tone: string): number {
  // Map tones to a calm→active spectrum: 0=calm, 1=active
  switch (tone) {
    case 'calm': return 0.0;
    case 'still': return 0.1;
    case 'dim': return 0.3;
    case 'mixed': return 0.5;
    case 'bright': return 0.7;
    case 'noisy': return 0.9;
    case 'alert': return 1.0;
    default: return 0.5;
  }
}

// ─── Evaluator ────────────────────────────────────────────

export function evaluateCorridorDrift(
  moments: FieldMoment[],
  seasonalPhase: SeasonalPhase,
  now: Date = new Date()
): CorridorDrift {
  // Need at least 5 moments to assess drift
  if (moments.length < 5) {
    return {
      direction: 'stable',
      confidence: 'low',
      character: 'stable',
      alignsWithSeason: false,
      recentEvents: [],
      description: 'Not enough moments to assess corridor drift yet.',
      isAssessed: false,
    };
  }

  // Use last 20 moments (or all if fewer)
  const recent = moments.slice(-20);
  const total = recent.length;

  // Split into first half and second half to detect trends
  const midPoint = Math.floor(total / 2);
  const firstHalf = recent.slice(0, midPoint);
  const secondHalf = recent.slice(midPoint);

  // Average tone values for each half
  const firstAvg = firstHalf.reduce((sum, m) => sum + toneValue(m.corridorTone), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, m) => sum + toneValue(m.corridorTone), 0) / secondHalf.length;

  // Tone distribution in recent moments
  const toneCounts: Record<string, number> = {};
  for (const m of recent) {
    toneCounts[m.corridorTone] = (toneCounts[m.corridorTone] ?? 0) + 1;
  }

  // Night vs day analysis
  const nightMoments = recent.filter((m) => isNight(getHour(m.timestamp)));
  const dayMoments = recent.filter((m) => !isNight(getHour(m.timestamp)));
  const nightCalmCount = nightMoments.filter((m) => m.corridorTone === 'calm' || m.corridorTone === 'still').length;
  const dayBrightCount = dayMoments.filter((m) => m.corridorTone === 'bright').length;

  // Fallback (stress) analysis
  const fallbackCount = recent.filter((m) => m.inFallback).length;

  // Proximity analysis — where are moments clustering?
  const yardCount = recent.filter((m) => m.proximity === 'in-yard' || m.proximity === 'near-yard').length;
  const trailCount = recent.filter((m) => m.proximity === 'near-trail').length;

  // ─── Direction ─────────────────────────────────────────

  let direction: DriftDirection = 'stable';
  const toneDelta = secondAvg - firstAvg;

  if (Math.abs(toneDelta) < 0.1) {
    // Tone is stable — check for spatial patterns
    if (nightCalmCount / Math.max(nightMoments.length, 1) > 0.6 && nightMoments.length >= 3) {
      direction = 'stillness-pooling';
    } else {
      direction = 'stable';
    }
  } else if (toneDelta > 0.2) {
    // Tone is becoming more active
    if (toneCounts['bright'] > toneCounts['noisy']) {
      direction = 'bright-expanding';
    } else if (toneCounts['noisy'] > 0 || toneCounts['alert'] > 0) {
      direction = 'noisy-creeping';
    } else {
      direction = 'bright-expanding';
    }
  } else if (toneDelta < -0.2) {
    // Tone is becoming calmer
    direction = 'calm-drifting';
  } else {
    // Small shift — check oscillation
    const toneVariety = Object.keys(toneCounts).length;
    if (toneVariety >= 4) {
      direction = 'mixed-oscillating';
    } else {
      direction = 'calm-drifting';
    }
  }

  // ─── Confidence ────────────────────────────────────────

  let confidence: DriftConfidence;
  if (total >= 15 && Math.abs(toneDelta) > 0.15) {
    confidence = 'high';
  } else if (total >= 8 && Math.abs(toneDelta) > 0.08) {
    confidence = 'medium';
  } else if (direction === 'stillness-pooling' && nightMoments.length >= 5) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // ─── Character ─────────────────────────────────────────

  let character: DriftCharacter;

  if (fallbackCount / total > 0.2) {
    character = 'stress-driven';
  } else if (direction === 'stillness-pooling' && nightMoments.length >= 3) {
    character = 'night-driven';
  } else if (Math.abs(toneDelta) > 0.15 && isSeasonallyExpected(direction, seasonalPhase)) {
    character = 'seasonally-shifting';
  } else if (direction === 'mixed-oscillating') {
    character = 'wandering';
  } else if (direction === 'stable') {
    character = 'stable';
  } else {
    character = 'wandering';
  }

  // ─── Seasonal alignment ────────────────────────────────

  const alignsWithSeason = isSeasonallyExpected(direction, seasonalPhase);

  // ─── Description ───────────────────────────────────────

  const description = buildDriftDescription({
    direction,
    character,
    confidence,
    alignsWithSeason,
    seasonalPhase,
    yardRatio: yardCount / total,
    trailRatio: trailCount / total,
  });

  // ─── Recent events ─────────────────────────────────────

  // Build drift events from segments of the recent moments
  const recentEvents: DriftEvent[] = [];
  const segmentSize = Math.max(3, Math.floor(total / 4));
  for (let i = 0; i < total - segmentSize; i += segmentSize) {
    const segment = recent.slice(i, i + segmentSize);
    const segAvg = segment.reduce((sum, m) => sum + toneValue(m.corridorTone), 0) / segment.length;
    const prevSegment = i > 0 ? recent.slice(Math.max(0, i - segmentSize), i) : null;
    const prevAvg = prevSegment ? prevSegment.reduce((sum, m) => sum + toneValue(m.corridorTone), 0) / prevSegment.length : segAvg;
    const segDelta = segAvg - prevAvg;

    let segDir: DriftDirection = 'stable';
    if (segDelta > 0.15) segDir = 'bright-expanding';
    else if (segDelta < -0.15) segDir = 'calm-drifting';
    else if (segment.some((m) => isNight(getHour(m.timestamp)) && (m.corridorTone === 'calm' || m.corridorTone === 'still'))) segDir = 'stillness-pooling';

    recentEvents.push({
      timestamp: segment[segment.length - 1].timestamp,
      direction: segDir,
      character: character,
      confidence: confidence,
    });
  }

  // Keep only last 5 events
  const trimmedEvents = recentEvents.slice(-5);

  return {
    direction,
    confidence,
    character,
    alignsWithSeason,
    recentEvents: trimmedEvents,
    description,
    isAssessed: true,
  };
}

// ─── Seasonal expectations ────────────────────────────────

function isSeasonallyExpected(
  direction: DriftDirection,
  phase: SeasonalPhase
): boolean {
  switch (phase) {
    case 'high-summer':
      // Expect bright expanding, stillness pooling at night
      return direction === 'bright-expanding' || direction === 'stillness-pooling';
    case 'early-spring':
      // Expect calm drifting, stillness
      return direction === 'calm-drifting' || direction === 'stillness-pooling';
    case 'late-autumn':
      // Expect calm, mixed
      return direction === 'calm-drifting' || direction === 'mixed-oscillating';
    case 'winter-night':
      // Expect stillness pooling
      return direction === 'stillness-pooling' || direction === 'stable';
    case 'transitional':
      // Transitional is mixed by nature
      return direction === 'mixed-oscillating' || direction === 'stable';
    default:
      return false;
  }
}

// ─── Description builder ──────────────────────────────────

function buildDriftDescription(args: {
  direction: DriftDirection;
  character: DriftCharacter;
  confidence: DriftConfidence;
  alignsWithSeason: boolean;
  seasonalPhase: SeasonalPhase;
  yardRatio: number;
  trailRatio: number;
}): string {
  const { direction, character, alignsWithSeason, seasonalPhase, yardRatio, trailRatio } = args;

  const phaseLabel = seasonalPhase.replace(/-/g, ' ');

  // Direction phrase
  let dirPhrase = '';
  switch (direction) {
    case 'calm-drifting':
      dirPhrase = yardRatio > 0.4
        ? 'Calm drifting toward the yard'
        : 'Calm drifting through the corridor';
      break;
    case 'bright-expanding':
      dirPhrase = 'Bright zones expanding in the corridor';
      break;
    case 'noisy-creeping':
      dirPhrase = 'Noisy edges creeping along the corridor';
      break;
    case 'stillness-pooling':
      dirPhrase = yardRatio > 0.4
        ? 'Stillness pooling near the yard'
        : 'Stillness pooling in the corridor';
      break;
    case 'mixed-oscillating':
      dirPhrase = 'The corridor oscillates — calm and active in turns';
      break;
    case 'stable':
      dirPhrase = 'The corridor holds steady';
      break;
  }

  // Character suffix
  let charSuffix = '';
  if (alignsWithSeason && character === 'seasonally-shifting') {
    charSuffix = `; pattern consistent with ${phaseLabel}`;
  } else if (character === 'night-driven') {
    charSuffix = '; driven by night rhythms';
  } else if (character === 'stress-driven') {
    charSuffix = '; stress events shaping the corridor';
  } else if (character === 'wandering') {
    charSuffix = '; the corridor wanders';
  }

  return `${dirPhrase}${charSuffix}.`;
}
