/**
 * Scenario 3 — Panorama Bluffs (wind corridor).
 * Segment 3: corridor engine's real workout point -- shade + wind push
 * hybrid toward 'dim', corridor tone toward 'noisy' (wind), confidence
 * dips as conditions get less legible.
 */
import type { FieldScenario } from '@/sim/simulateField';
import { OFFLINE_SUIT, NO_EMERGENCY } from '@/sim/simulateField';

export function dimCorridor(minutesFromStart: number): FieldScenario {
  return {
    label: 'Panorama Bluffs — wind corridor',
    minutesFromStart,
    hybrid: {
      fieldState: 'dim',
      proximity: 'near-trail',
      symbolic: 'love',
      suggestion: 'quiet',
      intensity: 0.4,
      summary: 'dim · near-trail',
      dataQuality: 'live',
      accent: 'sage',
      confidence: 'medium',
    },
    corridor: {
      nearestTrailName: 'Panorama Bluffs',
      nearestTrailDistanceMeters: 60,
      inYardCorridor: false,
      proximity: 'near-trail',
      proximityFlags: { inYard: false, nearYard: false, nearTrail: true },
      tone: 'noisy',
      confidence: 'medium',
      suggestStillness: true,
      summary: 'Near trail (60m) · tone: noisy (wind)',
    },
    snapshot: {
      lux: 120,
      motionMagnitude: 0.22,
      motionBand: 'forming',
      motionConfidence: 'medium',
      soundRelativeDb: 58,
    },
    location: { latitude: 35.3802, longitude: -119.0121 },
    locationConfidence: 'medium',
    suit: OFFLINE_SUIT,
    emergency: NO_EMERGENCY,
    fireworkWindow: false,
  };
}
