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
 */

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

export interface CorridorState {
  /** Name of the closest trail, or null if no trails loaded / no GPS */
  nearestTrailName: string | null;
  /** Distance to nearest trailhead in meters, or null */
  nearestTrailDistanceMeters: number | null;
  /** Whether the user is within the yard corridor radius */
  inYardCorridor: boolean;
  /** Spatial relationship to mapped features */
  proximity: CorridorProximity;
  /** How the sensor field feels at this location */
  tone: CorridorTone;
  /** Whether Lite or Yard evaluation suggests easing up */
  suggestStillness: boolean;
  /** Human-readable one-line summary for UI */
  summary: string;
}

// Yard corridor radius (meters) — a 9x20ft plot, so 50m is generous
const YARD_RADIUS_M = 50;
const NEAR_YARD_RADIUS_M = 200;
const NEAR_TRAIL_RADIUS_M = 500;

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

  const isBright = lux !== null && lux > 800;
  const isDim = lux !== null && lux < 20;
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
 */
export function evaluateCorridor(args: {
  userLat: number | null;
  userLng: number | null;
  trails: TrailMarker[];
  yard: YardStripPoint;
  snapshot: SensorSnapshot;
  lite: LiteModeResult;
  yardEval: YardModeResult;
}): CorridorState {
  const { userLat, userLng, trails, yard, snapshot, lite, yardEval } = args;

  // No GPS lock — degrade gracefully
  if (userLat === null || userLng === null) {
    return {
      nearestTrailName: null,
      nearestTrailDistanceMeters: null,
      inYardCorridor: false,
      proximity: 'unknown',
      tone: classifyTone(snapshot, yardEval),
      suggestStillness: lite.suggestStillness,
      summary: 'No GPS lock — corridor awareness limited to sensor field.',
    };
  }

  // Yard proximity
  const yardDist = haversineMeters(userLat, userLng, yard.lat, yard.lng);
  const inYard = yardDist <= YARD_RADIUS_M;
  const nearYard = yardDist <= NEAR_YARD_RADIUS_M;

  // Nearest trail
  const nearest = findNearestTrail(userLat, userLng, trails);
  const nearestName = nearest?.trail.name ?? null;
  const nearestDist = nearest?.distance ?? null;
  const nearTrail = nearestDist !== null && nearestDist <= NEAR_TRAIL_RADIUS_M;

  // Proximity classification
  let proximity: CorridorProximity;
  if (inYard) proximity = 'in-yard';
  else if (nearYard) proximity = 'near-yard';
  else if (nearTrail) proximity = 'near-trail';
  else proximity = 'field';

  // Tone
  const tone = classifyTone(snapshot, yardEval);

  // Stillness suggestion
  const suggestStillness = lite.suggestStillness || yardEval.suppressActivity;

  // Summary
  const parts: string[] = [];
  if (inYard) parts.push('In yard corridor');
  else if (nearYard) parts.push(`Near yard (${Math.round(yardDist)}m)`);
  else if (nearestName) parts.push(`Nearest: ${nearestName} (${Math.round(nearestDist!)}m)`);
  else parts.push('No trails loaded');

  parts.push(`tone: ${tone}`);
  if (suggestStillness) parts.push('stillness suggested');

  return {
    nearestTrailName: nearestName,
    nearestTrailDistanceMeters: nearestDist,
    inYardCorridor: inYard,
    proximity,
    tone,
    suggestStillness,
    summary: parts.join(' · '),
  };
}
