/**
 * useHybrid.ts
 *
 * Wraps the hybrid engine with real data from existing hooks:
 * - useSensors() → live sensor snapshot
 * - useCorridor() → corridor state (already fuses location + trails + yard)
 * - useSymbolicMode() → PLUR/LOVE mode
 * - evaluateLiteMode / evaluateYardMode → mode evaluations
 *
 * Returns a memoized HybridState — the "one sentence summary" of
 * the world around you.
 */

import { useMemo } from 'react';

import type { HybridState } from '@/hybrid/hybrid-engine';
import { evaluateHybrid } from '@/hybrid/hybrid-engine';
import { useCorridor } from '@/corridor/useCorridor';
import { useSymbolicMode } from '@/contexts/mode-context';
import { useSensors } from '@/hooks/useSensors';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

export type { HybridState } from '@/hybrid/hybrid-engine';

export function useHybrid(): HybridState {
  const { snapshot } = useSensors();
  const corridor = useCorridor();
  const { mode } = useSymbolicMode();

  const lite = evaluateLiteMode(snapshot);
  const yard = evaluateYardMode(snapshot);

  return useMemo(
    () => evaluateHybrid({ snapshot, corridor, mode, lite, yard }),
    [snapshot, corridor, mode, lite, yard]
  );
}
