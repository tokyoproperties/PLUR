/**
 * useResonance.ts
 * Arc 52: RESONANCE -- local, device-only narrative style tuner.
 *
 * Builds a tiny StyleProfile from voluntary user interactions,
 * persisted to AsyncStorage under 'earthEye.resonance.profile'.
 * No telemetry. No cloud. No identity. Fully resettable.
 *
 * StyleProfile fields (all 0-1, default 0.5 = neutral):
 *   depthBias      0 = prefer compressed stack   1 = prefer full stack
 *   toneBias       0 = prefer calm language       1 = prefer bright language
 *   metaphorBias   0 = prefer literal phrasing    1 = prefer poetic phrasing
 *   historyBias    0 = prefer minimal history      1 = prefer full history
 *   invitationBias 0 = prefer gentle invitations   1 = prefer strong invitations
 *
 * Interaction signals that shift the profile:
 *   recordExpand()    user expanded the card (long-press) -> depthBias up
 *   recordCollapse()  user collapsed the card             -> depthBias down
 *   recordSimpler()   user tapped "simpler"               -> all biases toward 0
 *   recordDeeper()    user tapped "deeper/full journal"   -> all biases toward 1
 *   recordFavorite()  user favorited a field              -> toneBias up, metaphorBias up
 *   reset()           wipe profile, return to neutral
 *
 * Profile changes are written to AsyncStorage async (fire-and-forget).
 * The hook exposes the current profile synchronously from state.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'earthEye.resonance.profile';
const INTERACTION_KEY = 'earthEye.resonance.interactions';

// Number of interactions before Resonance considers itself calibrated
export const RESONANCE_CALIBRATION_COUNT = 8;

// Learning rate: how much each interaction shifts a bias value
const LEARN_RATE = 0.06;
// Inertia: how much of the prior bias survives each update (1 - LEARN_RATE = 0.94)
// This means ~12 interactions to move from neutral (0.5) to 0.9 in one direction.

export interface StyleProfile {
  depthBias:      number;
  toneBias:       number;
  metaphorBias:   number;
  historyBias:    number;
  invitationBias: number;
}

const NEUTRAL: StyleProfile = {
  depthBias:      0.5,
  toneBias:       0.5,
  metaphorBias:   0.5,
  historyBias:    0.5,
  invitationBias: 0.5,
};

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function lerp(current: number, target: number, rate: number): number {
  return clamp(current + (target - current) * rate);
}

function persistProfile(profile: StyleProfile): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => {});
}

function persistInteractionCount(count: number): void {
  AsyncStorage.setItem(INTERACTION_KEY, String(count)).catch(() => {});
}

export interface ResonanceHandle {
  profile:             StyleProfile;
  interactionCount:    number;
  isCalibrated:        boolean;
  recordExpand:        () => void;
  recordCollapse:      () => void;
  recordSimpler:       () => void;
  recordDeeper:        () => void;
  recordFavorite:      () => void;
  reset:               () => void;
}

export function useResonance(): ResonanceHandle {
  const [profile,          setProfile]          = useState<StyleProfile>(NEUTRAL);
  const [interactionCount, setInteractionCount] = useState(0);
  const loadedRef = useRef(false);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(INTERACTION_KEY),
    ]).then(([raw, countRaw]) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<StyleProfile>;
          setProfile({ ...NEUTRAL, ...parsed });
        } catch { /* ignore corrupt data */ }
      }
      if (countRaw) {
        const n = parseInt(countRaw, 10);
        if (!isNaN(n)) setInteractionCount(n);
      }
      loadedRef.current = true;
    });
  }, []);

  // Core update: shifts profile toward a target, increments interaction count
  const update = useCallback((delta: Partial<StyleProfile>) => {
    setProfile(prev => {
      const next: StyleProfile = {
        depthBias:      delta.depthBias      !== undefined ? lerp(prev.depthBias,      delta.depthBias,      LEARN_RATE) : prev.depthBias,
        toneBias:       delta.toneBias       !== undefined ? lerp(prev.toneBias,       delta.toneBias,       LEARN_RATE) : prev.toneBias,
        metaphorBias:   delta.metaphorBias   !== undefined ? lerp(prev.metaphorBias,   delta.metaphorBias,   LEARN_RATE) : prev.metaphorBias,
        historyBias:    delta.historyBias    !== undefined ? lerp(prev.historyBias,    delta.historyBias,    LEARN_RATE) : prev.historyBias,
        invitationBias: delta.invitationBias !== undefined ? lerp(prev.invitationBias, delta.invitationBias, LEARN_RATE) : prev.invitationBias,
      };
      persistProfile(next);
      return next;
    });
    setInteractionCount(prev => {
      const next = prev + 1;
      persistInteractionCount(next);
      return next;
    });
  }, []);

  // Named interaction signals
  const recordExpand = useCallback(() =>
    update({ depthBias: 1, historyBias: 1 }), [update]);

  const recordCollapse = useCallback(() =>
    update({ depthBias: 0, historyBias: 0 }), [update]);

  const recordSimpler = useCallback(() =>
    update({ depthBias: 0, toneBias: 0, metaphorBias: 0, historyBias: 0, invitationBias: 0 }), [update]);

  const recordDeeper = useCallback(() =>
    update({ depthBias: 1, toneBias: 1, metaphorBias: 1, historyBias: 1, invitationBias: 1 }), [update]);

  const recordFavorite = useCallback(() =>
    update({ toneBias: 1, metaphorBias: 1, invitationBias: 1 }), [update]);

  const reset = useCallback(() => {
    setProfile(NEUTRAL);
    setInteractionCount(0);
    AsyncStorage.multiRemove([STORAGE_KEY, INTERACTION_KEY]).catch(() => {});
  }, []);

  return {
    profile,
    interactionCount,
    isCalibrated: interactionCount >= RESONANCE_CALIBRATION_COUNT,
    recordExpand,
    recordCollapse,
    recordSimpler,
    recordDeeper,
    recordFavorite,
    reset,
  };
}
