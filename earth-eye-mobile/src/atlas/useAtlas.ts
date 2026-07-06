/**
 * useAtlas.ts
 *
 * The Field Atlas hook — collects Field Moments from the unified
 * environmental state and stores them in a ring buffer.
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The FieldDataProvider instantiates the internal version once.
 * All consumers read from context, eliminating ~10 duplicate ring
 * buffer instances, each with its own AsyncStorage hydration,
 * sensor subscriptions, and trail fetch.
 *
 * Persistence:
 * - Ring buffer is saved to AsyncStorage on every capture
 * - Hydrated from AsyncStorage on mount
 */

import { useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ATLAS_RING_SIZE,
  addToRing,
  captureFieldMoment,
  shouldCaptureMoment,
  summarizeAtlas,
  type AtlasSummary,
  type FieldMoment,
} from '@/atlas/fieldMoment';
import { AtlasContext } from '@/contexts/field-data-context';
import { useCorridor } from '@/corridor/useCorridor';
import { useEcosystem } from '@/ecosystem/useEcosystem';
import { useEmergency } from '@/emergency/useEmergency';
import { useHybrid } from '@/hybrid/useHybrid';
import { useLocation } from '@/hooks/useLocation';
import { useSensors } from '@/hooks/useSensors';
import { useSuitDevices } from '@/suit/useSuitDevices';
import { useYardStrip } from '@/hooks/useYardStrip';
import { evaluateYardMode } from '@/modes/yard';

export type { AtlasSummary, FieldMoment } from '@/atlas/fieldMoment';

export type AtlasResult = {
  moments: FieldMoment[];
  summary: AtlasSummary;
  latest: FieldMoment | null;
  totalMoments: number;
  isHydrated: boolean;
};

const STORAGE_KEY = 'earthEye.atlas.ring';

// Internal — only called by FieldDataProvider
export function useAtlasInternal(): AtlasResult {
  const hybrid = useHybrid();
  const corridor = useCorridor();
  const ecosystem = useEcosystem();
  const emergency = useEmergency();
  const suit = useSuitDevices();
  const { snapshot } = useSensors();
  const { location } = useLocation();

  const yard = useYardStrip();
  const yardEval = evaluateYardMode(snapshot);
  const fireworkWindow = yardEval.isFireworkWindow;

  const [ring, setRing] = useState<FieldMoment[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const lastMomentRef = useRef<FieldMoment | null>(null);
  const lastCaptureTimeRef = useRef<number>(0);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          try {
            const parsed: FieldMoment[] = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setRing(parsed);
              lastMomentRef.current = parsed[parsed.length - 1];
              lastCaptureTimeRef.current = parsed[parsed.length - 1].timestamp;
            }
          } catch {
            // Corrupt data — start fresh
          }
        }
        setIsHydrated(true);
      })
      .catch(() => {
        setIsHydrated(true);
      });
  }, []);

  const persistRing = useCallback((next: FieldMoment[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const now = Date.now();
    const shouldCapture = shouldCaptureMoment(lastMomentRef.current, {
      fieldState: hybrid.fieldState,
      proximity: corridor.proximity,
      inFallback: emergency.fallbackMode,
      fireworkWindow,
      now,
      lastCaptureTime: lastCaptureTimeRef.current,
    });

    if (!shouldCapture) return;

    const moment = captureFieldMoment({
      hybrid,
      corridor,
      ecosystem,
      emergency,
      suit,
      snapshot,
      location,
      fireworkWindow,
      now: new Date(now),
    });

    setRing((prev) => {
      const next = addToRing(prev, moment, ATLAS_RING_SIZE);
      persistRing(next);
      return next;
    });
    lastMomentRef.current = moment;
    lastCaptureTimeRef.current = now;
  }, [hybrid, corridor, ecosystem, emergency, suit, snapshot, location, fireworkWindow, isHydrated, persistRing]);

  const summary = useMemo(() => summarizeAtlas(ring), [ring]);

  return {
    moments: ring,
    summary,
    latest: summary.latest,
    totalMoments: ring.length,
    isHydrated,
  };
}

// Consumer — reads from context
export function useAtlas(): AtlasResult {
  const ctx = useContext(AtlasContext);
  if (!ctx) throw new Error('useAtlas must be used within FieldDataProvider');
  return ctx;
}
