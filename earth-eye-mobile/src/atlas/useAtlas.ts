/**
 * useAtlas.ts
 *
 * The Field Atlas hook — collects Field Moments from the unified
 * environmental state and stores them in a ring buffer.
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The internal version accepts deps as direct arguments.
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
import type { UseSensorsResult } from '@/hooks/useSensors';
import type { UseLocationResult } from '@/hooks/useLocation';
import type { HybridState } from '@/hybrid/hybrid-engine';
import type { CorridorState } from '@/corridor/corridor-engine';
import type { EcosystemState } from '@/ecosystem/ecosystem-engine';
import type { EmergencyState } from '@/emergency/state';
import type { SuitState } from '@/suit/types';
import type { YardStripPoint } from '@/hooks/useYardStrip';
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

// Internal — called by FieldDataProvider with deps passed directly
export function useAtlasInternal(args: {
  sensors: UseSensorsResult;
  location: UseLocationResult;
  hybrid: HybridState;
  corridor: CorridorState;
  ecosystem: EcosystemState;
  emergency: EmergencyState;
  suit: SuitState;
}): AtlasResult {
  const { sensors, location, hybrid, corridor, ecosystem, emergency, suit } = args;
  const { snapshot } = sensors;

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
      location: location.location,
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
