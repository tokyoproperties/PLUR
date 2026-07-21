/**
 * fieldFoot.ts
 * Arc 63: EARTHFOOT -- mobility field engine.
 *
 * The foot layer interprets movement as an environmental field. It reads
 * from motion (accelerometer), pedometer (step count), and GPS (speed,
 * heading) -- all already wired -- and derives a mobility state.
 *
 * WHAT THIS IS:
 *   A composition layer that reads from existing sensor outputs.
 *   motion band (still/forming/active) + step cadence + GPS speed/heading.
 *   No new sensors. No new subscriptions.
 *
 * FIVE LAYERS (all pure functions):
 *   footIdentity     categorical movement regime (still/walking/running/drifting)
 *   footContinuity   0-1 stability of movement (1 = perfectly stable)
 *   footDrift        -1..+1 signed slope (+=accelerating, -=decelerating)
 *   footOrientation   heading stability (stable/shifting/wandering)
 *   footForesight    short-term movement prediction
 *
 * All pure functions. No React. No hooks. No AsyncStorage.
 */

// -- Types --------------------------------------------------------------------

export type FootIdentity =
  | 'still'       // no movement, no steps
  | 'standing'    // minor motion, no steps (holding phone, fidgeting)
  | 'walking'     // steps detected, moderate cadence
  | 'running'     // steps detected, high cadence
  | 'drifting'    // slow GPS movement without steps (vehicle, bike)
  | 'unknown';

export type FootOrientationType =
  | 'stable heading'
  | 'shifting heading'
  | 'wandering'
  | 'unknown';

export type FootForecastType =
  | 'accelerating'
  | 'settling'
  | 'slowing'
  | 'holding'
  | 'shifting'
  | 'unknown';

export interface FootState {
  identity:       FootIdentity;
  continuity:     number;              // 0-1: movement stability
  drift:          number;             // -1..+1: signed slope
  orientation:    FootOrientationType;
  foresight:      FootForecastType;
  speed:          number | null;       // GPS speed in m/s
  heading:        number | null;       // GPS heading in degrees
  cadence:        number;              // steps per minute
  isCalibrated:   boolean;
  isActive:       boolean;
}

// -- Inputs type (mirrors existing sensor fields) -----------------------------
// MotionBand from thresholds.ts: 'still' | 'forming' | 'active'

import type { MotionBand } from '@/utils/thresholds';

// -- Helpers ------------------------------------------------------------------

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// -- Foot Identity ------------------------------------------------------------
// Derives movement type from motion band + step state + GPS speed.
// Priority: GPS speed for vehicle detection, then steps for walk/run,
// then motion band for still/standing distinction.

export function computeFootIdentity(
  motionBand:   MotionBand,
  isWalking:    boolean,
  cadence:      number,
  gpsSpeed:     number | null,
): FootIdentity {
  // GPS speed > 5 m/s (18 km/h) with no steps = vehicle drift
  if (gpsSpeed !== null && gpsSpeed > 5 && !isWalking) {
    return 'drifting';
  }

  // Walking state: steps detected
  if (isWalking) {
    // High cadence (> 120 spm) = running
    if (cadence > 120) return 'running';
    return 'walking';
  }

  // No steps: classify by motion band
  if (motionBand === 'still') return 'still';
  if (motionBand === 'forming') return 'standing';
  // Active motion without steps could be deliberate non-walking movement
  if (motionBand === 'active' && gpsSpeed !== null && gpsSpeed > 0.5) return 'drifting';
  if (motionBand === 'active') return 'standing';

  return 'unknown';
}

// -- Foot Continuity ----------------------------------------------------------
// Movement stability. Derived from how consistent the motion signals are.
// A person walking steadily has high continuity; someone fidgeting has low.

export function computeFootContinuity(
  motionConfidence: string,   // 'high' | 'medium' | 'low' | 'uncertain'
  cadence:          number,
  gpsSpeed:         number | null,
): number {
  // Motion confidence is the primary signal
  const confScore = motionConfidence === 'high' ? 0.85
    : motionConfidence === 'medium' ? 0.65
    : motionConfidence === 'low' ? 0.40
    : 0.30; // uncertain

  // GPS speed stability: if speed is available and very low, movement is
  // inherently stable (either truly still or very slow). If speed is high,
  // continuity depends on whether it's steady (we can't measure speed
  // variance from a single reading, so we give a moderate score).
  const speedScore = gpsSpeed !== null
    ? (gpsSpeed < 0.5 ? 0.90 : 0.60)  // slow = stable, fast = moderate
    : 0.50;

  // Cadence consistency: zero cadence (not walking) is stable.
  // Non-zero cadence contributes based on whether it's in a natural range.
  const cadenceScore = cadence === 0 ? 0.85
    : (cadence >= 80 && cadence <= 130 ? 0.80 : 0.55);  // natural walking range = stable

  return clamp01(confScore * 0.45 + speedScore * 0.30 + cadenceScore * 0.25);
}

// -- Foot Drift ---------------------------------------------------------------
// Signed slope of movement intensity.
// Derived from changes in motion magnitude and cadence.
// Since we don't have a ring of motion magnitudes (that's in useMotion's
// internal window), we use the motion band transitions as a proxy:
//   still -> forming -> active = positive drift (accelerating)
//   active -> forming -> still = negative drift (decelerating)

export function computeFootDrift(
  motionBand:    MotionBand,
  cadence:       number,
  prevCadence:   number,   // cadence from previous computation
  gpsSpeed:      number | null,
): number {
  // Cadence delta is the most reliable signal
  const cadenceDelta = cadence - prevCadence;
  // Normalize: 10 spm change per computation = full scale
  const cadenceSlope = clamp(cadenceDelta / 10, -1, 1);

  // Motion band contributes: active = +0.3, forming = +0.1, still = -0.1
  const bandBias = motionBand === 'active' ? 0.30
    : motionBand === 'forming' ? 0.10
    : -0.10;

  // GPS speed trend: if speed > 1 m/s, slight positive bias
  const speedBias = gpsSpeed !== null && gpsSpeed > 1 ? 0.15 : 0;

  // Blend: cadence slope (60%) + band bias (25%) + speed bias (15%)
  return clamp(cadenceSlope * 0.60 + bandBias * 0.25 + speedBias * 0.15, -1, 1);
}

// -- Foot Orientation ---------------------------------------------------------
// Heading stability. We only have a single heading reading, so we derive
// orientation from the GPS heading value and identity.

export function computeFootOrientation(
  identity:     FootIdentity,
  gpsHeading:   number | null,
  gpsSpeed:     number | null,
): FootOrientationType {
  if (identity === 'unknown') return 'unknown';

  // No heading available
  if (gpsHeading === null) return 'unknown';

  // If not moving, heading is meaningless
  if (identity === 'still' || (gpsSpeed !== null && gpsSpeed < 0.5)) {
    return 'unknown';
  }

  // Drifting (vehicle) tends to have stable heading
  if (identity === 'drifting') return 'stable heading';

  // Walking/running: heading is moderately stable
  if (identity === 'walking' || identity === 'running') return 'stable heading';

  // Standing with slight movement: heading could be shifting
  if (identity === 'standing') return 'shifting heading';

  return 'unknown';
}

// -- Foot Foresight -----------------------------------------------------------
// Predict movement change from identity + drift + orientation.

export function computeFootForesight(
  identity:     FootIdentity,
  drift:        number,
  continuity:   number,
  orientation:  FootOrientationType,
): FootForecastType {
  if (Math.abs(drift) < 0.08) {
    // If heading is shifting, that's a different kind of change
    if (orientation === 'shifting heading' || orientation === 'wandering') return 'shifting';
    return 'holding';
  }

  // Suppress foresight if continuity is very low (chaotic movement)
  if (continuity < 0.30) return 'holding';

  if (drift > 0.08) {
    // Accelerating
    if (identity === 'still' || identity === 'standing') return 'accelerating';
    return 'accelerating';
  }
  // drift < -0.08: decelerating
  if (identity === 'running' || identity === 'walking') return 'slowing';
  if (identity === 'drifting') return 'settling';
  return 'settling';
}

// -- Full foot state composer -------------------------------------------------

export function computeFootState(
  motionBand:       MotionBand,
  motionConfidence: string,
  isWalking:        boolean,
  cadence:          number,
  prevCadence:      number,
  gpsSpeed:         number | null,
  gpsHeading:       number | null,
  isActive:         boolean,
): FootState {
  const neutral: FootState = {
    identity: 'unknown', continuity: 0.5, drift: 0,
    orientation: 'unknown', foresight: 'unknown',
    speed: null, heading: null, cadence: 0,
    isCalibrated: false, isActive: false,
  };

  if (!isActive) return neutral;

  const identity    = computeFootIdentity(motionBand, isWalking, cadence, gpsSpeed);
  const continuity  = computeFootContinuity(motionConfidence, cadence, gpsSpeed);
  const drift       = computeFootDrift(motionBand, cadence, prevCadence, gpsSpeed);
  const orientation = computeFootOrientation(identity, gpsHeading, gpsSpeed);
  const foresight   = computeFootForesight(identity, drift, continuity, orientation);

  return {
    identity, continuity, drift, orientation, foresight,
    speed: gpsSpeed,
    heading: gpsHeading,
    cadence,
    // Calibrated when we have at least motion + step signals
    isCalibrated: motionBand !== undefined,
    isActive: true,
  };
}
