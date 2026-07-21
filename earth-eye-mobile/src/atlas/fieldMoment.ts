/**
 * fieldMoment.ts
 * Arc 65: EARTHTHREAD++ -- moment identity derivation.
 *
 * Moment Identity is the temporal "state" of the environment at a given
 * moment, derived from the smoothed cross-field drift and continuity
 * values stored in the narrator thread.
 *
 * DESIGN INVARIANT: This module reads from NarratorThreadState (which is
 * pure numeric smoothing) and derives a categorical identity. It does
 * NOT modify the thread. It does NOT call any engine. It is a pure
 * projection of the thread's numeric state into a naturalist vocabulary.
 *
 * The thread carries the memory. This module names the memory.
 *
 * All pure functions. No React. No hooks. No side effects.
 */

import type { NarratorThreadState } from '@/atlas/narratorThread';

// -- Types --------------------------------------------------------------------

export type MomentIdentity =
  | 'brightening'   // sky is opening, light increasing
  | 'dimming'       // sky is closing, light decreasing
  | 'settling'      // load is falling, environment calming
  | 'softening'     // comfort is improving, thermal stress easing
  | 'rising'        // load is climbing, environment demanding
  | 'quiet'         // nothing is changing, stable calm
  | 'turning'       // movement direction shifting, path changing
  | 'stable'        // high continuity across all fields, locked-in calm
  | 'unknown';

export interface MomentState {
  identity:       MomentIdentity;
  isCalibrated:   boolean;
  isActive:        boolean;
}

// -- Moment Identity Derivation -----------------------------------------------
// Priority order mirrors the narrator suppression stack:
//   pulse drift (load) > sky drift (light) > skin drift (comfort)
//   > foot drift (movement) > continuity (stability) > quiet (default)

export function computeMomentIdentity(
  thread: NarratorThreadState,
): MomentIdentity {
  if (!thread.isWarm) return 'unknown';

  const {
    threadPulseDrift: pulseDrift,
    threadSkyDrift:  skyDrift,
    threadSkinDrift:  skinDrift,
    threadFootDrift:  footDrift,
    threadPulseContinuity: pulseContinuity,
  } = thread;

  // Priority 1: Pulse drift (aggregate load direction)
  if (pulseDrift > 0.15) return 'rising';
  if (pulseDrift < -0.15) return 'settling';

  // Priority 2: Sky drift (light direction)
  if (skyDrift > 0.12) return 'brightening';
  if (skyDrift < -0.12) return 'dimming';

  // Priority 3: Skin drift (comfort direction)
  // Skin drift is a thermal load proxy; negative = cooling = softening
  if (skinDrift < -0.10) return 'softening';

  // Priority 4: Foot drift (movement direction)
  if (footDrift > 0.10) return 'turning';

  // Priority 5: High continuity = stable (locked-in calm)
  if (pulseContinuity > 0.85) return 'stable';

  // Default: quiet (nothing significant is happening)
  return 'quiet';
}

// -- Full moment state --------------------------------------------------------

export function computeMomentState(
  thread: NarratorThreadState,
): MomentState {
  if (!thread.isWarm) {
    return { identity: 'unknown', isCalibrated: false, isActive: false };
  }

  const identity = computeMomentIdentity(thread);

  return {
    identity,
    isCalibrated: thread.isWarm,
    isActive: true,
  };
}
