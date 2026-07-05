/**
 * useAtlas.ts
 *
 * The Field Atlas hook — collects Field Moments from the unified
 * environmental state and stores them in a ring buffer.
 *
 * Uses every hook from Phases III–IX:
 * - useHybrid → unified field state
 * - useCorridor → spatial context
 * - useEcosystem → species context
 * - useEmergency → resilience context
 * - useSuitDevices → device context
 * - useSensors → sensor snapshot
 * - useLocation → GPS coordinates
 * - evaluateYardMode → firework window
 *
 * Capture logic:
 * - On field state change
 * - On proximity change
 * - On fallback change
 * - On firework window change
 * - Every 5 minutes as a baseline
 * - Ring buffer holds last 200 moments (no persistence yet)
 *
 * Returns the ring buffer + atlas summary.
 */

import { useEffect, useRef, useState, useMemo } from 'react';

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
  const lastMomentRef = useRef<FieldMoment | null>(null);
  const lastCaptureTimeRef = useRef<number>(0);

  // Capture check — runs on every render but only captures when needed
  useEffect(() => {
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

    setRing((prev) => addToRing(prev, moment, ATLAS_RING_SIZE));
    lastMomentRef.current = moment;
    lastCaptureTimeRef.current = now;
  }, [hybrid, corridor, ecosystem, emergency, suit, snapshot, location, fireworkWindow]);

  const summary = useMemo(() => summarizeAtlas(ring), [ring]);

  return {
    moments: ring,
    summary,
    latest: summary.latest,
    totalMoments: ring.length,
  };
}
