/**
 * useEcosystem.ts
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The internal version accepts deps as arguments (doesn't read context).
 */

import { useContext, useMemo } from 'react';

import { evaluateEcosystem, type EcosystemState } from '@/ecosystem/ecosystem-engine';
import { EcosystemContext } from '@/contexts/field-data-contexts';
import type { UseSensorsResult } from '@/hooks/useSensors';
import type { HybridState } from '@/hybrid/hybrid-engine';
import type { CorridorState } from '@/corridor/corridor-engine';
import type { SuitState } from '@/suit/types';
import { evaluateYardMode } from '@/modes/yard';

export type { EcosystemState } from '@/ecosystem/ecosystem-engine';

// Internal — called by FieldDataProvider with deps passed directly
export function useEcosystemInternal(args: {
  sensors: UseSensorsResult;
  hybrid: HybridState;
  corridor: CorridorState;
  suit: SuitState;
}): EcosystemState {
  const { sensors, hybrid, corridor, suit } = args;
  const { snapshot } = sensors;
  const yard = evaluateYardMode(snapshot);

  return useMemo(
    () => evaluateEcosystem({ hybrid, corridor, snapshot, yard, suit }),
    [hybrid, corridor, snapshot, yard, suit],
  );
}

// Consumer — reads from context
export function useEcosystem(): EcosystemState {
  const ctx = useContext(EcosystemContext);
  if (!ctx) throw new Error('useEcosystem must be used within FieldDataProvider');
  return ctx;
}
