/**
 * fieldEar.ts
 * Arc 57: EARTH EAR -- aural field engine.
 *
 * Formalizes the soundscape layer from primitives already stored in
 * FieldMoment: corridorTone, fieldState, intensity, invitedCount,
 * conditionsScore. No new sensors. No microphone. No new permissions.
 *
 * Mirrors fieldSky.ts architecture: pure functions, no hooks, no React.
 *
 * Five layers (all pure functions, all derived from the moment ring):
 *
 *   earTone        categorical label -- the dominant aural character
 *   earIdentity    descriptive phrase -- what the soundscape IS right now
 *   earSignature   repeating pattern across ring history
 *   earContinuity  0-1 stability of the aural field over time
 *   earOrientation directional lean (opening / settling / active / quiet)
 *   earForesight   short-term aural drift estimate
 *
 * Sound proxies used:
 *   corridorTone  -> primary aural character (calm/noisy/bright/still/mixed)
 *   fieldState    -> secondary character (same type set, finer resolution)
 *   intensity     -> energy level (0-1)
 *   invitedCount  -> species richness proxy (more species = richer soundscape)
 *   conditionsScore -> environmental favorability
 *
 * DESIGN INVARIANT: sensory layer stays invisible.
 * The card never says "EarthEar". It says "quiet corridor" or "active field".
 * These types and phrases feed the narrator -- the narrator surfaces them.
 */

import type { FieldMoment } from '@/atlas/fieldMoment';

// ------ Types ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export type EarTone =
  | 'quiet'    // calm, still, low intensity, no species
  | 'soft'     // calm with some species presence, good conditions
  | 'active'   // noisy or bright with species, medium-high intensity
  | 'dense'    // high intensity, many species, rich soundscape
  | 'still'    // still corridorTone, very low intensity
  | 'mixed'    // mixed tone, variable
  | 'unknown'; // < MIN_EAR_SAMPLES

export type EarIdentityType =
  | 'quiet field'
  | 'soft corridor'
  | 'active corridor'
  | 'dense soundscape'
  | 'still field'
  | 'variable field'
  | 'unknown';

export type EarOrientationType =
  | 'opening'   // tone trending toward active/bright
  | 'settling'  // tone trending toward calm/still
  | 'holding'   // stable
  | 'shifting'  // mixed/variable drift
  | 'unknown';

export type EarForecastType =
  | 'quiet -> active'
  | 'active -> quiet'
  | 'soft -> dense'
  | 'dense -> soft'
  | 'holding'
  | 'unknown';

export interface EarState {
  earTone:      EarTone;
  identity:     EarIdentityType;
  signature:    string | null;        // naturalist phrase describing repeating pattern
  continuity:   number;               // 0-1: 1 = perfectly stable, 0 = chaotic
  orientation:  EarOrientationType;
  foresight:    EarForecastType;
  isCalibrated: boolean;              // true once ring has >= MIN_EAR_SAMPLES
  isActive:     boolean;
}

export const MIN_EAR_SAMPLES = 10;   // minimum moments for meaningful ear layers

// ------ Helpers ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function mostCommon<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  const counts = new Map<T, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: T = arr[0]!;
  let bestN = 0;
  for (const [v, n] of counts) if (n > bestN) { best = v; bestN = n; }
  return best;
}

function variance(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((acc, v) => acc + (v - mean) ** 2, 0) / arr.length;
}

// ------ Layer computations ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * earTone: dominant aural character derived from corridorTone + intensity + species richness.
 */
export function computeEarTone(ring: FieldMoment[]): EarTone {
  if (ring.length < MIN_EAR_SAMPLES) return 'unknown';

  // Use the recent half of the ring for tone (current character, not deep history)
  const recent = ring.slice(-Math.ceil(ring.length / 2));
  const dominantTone = mostCommon(recent.map((m) => m.corridorTone));
  const avgIntensity = recent.reduce((a, m) => a + m.intensity, 0) / recent.length;
  const avgSpecies   = recent.reduce((a, m) => a + m.invitedCount, 0) / recent.length;

  if (dominantTone === 'still') return 'still';
  if (dominantTone === 'mixed') return 'mixed';

  // High richness + high intensity -> dense
  if (avgSpecies >= 3 && avgIntensity >= 0.65) return 'dense';
  // Bright/noisy with some presence -> active
  if ((dominantTone === 'noisy' || dominantTone === 'bright') && avgIntensity >= 0.40) return 'active';
  // Calm with species -> soft
  if (dominantTone === 'calm' && avgSpecies >= 1) return 'soft';
  // Calm without species, low intensity -> quiet
  if (dominantTone === 'calm' && avgIntensity < 0.35) return 'quiet';

  return 'mixed';
}

/**
 * earIdentity: what kind of soundscape is present (descriptive phrase).
 */
export function computeEarIdentity(earTone: EarTone): EarIdentityType {
  switch (earTone) {
    case 'quiet':  return 'quiet field';
    case 'soft':   return 'soft corridor';
    case 'active': return 'active corridor';
    case 'dense':  return 'dense soundscape';
    case 'still':  return 'still field';
    case 'mixed':  return 'variable field';
    default:       return 'unknown';
  }
}

/**
 * earSignature: repeating aural pattern across the full ring.
 * Returns a naturalist phrase or null if no clear pattern.
 */
export function computeEarSignature(ring: FieldMoment[]): string | null {
  if (ring.length < MIN_EAR_SAMPLES) return null;

  const tones  = ring.map((m) => m.corridorTone);
  const dom    = mostCommon(tones);
  const domPct = tones.filter((t) => t === dom).length / tones.length;

  // Transition count -- how often tone changes between consecutive moments
  let transitions = 0;
  for (let i = 1; i < tones.length; i++) if (tones[i] !== tones[i - 1]) transitions++;
  const transRate = transitions / Math.max(1, tones.length - 1);

  const avgSpecies = ring.reduce((a, m) => a + m.invitedCount, 0) / ring.length;

  // Steady pattern: dominant tone > 70% and low transitions
  if (domPct >= 0.70 && transRate < 0.25) {
    if (dom === 'calm' || dom === 'still') {
      return avgSpecies >= 1 ? 'steady quiet with species presence' : 'steady quiet field';
    }
    if (dom === 'bright' || dom === 'noisy') {
      return avgSpecies >= 2 ? 'persistent active soundscape' : 'persistent active corridor';
    }
  }

  // Rhythmic: moderate transitions, not chaotic
  if (transRate >= 0.25 && transRate < 0.55) {
    return avgSpecies >= 2
      ? 'rhythmic field, species weaving in and out'
      : 'rhythmic corridor, tone shifting softly';
  }

  // Drifting: high transitions
  if (transRate >= 0.55) {
    return 'drifting soundscape, no settled tone';
  }

  return null;
}

/**
 * earContinuity: 0-1 stability of the aural field across the full ring.
 * 1 = perfectly stable tone, 0 = chaotic.
 */
export function computeEarContinuity(ring: FieldMoment[]): number {
  if (ring.length < MIN_EAR_SAMPLES) return 1;

  const tones = ring.map((m) => m.corridorTone);
  const dom = mostCommon(tones);
  const toneStability = tones.filter((t) => t === dom).length / tones.length;

  const intensities = ring.map((m) => m.intensity);
  const intensityVar = variance(intensities);
  // Normalize variance: max meaningful variance ~ 0.08 (std dev 0.28)
  const intensityStability = Math.max(0, 1 - intensityVar / 0.08);

  return Math.max(0, Math.min(1,
    toneStability    * 0.60 +
    intensityStability * 0.40,
  ));
}

/**
 * earOrientation: directional lean of the recent aural field.
 * Derived from comparing older half vs recent half of the ring.
 */
export function computeEarOrientation(ring: FieldMoment[]): EarOrientationType {
  if (ring.length < MIN_EAR_SAMPLES * 2) return 'unknown';

  const half  = Math.floor(ring.length / 2);
  const older = ring.slice(0, half);
  const newer = ring.slice(half);

  const olderIntensity = older.reduce((a, m) => a + m.intensity, 0) / older.length;
  const newerIntensity = newer.reduce((a, m) => a + m.intensity, 0) / newer.length;
  const delta = newerIntensity - olderIntensity;

  const olderSpecies = older.reduce((a, m) => a + m.invitedCount, 0) / older.length;
  const newerSpecies = newer.reduce((a, m) => a + m.invitedCount, 0) / newer.length;
  const speciesDelta = newerSpecies - olderSpecies;

  if (delta > 0.12 || speciesDelta > 0.8) return 'opening';
  if (delta < -0.12 || speciesDelta < -0.8) return 'settling';

  const newerTones = newer.map((m) => m.corridorTone);
  const mixed = newerTones.filter((t) => t === 'mixed').length / newerTones.length;
  if (mixed > 0.40) return 'shifting';

  return 'holding';
}

/**
 * earForesight: short-term aural drift estimate.
 * Derived from orientation + recent earTone.
 */
export function computeEarForesight(
  earTone:     EarTone,
  orientation: EarOrientationType,
): EarForecastType {
  if (earTone === 'unknown') return 'unknown';

  if (orientation === 'opening') {
    if (earTone === 'quiet' || earTone === 'still') return 'quiet -> active';
    if (earTone === 'soft')  return 'soft -> dense';
    return 'holding';
  }
  if (orientation === 'settling') {
    if (earTone === 'active' || earTone === 'dense') return 'active -> quiet';
    if (earTone === 'dense') return 'dense -> soft';
    return 'holding';
  }
  if (orientation === 'shifting') return 'holding';

  return 'holding';
}

// ------ Top-level compositor ------------------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * computeEarState: derive the full EarState from the moment ring.
 * Called by useFieldEar hook. Pure function -- no side effects.
 */
export function computeEarState(ring: FieldMoment[], isActive: boolean): EarState {
  const neutral: EarState = {
    earTone: 'unknown', identity: 'unknown', signature: null,
    continuity: 1, orientation: 'unknown', foresight: 'unknown',
    isCalibrated: false, isActive: false,
  };

  if (!isActive || ring.length < MIN_EAR_SAMPLES) return neutral;

  const earTone    = computeEarTone(ring);
  const identity   = computeEarIdentity(earTone);
  const signature  = computeEarSignature(ring);
  const continuity = computeEarContinuity(ring);
  const orientation = computeEarOrientation(ring);
  const foresight  = computeEarForesight(earTone, orientation);

  return {
    earTone, identity, signature, continuity, orientation, foresight,
    isCalibrated: ring.length >= MIN_EAR_SAMPLES,
    isActive: true,
  };
}
