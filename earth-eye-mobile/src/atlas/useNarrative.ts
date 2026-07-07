/**
 * useNarrative.ts
 *
 * Wraps the pure narrative translator with live engine state.
 * Reads Hybrid/Corridor/Ecosystem straight from their existing
 * context hooks (no new state, no re-derivation) plus the Seasonal
 * and Session layers already built in Missions 5-6.
 */

import { useMemo } from 'react';

import { buildNarrative, type NarrativeLines } from '@/atlas/narrative';
import { useHybrid } from '@/hybrid/useHybrid';
import { useCorridor } from '@/corridor/useCorridor';
import { useEcosystem } from '@/ecosystem/useEcosystem';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { useFieldSession } from '@/atlas/useFieldSession';
import { useSpeciesArrival } from '@/ecosystem/useSpeciesArrival';

export type { NarrativeLines } from '@/atlas/narrative';

export function useNarrative(): NarrativeLines {
  const hybrid = useHybrid();
  const corridor = useCorridor();
  const ecosystem = useEcosystem();
  const seasonal = useSeasonalProfile();
  const arrivals = useSpeciesArrival();
  const session = useFieldSession();

  return useMemo(
    () => buildNarrative({ hybrid, corridor, ecosystem, seasonal, arrivals, session }),
    [hybrid, corridor, ecosystem, seasonal, arrivals, session]
  );
}
