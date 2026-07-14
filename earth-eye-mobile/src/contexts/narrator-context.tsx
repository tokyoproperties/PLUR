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
import {
  createContext, useCallback, useContext, useEffect, useState,
  type ReactNode,
} from 'react';
import { useResonance } from '@/hooks/useResonance';
import type { ResonanceHandle, StyleProfile } from '@/hooks/useResonance';

const FIELD_ONLY_KEY = 'earthEye.narrator.fieldOnlyMode';
const SKY_MODE_KEY   = 'earthEye.narrator.skyMode';

interface NarratorContextValue {
  resonance:       ResonanceHandle;
  fieldOnlyMode:   boolean;
  setFieldOnly:    (v: boolean) => void;
  skyModeEnabled:  boolean;
  setSkyMode:      (v: boolean) => void;
}

const NarratorContext = createContext<NarratorContextValue | null>(null);

export function NarratorProvider({ children }: { children: ReactNode }) {
  const resonance = useResonance();

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
      resonance, fieldOnlyMode, setFieldOnly,
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
