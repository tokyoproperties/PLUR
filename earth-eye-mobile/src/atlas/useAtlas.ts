/**
 * useAtlas.ts
 *
 * The Field Atlas hook — collects Field Moments from the unified
 * environmental state and stores them in a ring buffer.
 *
 * Persistence:
 * - Ring buffer is saved to AsyncStorage on every capture
 * - Hydrated from AsyncStorage on mount
 * - This allows the soul/spirit/memory/continuity engines to
 *   derive meaning across app restarts
 *
 * Uses every hook from Phases III–IX:
 * - useHybrid → unified field state
 * - useCorridor → spatial context
 * - useEcosystem → species context
 * - useEmergency → resilience context
 * - useSuitDevices → device context
 * - useSensors → sensor snapshot
 * - useLocation → GPS coordinates
 *
 * Capture logic:
 * - On field state change
 * - On proximity change
 * - On fallback change
 * - On firework window change
 * - Every 5 minutes as a baseline
 * - Ring buffer holds last 200 moments
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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

const STORAGE_KEY = 'earthEye.atlas.ring';

export function useAtlas() {
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
        // AsyncStorage error — start fresh
        setIsHydrated(true);
      });
  }, []);

  // Persist to AsyncStorage whenever ring changes
  const persistRing = useCallback((next: FieldMoment[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // Silent fail — persistence is best-effort
    });
  }, []);

  // Capture check — runs on every render but only captures when needed
  // Only after hydration to avoid overwriting stored data with a fresh capture
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
