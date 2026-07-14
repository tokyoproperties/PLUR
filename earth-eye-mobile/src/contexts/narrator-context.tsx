/**
 * narrator-context.tsx
 * Arc 54: COMPANION SETTINGS -- shared narrator state context.
 *
 * Lifts useResonance out of SeasonalFieldCard so that:
 *   - SeasonalFieldCard reads it (card rendering)
 *   - CompanionSettingsScreen reads + writes it (user controls)
 *   - useNarratorRebirth wires to it (reset path)
 *
 * NarratorProvider must sit inside FieldDataProvider in _layout.tsx.
 * It adds no sensors, no subscriptions -- just AsyncStorage-backed
 * resonance state and a fieldOnlyMode boolean.
 *
 * fieldOnlyMode: when true, SeasonalFieldCard disables the full
 * narrator stack (echo, reflection, anticipation, resonance, essence,
 * invitation) and renders identity/signature/lineage/strip only.
 * Stored in AsyncStorage so it survives app restarts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode, type MutableRefObject,
} from 'react';
import { useResonance } from '@/hooks/useResonance';
import type { ResonanceHandle } from '@/hooks/useResonance';
import { useNarratorRebirth } from '@/hooks/useNarratorRebirth';
import type { RebirthHandle, EchoRefs } from '@/hooks/useNarratorRebirth';
import {
  THREAD_NEUTRAL, advanceThread, blendWithThread,
  type NarratorThreadState,
} from '@/atlas/narratorThread';

const FIELD_ONLY_KEY = 'earthEye.narrator.fieldOnlyMode';
const SKY_MODE_KEY   = 'earthEye.narrator.skyMode';

/** Echo refs shared between SeasonalFieldCard and NarratorProvider. */
export interface NarratorEchoRefs {
  essenceRef:    MutableRefObject<string | null>;
  oriVecRef:     MutableRefObject<string | null>;
  toneRef:       MutableRefObject<string | null>;
  clarityRef:    MutableRefObject<number>;
  thresholdRef:  MutableRefObject<number>;
  visibleSetRef: MutableRefObject<string>;
  archetypeRef:  MutableRefObject<string | null>;
  driftRef:      MutableRefObject<string | null>;
  forecastRef:   MutableRefObject<string | null>;
}

interface NarratorContextValue {
  resonance:       ResonanceHandle;
  rebirth:         RebirthHandle;
  echoRefs:        NarratorEchoRefs;
  threadRef:       React.MutableRefObject<NarratorThreadState>;
  advanceThread:   typeof advanceThread;
  blendWithThread: typeof blendWithThread;
  fieldOnlyMode:   boolean;
  setFieldOnly:    (v: boolean) => void;
  skyModeEnabled:  boolean;
  setSkyMode:      (v: boolean) => void;
}

const NarratorContext = createContext<NarratorContextValue | null>(null);

export function NarratorProvider({ children }: { children: ReactNode }) {
  const resonance = useResonance();

  // Echo refs -- owned here so both SeasonalFieldCard (renderer) and
  // useNarratorRebirth (resetter) share the exact same ref objects.
  const echoRefs: NarratorEchoRefs = {
    essenceRef:    useRef<string | null>(null),
    oriVecRef:     useRef<string | null>(null),
    toneRef:       useRef<string | null>(null),
    clarityRef:    useRef<number>(0.70),
    thresholdRef:  useRef<number>(0.55),
    visibleSetRef: useRef<string>(''),
    archetypeRef:  useRef<string | null>(null),
    driftRef:      useRef<string | null>(null),
    forecastRef:   useRef<string | null>(null),
  };

  // Arc 56: narrator thread -- smoothed continuity across renders/screens.
  // Declared before rebirth so threadRef can be passed in.
  const threadRef = useRef<NarratorThreadState>({ ...THREAD_NEUTRAL });

  // Rebirth hook -- called unconditionally at provider level, never
  // inside a lazily-mounted route. Fixes Arc 53 rules-of-hooks violation.
  const rebirth = useNarratorRebirth(echoRefs as EchoRefs, resonance, threadRef);

  const [fieldOnlyMode,  setFieldOnlyMode]  = useState(false);
  const [skyModeEnabled, setSkyModeEnabled] = useState(false);

  // Hydrate both booleans from AsyncStorage
  useEffect(() => {
    AsyncStorage.multiGet([FIELD_ONLY_KEY, SKY_MODE_KEY]).then(pairs => {
      const map = Object.fromEntries(pairs);
      if (map[FIELD_ONLY_KEY] === 'true') setFieldOnlyMode(true);
      if (map[SKY_MODE_KEY]   === 'true') setSkyModeEnabled(true);
    });
  }, []);

  const setFieldOnly = useCallback((v: boolean) => {
    setFieldOnlyMode(v);
    AsyncStorage.setItem(FIELD_ONLY_KEY, v ? 'true' : 'false').catch(() => {});
  }, []);

  const setSkyMode = useCallback((v: boolean) => {
    setSkyModeEnabled(v);
    AsyncStorage.setItem(SKY_MODE_KEY, v ? 'true' : 'false').catch(() => {});
  }, []);

  return (
    <NarratorContext.Provider value={{
      resonance, rebirth, echoRefs, threadRef,
      advanceThread, blendWithThread,
      fieldOnlyMode, setFieldOnly,
      skyModeEnabled, setSkyMode,
    }}>
      {children}
    </NarratorContext.Provider>
  );
}

export function useNarrator(): NarratorContextValue {
  const ctx = useContext(NarratorContext);
  if (!ctx) throw new Error('useNarrator must be used inside NarratorProvider');
  return ctx;
}
