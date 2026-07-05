/**
 * useCorridor.ts
 *
 * Wraps the corridor engine with real data from existing hooks:
 * - useLocation() → user GPS (may be null)
 * - useCorridors() → 74 active trails from production DB
 * - useYardStrip() → home yard coordinates
 * - useSensors() → live sensor snapshot
 * - useSymbolicMode() → PLUR/LOVE mode
 * - evaluateLiteMode / evaluateYardMode → mode evaluations
 *
 * Returns a memoized CorridorState that updates as any input changes.
 */

import { useMemo } from 'react';

import { evaluateCorridor, type CorridorState } from '@/corridor/corridor-engine';
import { useSymbolicMode } from '@/contexts/mode-context';
import { useCorridors } from '@/hooks/useCorridors';
import { useLocation } from '@/hooks/useLocation';
import { useSensors } from '@/hooks/useSensors';
import { useYardStrip } from '@/hooks/useYardStrip';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

export type { CorridorState } from '@/corridor/corridor-engine';

export function useCorridor(): CorridorState {
  const { trails } = useCorridors();
  const yard = useYardStrip();
  const { snapshot } = useSensors();
  const { location } = useLocation();

  const lite = evaluateLiteMode(snapshot);
  const yardEval = evaluateYardMode(snapshot);

  return useMemo(
    () =>
      evaluateCorridor({
        userLat: location?.latitude ?? null,
        userLng: location?.longitude ?? null,
        trails,
        yard,
        snapshot,
        lite,
        yardEval,
      }),
    [location, trails, yard, snapshot, lite, yardEval]
  );
}
