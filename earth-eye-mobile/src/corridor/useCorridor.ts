/**
 * useCorridor.ts
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The internal version accepts deps as arguments (doesn't read context).
 * The consumer version reads from CorridorContext.
 *
 * CALIBRATED July 6 2026 (Mission 2 — Corridor Engine Stability):
 * maintains the rolling distance window + hysteresis-flag refs that
 * corridor-engine.ts's pure evaluateCorridor() needs — mirroring how
 * useMotion.ts owns the cadence window while classifyMotion() stays a
 * pure function. Distance samples are windowed (not raw lat/lng)
 * because averaging a moving person's coordinates directly would be
 * physically misleading; averaging the DERIVED distance-to-yard over
 * a short window smooths out GPS jitter without that problem.
 */

import { useContext, useMemo, useRef } from 'react';

import {
  evaluateCorridor,
  haversineMeters,
  findNearestTrail,
  type CorridorProximityFlags,
  type CorridorState,
} from '@/corridor/corridor-engine';
import { CorridorContext } from '@/contexts/field-data-contexts';
import { useSymbolicMode } from '@/contexts/mode-context';
import type { UseCorridorsResult } from '@/hooks/useCorridors';
import type { UseLocationResult } from '@/hooks/useLocation';
import type { UseSensorsResult } from '@/hooks/useSensors';
import type { YardStripPoint } from '@/hooks/useYardStrip';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

export type { CorridorState } from '@/corridor/corridor-engine';

// Distance window — GPS fixes arrive far slower than accelerometer
// samples (every ~10s per useLocation's watchPositionAsync config, or
// less often while stationary), so this window is sized in seconds,
// not milliseconds, to actually span a few fixes.
const DISTANCE_WINDOW_MS = 45000;

interface DistanceSample {
  yardDist: number;
  trailDist: number | null;
  timestamp: number;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

const INITIAL_FLAGS: CorridorProximityFlags = { inYard: false, nearYard: false, nearTrail: false };

// Internal — called by FieldDataProvider with deps passed directly
export function useCorridorInternal(args: {
  corridors: UseCorridorsResult;
  location: UseLocationResult;
  sensors: UseSensorsResult;
  yard: YardStripPoint;
}): CorridorState {
  const { corridors, location, sensors, yard } = args;
  const { mode } = useSymbolicMode();

  const { trails } = corridors;
  const { snapshot } = sensors;
  const lite = evaluateLiteMode(snapshot);
  const yardEval = evaluateYardMode(snapshot);

  const userLat = location.location?.latitude ?? null;
  const userLng = location.location?.longitude ?? null;
  const locationConfidence = location.confidence;

  const windowRef = useRef<DistanceSample[]>([]);
  const prevFlagsRef = useRef<CorridorProximityFlags>(INITIAL_FLAGS);

  return useMemo(() => {
    if (userLat === null || userLng === null) {
      // No GPS lock — nothing to window, and hysteresis resets so we
      // don't carry a stale "inYard" flag across a lock gap.
      windowRef.current = [];
      prevFlagsRef.current = INITIAL_FLAGS;
      return evaluateCorridor({
        userLat,
        userLng,
        trails,
        yard,
        snapshot,
        lite,
        yardEval,
        locationConfidence,
      });
    }

    const yardDist = haversineMeters(userLat, userLng, yard.lat, yard.lng);
    const nearest = findNearestTrail(userLat, userLng, trails);
    const trailDist = nearest?.distance ?? null;

    const now = Date.now();
    windowRef.current.push({ yardDist, trailDist, timestamp: now });
    windowRef.current = windowRef.current.filter((s) => now - s.timestamp <= DISTANCE_WINDOW_MS);

    const yardSamples = windowRef.current.map((s) => s.yardDist);
    const trailSamples = windowRef.current
      .map((s) => s.trailDist)
      .filter((d): d is number => d !== null);

    const windowedYardDistance = mean(yardSamples);
    const windowedTrailDistance = trailSamples.length > 0 ? mean(trailSamples) : (trailDist ?? undefined);

    const state = evaluateCorridor({
      userLat,
      userLng,
      trails,
      yard,
      snapshot,
      lite,
      yardEval,
      locationConfidence,
      windowedYardDistance,
      windowedTrailDistance,
      yardDistanceSamples: yardSamples,
      prevFlags: prevFlagsRef.current,
    });

    prevFlagsRef.current = state.proximityFlags;
    return state;
  }, [userLat, userLng, trails, yard, snapshot, lite, yardEval, locationConfidence, mode]);
}

// Consumer — reads from context
export function useCorridor(): CorridorState {
  const ctx = useContext(CorridorContext);
  if (!ctx) throw new Error('useCorridor must be used within FieldDataProvider');
  return ctx;
}
