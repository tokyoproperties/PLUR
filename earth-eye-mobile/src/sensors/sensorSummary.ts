/**
 * sensors/sensorSummary.ts
 *
 * Derives a single truthful narrative line from sensor state,
 * seasonal context, mode, and memory depth.
 *
 * The summary is honest about what it knows:
 *   forming  — sensors not yet active
 *   partial  — one sensor active
 *   live     — full readings, season + memory interpreted
 *
 * Season shapes the adjective:
 *   summer + bright → "bright and open"
 *   winter + still  → "quiet and still"
 *   autumn + mixed  → "unsettled — patterns shifting"
 *
 * Memory depth shapes confidence:
 *   forming memory → "early impressions"
 *   stable memory  → "stable reading"
 *
 * Pure logic — no React, no hooks.
 */

import type { SensorSnapshot } from '@/hooks/useSensors';
import type { SeasonalPhase } from '@/atlas/seasonalProfile';
import type { SymbolicMode } from '@/contexts/mode-context';

export interface SensorSummaryInput {
  snapshot: SensorSnapshot;
  mode: SymbolicMode;
  seasonalPhase: SeasonalPhase;
  seasonalLabel: string;
  patternStatus: 'forming' | 'unclear' | 'confirmed';
  totalMoments: number;
  chapterCount: number;
  continuityEstablished: boolean;
}

export interface SensorSummaryResult {
  /** forming | partial | live */
  dataQuality: 'forming' | 'partial' | 'live';
  /** Georgia italic narrative line */
  summary: string;
  /** Confidence label */
  confidence: 'early impressions' | 'developing' | 'stable reading';
  /** Whether sensors are providing real data */
  hasLight: boolean;
  hasSound: boolean;
}

function seasonAdjective(
  phase: SeasonalPhase,
  fieldState: string,
  patternStatus: string
): string {
  // Base adjective from field state
  const baseMap: Record<string, string> = {
    calm: 'calm',
    bright: 'bright',
    noisy: 'noisy',
    still: 'quiet',
    mixed: 'mixed',
    alert: 'alert',
    dim: 'dim',
  };

  // Season-aware overrides
  if (fieldState === 'bright') {
    if (phase === 'high-summer') return 'bright and open';
    if (phase === 'winter-night') return 'bright but cold';
    if (phase === 'early-spring') return 'bright and waking';
    if (phase === 'late-autumn') return 'bright and thin';
    return 'bright';
  }

  if (fieldState === 'still' || fieldState === 'calm') {
    if (phase === 'winter-night') return 'quiet and still';
    if (phase === 'high-summer') return 'calm and warm';
    if (phase === 'early-spring') return 'calm and gentle';
    if (phase === 'late-autumn') return 'calm and cooling';
    return fieldState === 'still' ? 'quiet' : 'calm';
  }

  if (fieldState === 'noisy' || fieldState === 'mixed') {
    if (patternStatus === 'unclear') return 'unsettled — patterns shifting';
    return baseMap[fieldState] ?? 'mixed';
  }

  return baseMap[fieldState] ?? 'present';
}

function confidenceLabel(
  totalMoments: number,
  chapterCount: number,
  continuityEstablished: boolean
): 'early impressions' | 'developing' | 'stable reading' {
  if (continuityEstablished && totalMoments >= 50) return 'stable reading';
  if (totalMoments >= 10 || chapterCount >= 1) return 'developing';
  return 'early impressions';
}

function deriveFieldState(snapshot: SensorSnapshot): string {
  const { lux, motionMagnitude, soundRelativeDb } = snapshot;

  if (lux !== null && lux > 800) return 'bright';
  if (soundRelativeDb !== null && soundRelativeDb > 60) return 'noisy';
  if (soundRelativeDb !== null && soundRelativeDb > 25) return 'mixed';
  if (motionMagnitude > 0.15) return 'alert';
  if (motionMagnitude < 0.02 && (soundRelativeDb === null || soundRelativeDb < 25)) return 'still';
  return 'calm';
}

export function deriveSensorSummary(input: SensorSummaryInput): SensorSummaryResult {
  const { snapshot, seasonalPhase, patternStatus, totalMoments, chapterCount, continuityEstablished } = input;

  const hasLight = snapshot.lux !== null;
  const hasSound = snapshot.soundRelativeDb !== null;
  const sensorCount = (hasLight ? 1 : 0) + (hasSound ? 1 : 0);
  const dataQuality = sensorCount === 2 ? 'live' : sensorCount === 1 ? 'partial' : 'forming';

  const confidence = confidenceLabel(totalMoments, chapterCount, continuityEstablished);

  if (dataQuality === 'forming') {
    return {
      dataQuality: 'forming',
      summary: 'The field is forming — readings incomplete.',
      confidence,
      hasLight,
      hasSound,
    };
  }

  const fieldState = deriveFieldState(snapshot);
  const adjective = seasonAdjective(seasonalPhase, fieldState, patternStatus);

  let summary: string;

  if (dataQuality === 'partial') {
    summary = `The field feels ${adjective} — partial sensors, ${confidence}.`;
  } else {
    // Live — full interpretation
    if (patternStatus === 'unclear') {
      summary = `The field feels ${adjective} — patterns unclear, ${confidence}.`;
    } else if (confidence === 'early impressions') {
      summary = `The field feels ${adjective} — early impressions, still learning this place.`;
    } else if (confidence === 'stable reading') {
      summary = `The field feels ${adjective} — stable reading, the land is known.`;
    } else {
      summary = `The field feels ${adjective} — ${confidence}.`;
    }
  }

  return {
    dataQuality,
    summary,
    confidence,
    hasLight,
    hasSound,
  };
}
