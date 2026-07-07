/**
 * Scenario 4 — Descent back toward River Walk (cool-down).
 * Segment 4: hybrid returns toward 'calm', corridor stabilizes -- the
 * session narrative should read as coherent by the last reading.
 */
import type { FieldScenario } from '@/sim/simulateField';
import { OFFLINE_SUIT, NO_EMERGENCY } from '@/sim/simulateField';

export function seasonalShift(minutesFromStart: number): FieldScenario {
  return {
    label: 'Descent to River Walk — cool-down',
    minutesFromStart,
    hybrid: {
      fieldState: 'calm',
      proximity: 'near-trail',
      symbolic: 'love',
      suggestion: 'none',
      intensity: 0.25,
      summary: 'calm · near-trail',
      dataQuality: 'live',
      accent: 'amber',
      confidence: 'high',
    },
    corridor: {
      nearestTrailName: 'River Walk Park',
      nearestTrailDistanceMeters: 55,
      inYardCorridor: false,
      proximity: 'near-trail',
      proximityFlags: { inYard: false, nearYard: false, nearTrail: true },
      tone: 'calm',
      confidence: 'high',
      suggestStillness: false,
      summary: 'Near trail (55m) · tone: calm',
    },
    snapshot: {
      lux: 700,
      motionMagnitude: 0.15,
      motionBand: 'active',
      motionConfidence: 'high',
      soundRelativeDb: 30,
    },
    location: { latitude: 35.3748, longitude: -119.0183 },
    locationConfidence: 'high',
    suit: OFFLINE_SUIT,
    emergency: NO_EMERGENCY,
    fireworkWindow: false,
  };
}
