/**
 * useCorridor.ts
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The internal version accepts deps as arguments (doesn't read context).
 * The consumer version reads from CorridorContext.
 */

import { useContext, useMemo } from 'react';

import { evaluateCorridor, type CorridorState } from '@/corridor/corridor-engine';
import { CorridorContext } from '@/contexts/field-data-context';
import { useSymbolicMode } from '@/contexts/mode-context';
import type { UseCorridorsResult } from '@/hooks/useCorridors';
import type { UseLocationResult } from '@/hooks/useLocation';
import type { UseSensorsResult } from '@/hooks/useSensors';
import type { YardStripPoint } from '@/hooks/useYardStrip';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

export type { CorridorState } from '@/corridor/corridor-engine';

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

  return useMemo(
    () =>
      evaluateCorridor({
        userLat,
        userLng,
        trails,
        yard,
        snapshot,
        lite,
        yardEval,
      }),
    [userLat, userLng, trails, yard, snapshot, lite, yardEval],
  );
}

// Consumer — reads from context
export function useCorridor(): CorridorState {
  const ctx = useContext(CorridorContext);
  if (!ctx) throw new Error('useCorridor must be used within FieldDataProvider');
  return ctx;
}
