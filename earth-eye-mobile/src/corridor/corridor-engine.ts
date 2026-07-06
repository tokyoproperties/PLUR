/**
 * corridor-engine.ts
 *
 * Pure logic module — no React, no hooks. Takes real data in,
 * returns a CorridorState out. Easy to unit test.
 *
 * Corridor awareness answers: "where am I relative to the trails
 * and my yard, and what does the sensor field feel like here?"
 *
 * Data sources (all passed in, not imported):
 * - user location (from useLocation, may be null)
 * - trail markers (from useCorridors, 74 active trails)
 * - yard point (from useYardStrip, real GPS)
 * - sensor snapshot (from useSensors)
 * - symbolic mode ('plur' | 'love')
 * - lite/yard evaluation results
 *
 * CALIBRATED July 6 2026 (Mission 2 — Corridor Engine Stability):
 * proximity used to be a raw single-fix distance check — a GPS fix
 * jittering right at a radius boundary (e.g. 195m vs 205m against the
 * 200m near-yard radius) would flicker the whole corridor state every
 * time a new fix arrived. This engine now takes WINDOWED distances
 * (averaged over recent fixes by the hook layer, mirroring useMotion's
 * cadence window) plus the previously committed proximity flags, and
 * applies the same exit-margin hysteresis pattern Mission 1 used for
 * motion: leaving a state you're currently in requires clearing the
 * boundary by a margin; entering a state you're not currently in does
 * not need the extra margin. A confidence score (also mirroring
 * Motion) is derived from GPS fix confidence, how close the windowed
 * distance sits to a boundary, and how much the recent fixes disagree
 * with each other.
 */

import { CORRIDOR_THRESHOLDS, CORRIDOR_TONE_LUX_THRESHOLDS, type LocationConfidence } from '@/utils/thresholds';
import type { TrailMarker } from '@/hooks/useCorridors';
import type { YardStripPoint } from '@/hooks/useYardStrip';
import type { SensorSnapshot } from '@/hooks/useSensors';
import type { LiteModeResult } from '@/modes/lite';
import type { YardModeResult } from '@/modes/yard';

export type CorridorTone = 'calm' | 'noisy' | 'bright' | 'still' | 'mixed';

export type CorridorProximity =
  | 'in-yard'
  | 'near-yard'      // within 200m of yard
  | 'near-trail'     // within 500m of a trailhead
  | 'field'          // out in the world, not near a mapped feature
  | 'unknown';       // no GPS lock

export type CorridorConfidence = 'high' | 'medium' | 'low' | 'uncertain';

/** Hysteresis-protected boolean flags carried between evaluations so the hook layer can commit them for the next fix. */
export interface CorridorProximityFlags {
  inYard: boolean;
  nearYard: boolean;
  nearTrail: boolean;
}

export interface CorridorState {
  /** Name of the closest trail, or null if no trails loaded / no GPS */
  nearestTrailName: string | null;
  /** Windowed-mean distance to nearest trailhead in meters, or null */
  nearestTrailDistanceMeters: number | null;
  /** Whether the user is within the yard corridor radius (hysteresis-protected) */
  inYardCorridor: boolean;
  /** Spatial relationship to mapped features */
  proximity: CorridorProximity;
  /** Hysteresis-protected flags, for the hook layer to carry forward as prevFlags on the next fix */
  proximityFlags: CorridorProximityFlags;
  /** How the sensor field feels at this location */
  tone: CorridorTone;
  /** How reliable the current proximity classification is right now */
  confidence: CorridorConfidence;
  /** Whether Lite or Yard evaluation suggests easing up */
  suggestStillness: boolean;
  /** Human-readable one-line summary for UI */
  summary: string;
}

const UNKNOWN_FLAGS: CorridorProximityFlags = { inYard: false, nearYard: false, nearTrail: false };

/**
 * Haversine distance between two lat/lng points, in meters.
 * Used for nearest-trail and yard proximity calculations.
 */
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find the nearest trail from a set of trail markers to a given point.
 */
export function findNearestTrail(
  lat: number,
  lng: number,
  trails: TrailMarker[]
): { trail: TrailMarker; distance: number } | null {
  if (trails.length === 0) return null;

  let nearest = trails[0];
  let minDist = haversineMeters(lat, lng, nearest.lat, nearest.lng);

  for (let i = 1; i < trails.length; i++) {
    const d = haversineMeters(lat, lng, trails[i].lat, trails[i].lng);
    if (d < minDist) {
      minDist = d;
      nearest = trails[i];
    }
  }

  return { trail: nearest, distance: minDist };
}

// Hysteresis margin — how far past a boundary a distance must move
// before we commit to LEAVING a state we're currently in. Entering a
// state we're not currently in needs no extra margin. Same 15% factor
// Mission 1 used for motion bands.
const HYSTERESIS_FACTOR = 0.15;

// How close a windowed distance must sit to a boundary (as a fraction
// of the boundary radius) before confidence drops to 'uncertain'.
const BOUNDARY_PROXIMITY_FACTOR = 0.1;

function insideWithHysteresis(distance: number, radius: number, wasInside: boolean): boolean {
  if (wasInside) {
    // Sticky exit — must clear the radius by the margin to leave.
    return distance <= radius * (1 + HYSTERESIS_FACTOR);
  }
  return distance <= radius;
}

/**
 * Classifies proximity flags from windowed distances, applying
 * exit-margin hysteresis against the previously committed flags.
 */
export function classifyProximityFlags(
  yardDist: number,
  nearestTrailDist: number | null,
  prevFlags: CorridorProximityFlags
): CorridorProximityFlags {
  const { YARD_RADIUS_M, NEAR_YARD_RADIUS_M, NEAR_TRAIL_RADIUS_M } = CORRIDOR_THRESHOLDS;

  const inYard = insideWithHysteresis(yardDist, YARD_RADIUS_M, prevFlags.inYard);
  const nearYard = insideWithHysteresis(yardDist, NEAR_YARD_RADIUS_M, prevFlags.nearYard);
  const nearTrail =
    nearestTrailDist !== null
      ? insideWithHysteresis(nearestTrailDist, NEAR_TRAIL_RADIUS_M, prevFlags.nearTrail)
      : false;

  return { inYard, nearYard, nearTrail };
}

function resolveProximity(flags: CorridorProximityFlags): CorridorProximity {
  if (flags.inYard) return 'in-yard';
  if (flags.nearYard) return 'near-yard';
  if (flags.nearTrail) return 'near-trail';
  return 'field';
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stdDev(values: number[], avg: number): number {
  if (values.length < 2) return 0;
  const variance = mean(values.map((v) => (v - avg) ** 2));
  return Math.sqrt(variance);
}

/**
 * Derives corridor confidence from the upstream GPS confidence, how
 * close the windowed distances sit to a boundary, and how much the
 * recent fixes disagree with each other (noisy signal).
 */
export function deriveCorridorConfidence(
  locationConfidence: LocationConfidence,
  yardDist: number,
  nearestTrailDist: number | null,
  yardDistSamples: number[]
): CorridorConfidence {
  if (locationConfidence === 'uncertain') return 'uncertain';

  const { YARD_RADIUS_M, NEAR_YARD_RADIUS_M, NEAR_TRAIL_RADIUS_M } = CORRIDOR_THRESHOLDS;
  const nearAnyBoundary =
    Math.abs(yardDist - YARD_RADIUS_M) < YARD_RADIUS_M * BOUNDARY_PROXIMITY_FACTOR ||
    Math.abs(yardDist - NEAR_YARD_RADIUS_M) < NEAR_YARD_RADIUS_M * BOUNDARY_PROXIMITY_FACTOR ||
    (nearestTrailDist !== null &&
      Math.abs(nearestTrailDist - NEAR_TRAIL_RADIUS_M) < NEAR_TRAIL_RADIUS_M * BOUNDARY_PROXIMITY_FACTOR);

  if (nearAnyBoundary) return 'uncertain';

  const avg = mean(yardDistSamples);
  const deviation = stdDev(yardDistSamples, avg);
  const noiseRatio = avg > 1 ? deviation / avg : 0;

  if (locationConfidence === 'low' || noiseRatio > 0.5) return 'low';
  if (locationConfidence === 'medium' || noiseRatio > 0.2) return 'medium';
  return 'high';
}

/**
 * Interpret the sensor snapshot into a corridor tone.
 * This is the "feel" of the environment at the current location.
 */
function classifyTone(
  snapshot: SensorSnapshot,
  yard: YardModeResult
): CorridorTone {
  const { lux, motionBand, soundRelativeDb } = snapshot;

  // Firework window overrides everything → still (suppressed)
  if (yard.isFireworkWindow) return 'still';

  const isBright = lux !== null && lux > CORRIDOR_TONE_LUX_THRESHOLDS.BRIGHT;
  const isDim = lux !== null && lux < CORRIDOR_TONE_LUX_THRESHOLDS.DIM;
  const isLoud = soundRelativeDb !== null && soundRelativeDb > 60;
  const isQuiet = soundRelativeDb !== null && soundRelativeDb < 25;
  const isMoving = motionBand === 'active';
  const isStill = motionBand === 'still';

  if (isLoud && isBright) return 'mixed';
  if (isLoud) return 'noisy';
  if (isBright) return 'bright';
  if (isQuiet && isStill && !isDim) return 'calm';
  if (isStill && isDim) return 'still';
  return 'mixed';
}

/**
 * The main corridor evaluation function.
 * All inputs are passed in — this is a pure function.
 *
 * userLat/userLng/yardDist/nearestTrailDist should be the WINDOWED
 * (cadence-smoothed) values from the hook layer, not a single raw fix
 * — see useCorridor.ts. prevFlags is the previously committed
 * CorridorProximityFlags, used for exit-margin hysteresis.
 */
export function evaluateCorridor(args: {
  userLat: number | null;
  userLng: number | null;
  trails: TrailMarker[];
  yard: YardStripPoint;
  snapshot: SensorSnapshot;
  lite: LiteModeResult;
  yardEval: YardModeResult;
  locationConfidence: LocationConfidence;
  /** Windowed (smoothed) distance to yard, meters. If omitted, computed fresh from userLat/userLng (single-fix, no smoothing). */
  windowedYardDistance?: number;
  /** Windowed (smoothed) distance to nearest trail, meters. */
  windowedTrailDistance?: number;
  /** Recent yard-distance samples (for noise-based confidence). Defaults to just the current distance if omitted. */
  yardDistanceSamples?: number[];
  /** Previously committed proximity flags, for hysteresis. Defaults to all-false (fresh start). */
  prevFlags?: CorridorProximityFlags;
}): CorridorState {
  const {
    userLat,
    userLng,
    trails,
    yard,
    snapshot,
    lite,
    yardEval,
    locationConfidence,
    windowedYardDistance,
    windowedTrailDistance,
    yardDistanceSamples,
    prevFlags = UNKNOWN_FLAGS,
  } = args;

  // No GPS lock — degrade gracefully
  if (userLat === null || userLng === null) {
    return {
      nearestTrailName: null,
      nearestTrailDistanceMeters: null,
      inYardCorridor: false,
      proximity: 'unknown',
      proximityFlags: UNKNOWN_FLAGS,
      tone: classifyTone(snapshot, yardEval),
      confidence: 'uncertain',
      suggestStillness: lite.suggestStillness,
      summary: 'No GPS lock — corridor awareness limited to sensor field.',
    };
  }

  // Yard proximity — use the windowed distance if the hook layer
  // supplied one, otherwise fall back to a fresh single-fix distance.
  const rawYardDist = haversineMeters(userLat, userLng, yard.lat, yard.lng);
  const yardDist = windowedYardDistance ?? rawYardDist;

  // Nearest trail
  const nearest = findNearestTrail(userLat, userLng, trails);
  const nearestName = nearest?.trail.name ?? null;
  const rawTrailDist = nearest?.distance ?? null;
  const nearestDist = windowedTrailDistance ?? rawTrailDist;

  // Proximity classification, with exit-margin hysteresis against the
  // previously committed flags.
  const flags = classifyProximityFlags(yardDist, nearestDist, prevFlags);
  const proximity = resolveProximity(flags);

  // Tone
  const tone = classifyTone(snapshot, yardEval);

  // Confidence
  const confidence = deriveCorridorConfidence(
    locationConfidence,
    yardDist,
    nearestDist,
    yardDistanceSamples ?? [yardDist]
  );

  // Stillness suggestion
  const suggestStillness = lite.suggestStillness || yardEval.suppressActivity;

  // Summary
  const parts: string[] = [];
  if (flags.inYard) parts.push('In yard corridor');
  else if (flags.nearYard) parts.push(`Near yard (${Math.round(yardDist)}m)`);
  else if (nearestName) parts.push(`Nearest: ${nearestName} (${Math.round(nearestDist!)}m)`);
  else parts.push('No trails loaded');

  parts.push(`tone: ${tone}`);
  if (confidence === 'uncertain' || confidence === 'low') parts.push(`${confidence} confidence`);
  if (suggestStillness) parts.push('stillness suggested');

  return {
    nearestTrailName: nearestName,
    nearestTrailDistanceMeters: nearestDist,
    inYardCorridor: flags.inYard,
    proximity,
    proximityFlags: flags,
    tone,
    confidence,
    suggestStillness,
    summary: parts.join(' · '),
  };
}
