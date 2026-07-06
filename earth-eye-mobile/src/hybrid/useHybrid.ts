/**
 * useHybrid.ts
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The internal version accepts deps as arguments (doesn't read context).
 */

import { useContext, useMemo } from 'react';

import { evaluateHybrid, type HybridState } from '@/hybrid/hybrid-engine';
import { HybridContext } from '@/contexts/field-data-context';
import { useSymbolicMode } from '@/contexts/mode-context';
import type { UseSensorsResult } from '@/hooks/useSensors';
import type { CorridorState } from '@/corridor/corridor-engine';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

export type { HybridState } from '@/hybrid/hybrid-engine';

// Internal — called by FieldDataProvider with deps passed directly
export function useHybridInternal(args: {
  sensors: UseSensorsResult;
  corridor: CorridorState;
}): HybridState {
  const { sensors, corridor } = args;
  const { snapshot } = sensors;
  const { mode } = useSymbolicMode();

  const lite = evaluateLiteMode(snapshot);
  const yard = evaluateYardMode(snapshot);

  return useMemo(
    () => evaluateHybrid({ snapshot, corridor, mode, lite, yard }),
    [snapshot, corridor, mode, lite, yard],
  );
}

// Consumer — reads from context
export function useHybrid(): HybridState {
  const ctx = useContext(HybridContext);
  if (!ctx) throw new Error('useHybrid must be used within FieldDataProvider');
  return ctx;
}
