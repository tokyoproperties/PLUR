/**
 * atlas/fieldMoment.ts
 *
 * A Field Moment is an environmental imprint — a tiny, honest snapshot
 * of the world at a point in time. Not a note, not a journal entry —
 * a recording of what the field was doing.
 *
 * Every Field Moment captures:
 * - When and where
 * - What the corridor was doing (tone, proximity)
 * - What the hybrid field state was
 * - Which species were invited
 * - What the suit reported
 * - Whether emergency fallback was active
 * - What the symbolic mode was
 * - What season it was
 *
 * Atlas cards (Yard, Trail, Coastal, Night) are generated from real
 * data — they describe what the field actually supports, not fantasy.
 *
 * Pure types + generation logic — no React, no hooks.
 */

import type { CorridorState } from '@/corridor/corridor-engine';
import type { HybridState, HybridConfidence } from '@/hybrid/hybrid-engine';
import type { EcosystemState } from '@/ecosystem/ecosystem-engine';
import type { EmergencyState } from '@/emergency/state';
import type { SuitState } from '@/suit/types';
import type { SymbolicMode } from '@/contexts/mode-context';
import type { SensorSnapshot } from '@/hooks/useSensors';
import type { LocationConfidence } from '@/utils/thresholds';
import { evaluateSeasonalProfile, type SeasonalConfidence } from '@/atlas/seasonalProfile';

// ─── Field Moment ─────────────────────────────────────────

export type AtlasCardType = 'yard' | 'trail' | 'coastal' | 'night' | 'field' | 'fallback';

export interface FieldMoment {
  /** Unique ID (timestamp-based) */
  id: string;
  /** ISO timestamp */
  timestamp: number;
  /** GPS coordinates, null if unavailable */
  lat: number | null;
  lng: number | null;
  /** Corridor tone at capture time */
  corridorTone: CorridorState['tone'];
  /** Corridor proximity at capture time */
  proximity: CorridorState['proximity'];
  /** Hybrid field state */
  fieldState: HybridState['fieldState'];
  /** Hybrid intensity */
  intensity: number;
  /** Hybrid suggestion */
  suggestion: HybridState['suggestion'];
  /** Symbolic mode */
  symbolic: SymbolicMode;
  /** Season */
  season: 'spring' | 'summer' | 'fall' | 'winter';
  /** Invited species names */
  invitedSpecies: string[];
  /** Invited species count */
  invitedCount: number;
  /** Conditions score */
  conditionsScore: EcosystemState['conditionsScore'];
  /** Emergency fallback active */
  inFallback: boolean;
  /** Emergency reason (if in fallback) */
  fallbackReason: string | null;
  /** Suit devices online */
  suitOnline: number;
  /** Nearest trail name */
  nearestTrail: string | null;
  /** Nearest trail distance (m) */
  nearestTrailDistance: number | null;
  /** Firework window active */
  fireworkWindow: boolean;
  /** What type of atlas card this moment generates */
  cardType: AtlasCardType;
  /** Poetic summary of the moment */
  cardText: string;
  /**
   * Confidence snapshot (Mission 6, July 7 2026) — the four
   * confidence signals Missions 1-5 already established (motion+
   * corridor fused into hybrid, ecosystem passed through from hybrid,
   * and season's own data-richness axis) are now captured per-moment,
   * so historical review can tell a solid read from a shaky one
   * instead of only ever seeing the live value. Location confidence
   * is its own thing (GPS quality), captured separately from the
   * fused hybrid/ecosystem/season axis.
   */
  locationConfidence: LocationConfidence;
  hybridConfidence: HybridConfidence;
  ecosystemConfidence: HybridConfidence;
  seasonalConfidence: SeasonalConfidence;
}

// ─── Season helper ────────────────────────────────────────

function getSeason(date: Date): 'spring' | 'summer' | 'fall' | 'winter' {
  const m = date.getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

// ─── Atlas card generation ────────────────────────────────

function determineCardType(args: {
  proximity: CorridorState['proximity'];
  corridorTone: CorridorState['tone'];
  inFallback: boolean;
  nearestTrail: string | null;
  fieldState: HybridState['fieldState'];
  hour: number;
}): AtlasCardType {
  const { proximity, inFallback, nearestTrail, fieldState, hour } = args;

  if (inFallback) return 'fallback';

  // Night = after civil twilight end or before civil twilight begin
  // Rough: after 8pm or before 5am
  if (hour >= 20 || hour < 5) return 'night';

  // Coastal detection from trail name
  const coastal = nearestTrail?.toLowerCase().includes('beach') ||
    nearestTrail?.toLowerCase().includes('cove') ||
    nearestTrail?.toLowerCase().includes('coast') ||
    nearestTrail?.toLowerCase().includes('bluff') ||
    nearestTrail?.toLowerCase().includes('harbor') ||
    nearestTrail?.toLowerCase().includes('pier') ||
    nearestTrail?.toLowerCase().includes('dana point') ||
    false;

  if (coastal) return 'coastal';
  if (proximity === 'in-yard' || proximity === 'near-yard') return 'yard';
  if (proximity === 'near-trail') return 'trail';

  return 'field';
}

function generateCardText(args: {
  cardType: AtlasCardType;
  invitedSpecies: string[];
  corridorTone: CorridorState['tone'];
  conditionsScore: EcosystemState['conditionsScore'];
  fireworkWindow: boolean;
  season: string;
}): string {
  const { cardType, invitedSpecies, corridorTone, conditionsScore, fireworkWindow } = args;

  const firstSpecies = invitedSpecies[0] ?? 'Unknown species';
  const secondSpecies = invitedSpecies[1];

  switch (cardType) {
    case 'yard':
      if (invitedSpecies.length >= 3) {
        return `${firstSpecies}, ${secondSpecies}, and ${invitedSpecies.length - 2} more find habitat here. ${conditionsScore} conditions in the yard corridor.`;
      }
      if (invitedSpecies.length > 0) {
        return `${firstSpecies} finds habitat here. The yard corridor is ${corridorTone}.`;
      }
      return `The yard corridor is ${corridorTone}. Conditions: ${conditionsScore}.`;

    case 'trail':
      if (invitedSpecies.length > 0) {
        return `A corridor of ${corridorTone}. ${firstSpecies} ${invitedSpecies.length > 1 ? `and ${secondSpecies}` : ''} present along the trail.`;
      }
      return `Trail corridor is ${corridorTone}. No species invited at current conditions.`;

    case 'coastal':
      if (invitedSpecies.length > 0) {
        return `Salt air patience. ${firstSpecies} ${invitedSpecies.length > 1 ? `and ${secondSpecies}` : ''} detected in the coastal corridor.`;
      }
      return `Coastal corridor is ${corridorTone}. The field holds its breath.`;

    case 'night':
      if (invitedSpecies.length > 0) {
        return `The night gardener moves. ${firstSpecies} ${invitedSpecies.length > 1 ? `and ${secondSpecies}` : ''} active in the ${corridorTone} corridor.`;
      }
      return `Night corridor is ${corridorTone}. The field rests.`;

    case 'fallback':
      return `Emergency fallback active. Running on local sensors only — the field still speaks, quietly.`;

    case 'field':
    default:
      if (invitedSpecies.length > 0) {
        return `Open field, ${corridorTone} tone. ${firstSpecies} ${invitedSpecies.length > 1 ? `and ${secondSpecies}` : ''} invited.`;
      }
      return `Open field, ${corridorTone} tone. Conditions: ${conditionsScore}.`;
  }
}

// ─── Moment capture ───────────────────────────────────────

export function captureFieldMoment(args: {
  hybrid: HybridState;
  corridor: CorridorState;
  ecosystem: EcosystemState;
  emergency: EmergencyState;
  suit: SuitState;
  snapshot: SensorSnapshot;
  location: { latitude: number; longitude: number } | null;
  locationConfidence: LocationConfidence;
  /** Prior ring buffer (before this moment is added) — used to derive seasonalConfidence via the same pure evaluator the live seasonal card uses, without creating a hook-level dependency cycle. */
  priorMoments: FieldMoment[];
  fireworkWindow: boolean;
  now?: Date;
}): FieldMoment {
  const { hybrid, corridor, ecosystem, emergency, suit, location, locationConfidence, priorMoments, fireworkWindow, now = new Date() } = args;
  const seasonalConfidence = evaluateSeasonalProfile(priorMoments, now).confidence;

  const season = getSeason(now);
  const hour = now.getHours();
  const invitedSpecies = ecosystem.invitedSpecies.map((i) => i.species.name);

  const cardType = determineCardType({
    proximity: corridor.proximity,
    corridorTone: corridor.tone,
    inFallback: emergency.fallbackMode,
    nearestTrail: corridor.nearestTrailName,
    fieldState: hybrid.fieldState,
    hour,
  });

  const cardText = generateCardText({
    cardType,
    invitedSpecies,
    corridorTone: corridor.tone,
    conditionsScore: ecosystem.conditionsScore,
    fireworkWindow,
    season,
  });

  return {
    id: `moment-${now.getTime()}`,
    timestamp: now.getTime(),
    lat: location?.latitude ?? null,
    lng: location?.longitude ?? null,
    corridorTone: corridor.tone,
    proximity: corridor.proximity,
    fieldState: hybrid.fieldState,
    intensity: hybrid.intensity,
    suggestion: hybrid.suggestion,
    symbolic: hybrid.symbolic,
    season,
    invitedSpecies,
    invitedCount: invitedSpecies.length,
    conditionsScore: ecosystem.conditionsScore,
    inFallback: emergency.fallbackMode,
    fallbackReason: emergency.reason,
    suitOnline: suit.onlineCount,
    nearestTrail: corridor.nearestTrailName,
    nearestTrailDistance: corridor.nearestTrailDistanceMeters,
    fireworkWindow,
    cardType,
    cardText,
    locationConfidence,
    hybridConfidence: hybrid.confidence,
    ecosystemConfidence: ecosystem.confidence,
    seasonalConfidence,
  };
}

// ─── Moment comparison (for change detection) ─────────────

export function shouldCaptureMoment(
  current: FieldMoment | null,
  args: {
    fieldState: HybridState['fieldState'];
    proximity: CorridorState['proximity'];
    inFallback: boolean;
    fireworkWindow: boolean;
    now: number;
    lastCaptureTime: number;
  }
): boolean {
  // Always capture if no previous moment
  if (!current) return true;

  // Capture on field state change
  if (current.fieldState !== args.fieldState) return true;

  // Capture on proximity change
  if (current.proximity !== args.proximity) return true;

  // Capture on fallback change
  if (current.inFallback !== args.inFallback) return true;

  // Capture on firework window change
  if (current.fireworkWindow !== args.fireworkWindow) return true;

  // Capture periodically (every 5 minutes = 300000ms)
  if (args.now - args.lastCaptureTime > 300000) return true;

  return false;
}

// ─── Ring buffer ──────────────────────────────────────────

export const ATLAS_RING_SIZE = 200;

export function addToRing(
  ring: FieldMoment[],
  moment: FieldMoment,
  maxSize: number = ATLAS_RING_SIZE
): FieldMoment[] {
  const updated = [...ring, moment];
  if (updated.length > maxSize) {
    return updated.slice(updated.length - maxSize);
  }
  return updated;
}

// ─── Atlas summary ────────────────────────────────────────

export interface AtlasSummary {
  /** Total moments captured */
  totalMoments: number;
  /** Most recent moment */
  latest: FieldMoment | null;
  /** Distribution of card types */
  cardTypeCounts: Partial<Record<AtlasCardType, number>>;
  /** Most common corridor tone */
  dominantTone: CorridorState['tone'] | null;
  /** Species seen across all moments */
  speciesSeen: string[];
  /** Human-readable summary */
  summary: string;
}

export function summarizeAtlas(ring: FieldMoment[]): AtlasSummary {
  if (ring.length === 0) {
    return {
      totalMoments: 0,
      latest: null,
      cardTypeCounts: {},
      dominantTone: null,
      speciesSeen: [],
      summary: 'No field moments recorded yet.',
    };
  }

  const latest = ring[ring.length - 1];
  const cardTypeCounts: Partial<Record<AtlasCardType, number>> = {};
  const toneCounts: Record<string, number> = {};
  const speciesSet = new Set<string>();

  for (const m of ring) {
    cardTypeCounts[m.cardType] = (cardTypeCounts[m.cardType] ?? 0) + 1;
    toneCounts[m.corridorTone] = (toneCounts[m.corridorTone] ?? 0) + 1;
    m.invitedSpecies.forEach((s) => speciesSet.add(s));
  }

  // Dominant tone
  let dominantTone: CorridorState['tone'] | null = null;
  let maxCount = 0;
  for (const [tone, count] of Object.entries(toneCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantTone = tone as CorridorState['tone'];
    }
  }

  // Summary line
  const parts: string[] = [];
  parts.push(`${ring.length} moment${ring.length !== 1 ? 's' : ''} recorded`);
  if (dominantTone) parts.push(`mostly ${dominantTone}`);
  parts.push(`${speciesSet.size} species seen`);

  return {
    totalMoments: ring.length,
    latest,
    cardTypeCounts,
    dominantTone,
    speciesSeen: Array.from(speciesSet),
    summary: parts.join(' · '),
  };
}
