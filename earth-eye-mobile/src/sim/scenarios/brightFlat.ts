/**
 * Scenario 1 — River Walk Park (flat, open, bright).
 * Segment 1 of the Bakersfield River Walk -> Panorama Bluffs route.
 *
 * HybridState/CorridorState are hand-authored presets (not run through
 * evaluateHybrid()/evaluateCorridor(), which need a trail-marker list
 * and yard geofence this harness doesn't stand up) -- see the honesty
 * note at the top of sim/simulateField.ts. Everything downstream of
 * these two objects (EcosystemState, FieldMoment, session, narrative)
 * is the real production pipeline.
 */
import type { FieldScenario } from '@/sim/simulateField';
import { OFFLINE_SUIT, NO_EMERGENCY } from '@/sim/simulateField';

export function brightFlat(minutesFromStart: number): FieldScenario {
  return {
    label: 'River Walk Park — flat, open, bright',
    minutesFromStart,
    hybrid: {
      fieldState: 'bright',
      proximity: 'near-trail',
      symbolic: 'love',
      suggestion: 'none',
      intensity: 0.35,
      summary: 'bright · near-trail',
      dataQuality: 'live',
      accent: 'amber',
      confidence: 'high',
    },
    corridor: {
      nearestTrailName: 'River Walk Park',
      nearestTrailDistanceMeters: 40,
      inYardCorridor: false,
      proximity: 'near-trail',
      proximityFlags: { inYard: false, nearYard: false, nearTrail: true },
      tone: 'bright',
      confidence: 'high',
      suggestStillness: false,
      summary: 'Near trail (40m) · tone: bright',
    },
    snapshot: {
      lux: 850,
      motionMagnitude: 0.18,
      motionBand: 'active',
      motionConfidence: 'high',
      soundRelativeDb: 32,
    },
    location: { latitude: 35.3745, longitude: -119.0187 },
    locationConfidence: 'high',
    suit: OFFLINE_SUIT,
    emergency: NO_EMERGENCY,
    fireworkWindow: false,
  };
}
