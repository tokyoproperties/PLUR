/**
 * useSpeciesArrival.ts
 *
 * Wraps the species arrival evaluator with all existing data:
 * - Seasonal phase (Phase XII)
 * - Corridor drift (Phase XIII)
 * - Sensor snapshot (Phase III)
 * - Coastal proximity from corridor (Phase V)
 *
 * Returns a memoized ArrivalSummary.
 */

import { useMemo } from 'react';

import { evaluateSpeciesArrival, type ArrivalSummary } from '@/ecosystem/speciesArrival';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { useCorridorDrift } from '@/corridor/useCorridorDrift';
import { useSensors } from '@/hooks/useSensors';
import { useCorridor } from '@/corridor/useCorridor';

export type { ArrivalSummary, SpeciesArrival, ArrivalLikelihood } from '@/ecosystem/speciesArrival';

export function useSpeciesArrival(): ArrivalSummary {
  const seasonal = useSeasonalProfile();
  const drift = useCorridorDrift();
  const { snapshot } = useSensors();
  const corridor = useCorridor();

  // Detect coastal proximity from nearest trail name
  const nearCoastal = useMemo(() => {
    const name = corridor.nearestTrailName?.toLowerCase() ?? '';
    return name.includes('beach') || name.includes('cove') || name.includes('coast') ||
      name.includes('bluff') || name.includes('harbor') || name.includes('pier') ||
      name.includes('dana point') || name.includes('crystal cove') ||
      name.includes('laguna') || name.includes('aliso creek beach');
  }, [corridor.nearestTrailName]);

  return useMemo(
    () => evaluateSpeciesArrival({
      season: seasonal.phase,
      drift,
      snapshot,
      nearCoastal,
      now: new Date(),
    }),
    [seasonal.phase, drift, snapshot.lux, snapshot.motionMagnitude, snapshot.soundRelativeDb, nearCoastal]
  );
}
