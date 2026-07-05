/**
 * useEcosystem.ts
 *
 * Wraps the ecosystem engine with real data from existing hooks:
 * - useHybrid() → unified field state
 * - useCorridor() → corridor state (proximity, tone)
 * - useSensors() → phone sensor snapshot (fallback for suit devices)
 * - evaluateYardMode() → yard mode evaluation
 * - useSuitDevices() → suit device readings (mock for now)
 *
 * Returns a memoized EcosystemState.
 */

import { useMemo } from 'react';

import { evaluateEcosystem, type EcosystemState } from '@/ecosystem/ecosystem-engine';
import { useCorridor } from '@/corridor/useCorridor';
import { useHybrid } from '@/hybrid/useHybrid';
import { useSensors } from '@/hooks/useSensors';
import { useSuitDevices } from '@/suit/useSuitDevices';
import { evaluateYardMode } from '@/modes/yard';

export type { EcosystemState } from '@/ecosystem/ecosystem-engine';
export type { InvitedSpecies } from '@/ecosystem/ecosystem-engine';

export function useEcosystem(): EcosystemState {
  const hybrid = useHybrid();
  const corridor = useCorridor();
  const { snapshot } = useSensors();
  const suit = useSuitDevices();
  const yard = evaluateYardMode(snapshot);

  return useMemo(
    () => evaluateEcosystem({ hybrid, corridor, snapshot, yard, suit }),
    [hybrid, corridor, snapshot, yard, suit]
  );
}
