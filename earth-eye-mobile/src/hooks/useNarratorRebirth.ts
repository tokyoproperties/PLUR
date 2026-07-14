/**
 * useNarratorRebirth.ts
 * Arc 53: REBIRTH -- controlled reset of the narrator's identity.
 *
 * Clears:
 *   - Resonance profile (AsyncStorage)
 *   - Echo refs (passed in as a RebirthTarget)
 *   - FirstRenderMode flag (one render only -- auto-clears after)
 *
 * Does NOT clear:
 *   - The ring / field moments
 *   - Species detections / lineage / continuity / signature
 *   - Symbolic mode (PLUR/LOVE)
 *   - Any atlas or sensor state
 *
 * Rebirth is:
 *   - Local (device-only)
 *   - Explicit (user-initiated only)
 *   - Reversible (profile relearns from zero; ring is untouched)
 *   - Safe (ref resets happen synchronously before next render)
 *
 * Usage:
 *   const rebirth = useNarratorRebirth(echoRefs, resonance);
 *   rebirth.trigger()          -- wipe narrator, enter FirstRenderMode
 *   rebirth.isFirstRender      -- true on the one render immediately after reset
 *   rebirth.hasPendingRebirth  -- true while AsyncStorage clear is in flight
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MutableRefObject, useCallback, useRef, useState } from 'react';
import type { ResonanceHandle } from './useResonance';
import { THREAD_NEUTRAL, type NarratorThreadState } from '@/atlas/narratorThread';

const RESONANCE_PROFILE_KEY      = 'earthEye.resonance.profile';
const RESONANCE_INTERACTION_KEY  = 'earthEye.resonance.interactions';

// All echo refs that rebirth must zero out
export interface EchoRefs {
  essenceRef:    MutableRefObject<string | null>;
  oriVecRef:     MutableRefObject<string | null>;
  toneRef:       MutableRefObject<string | null>;
  clarityRef:    MutableRefObject<number>;
  thresholdRef:  MutableRefObject<number>;
  visibleSetRef: MutableRefObject<string>;
  // Arc 32 delta refs (also narrator state, not field state)
  archetypeRef:  MutableRefObject<string | null>;
  driftRef:      MutableRefObject<string | null>;
  forecastRef:   MutableRefObject<string | null>;
}

export interface RebirthHandle {
  /** Call once from a settings button. Synchronous ref wipe + async storage clear. */
  trigger:           () => void;
  /** True only during the single render immediately after trigger(). Auto-resets. */
  isFirstRender:     boolean;
  /** True while the AsyncStorage clear is still in flight. */
  hasPendingRebirth: boolean;
}

export function useNarratorRebirth(
  echoRefs:  EchoRefs,
  resonance: ResonanceHandle,
  threadRef?: MutableRefObject<NarratorThreadState>,
): RebirthHandle {
  const [isFirstRender,     setIsFirstRender]     = useState(false);
  const [hasPendingRebirth, setHasPendingRebirth] = useState(false);
  const firstRenderConsumedRef = useRef(false);

  // After the post-reset render completes, clear the FirstRenderMode flag.
  // Called from SeasonalFieldCard after the card has used the flag.
  // (Exposed implicitly -- card calls rebirth.consumeFirstRender() once.)
  const consumeFirstRender = useCallback(() => {
    if (!firstRenderConsumedRef.current) {
      firstRenderConsumedRef.current = true;
      setIsFirstRender(false);
    }
  }, []);

  const trigger = useCallback(() => {
    // 1. Reset echo refs synchronously (before next render)
    echoRefs.essenceRef.current    = null;
    echoRefs.oriVecRef.current     = null;
    echoRefs.toneRef.current       = null;
    echoRefs.clarityRef.current    = 0.70;   // neutral default
    echoRefs.thresholdRef.current  = 0.55;   // neutral default
    echoRefs.visibleSetRef.current = '';
    echoRefs.archetypeRef.current  = null;
    echoRefs.driftRef.current      = null;
    echoRefs.forecastRef.current   = null;

    // 2. Reset resonance profile synchronously via its own reset()
    resonance.reset();

    // 2b. Arc 56: reset narrator thread to neutral
    if (threadRef) {
      threadRef.current = { ...THREAD_NEUTRAL };
    }

    // 3. Enter FirstRenderMode
    firstRenderConsumedRef.current = false;
    setIsFirstRender(true);
    setHasPendingRebirth(true);

    // 4. Async storage clear (belt-and-suspenders -- resonance.reset() already does this)
    AsyncStorage.multiRemove([RESONANCE_PROFILE_KEY, RESONANCE_INTERACTION_KEY])
      .catch(() => {})
      .finally(() => setHasPendingRebirth(false));
  }, [echoRefs, resonance]);

  return {
    trigger,
    isFirstRender,
    hasPendingRebirth,
    // Internal -- exposed on object so SeasonalFieldCard can call it
    // without a separate prop drill. TypeScript: cast at call site.
    _consumeFirstRender: consumeFirstRender,
  } as RebirthHandle & { _consumeFirstRender: () => void };
}
