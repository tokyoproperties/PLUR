/**
 * Scenario 2 — Climb toward Panorama Drive (gradient + shade pockets).
 * Segment 2: corridor tone shifts, hybrid transitions bright -> mixed,
 * motion confidence changes with the incline.
 */
import type { FieldScenario } from '@/sim/simulateField';
import { OFFLINE_SUIT, NO_EMERGENCY } from '@/sim/simulateField';

export function mixedWind(minutesFromStart: number): FieldScenario {
  return {
    label: 'Panorama Drive climb — gradient, shade pockets',
    minutesFromStart,
    hybrid: {
      fieldState: 'mixed',
      proximity: 'near-trail',
      symbolic: 'love',
      suggestion: 'explore',
      intensity: 0.5,
      summary: 'mixed · near-trail',
      dataQuality: 'live',
      accent: 'sage',
      confidence: 'medium',
    },
    corridor: {
      nearestTrailName: 'Panorama Drive Bluffs',
      nearestTrailDistanceMeters: 90,
      inYardCorridor: false,
      proximity: 'near-trail',
      proximityFlags: { inYard: false, nearYard: false, nearTrail: true },
      tone: 'mixed',
      confidence: 'medium',
      suggestStillness: false,
      summary: 'Near trail (90m) · tone: mixed',
    },
    snapshot: {
      lux: 300,
      motionMagnitude: 0.42,
      motionBand: 'active',
      motionConfidence: 'medium',
      soundRelativeDb: 45,
    },
    location: { latitude: 35.3781, longitude: -119.0142 },
    locationConfidence: 'medium',
    suit: OFFLINE_SUIT,
    emergency: NO_EMERGENCY,
    fireworkWindow: false,
  };
}
