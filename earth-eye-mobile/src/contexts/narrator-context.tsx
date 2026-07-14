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

interface NarratorContextValue {
  resonance:     ResonanceHandle;
  fieldOnlyMode: boolean;
  setFieldOnly:  (v: boolean) => void;
}

const NarratorContext = createContext<NarratorContextValue | null>(null);

export function NarratorProvider({ children }: { children: ReactNode }) {
  const resonance = useResonance();

  const [fieldOnlyMode, setFieldOnlyMode] = useState(false);

  // Hydrate fieldOnlyMode from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(FIELD_ONLY_KEY).then(raw => {
      if (raw === 'true') setFieldOnlyMode(true);
    });
  }, []);

  const setFieldOnly = useCallback((v: boolean) => {
    setFieldOnlyMode(v);
    AsyncStorage.setItem(FIELD_ONLY_KEY, v ? 'true' : 'false').catch(() => {});
  }, []);

  return (
    <NarratorContext.Provider value={{ resonance, fieldOnlyMode, setFieldOnly }}>
      {children}
    </NarratorContext.Provider>
  );
}

export function useNarrator(): NarratorContextValue {
  const ctx = useContext(NarratorContext);
  if (!ctx) throw new Error('useNarrator must be used inside NarratorProvider');
  return ctx;
}
