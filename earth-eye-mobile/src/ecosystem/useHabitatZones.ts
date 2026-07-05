/**
 * useHabitatZones.ts
 *
 * Wraps the habitat evaluator with all existing data:
 * - Seasonal phase (Phase XII)
 * - Corridor drift (Phase XIII)
 * - Sensor snapshot (Phase III)
 * - Species arrival (Phase XIV)
 * - Corridor proximity (Phase V)
 */

import { useMemo } from 'react';

import { evaluateHabitatZones, type HabitatAssessment } from '@/ecosystem/habitatZones';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { useCorridorDrift } from '@/corridor/useCorridorDrift';
import { useSensors } from '@/hooks/useSensors';
import { useSpeciesArrival } from '@/ecosystem/useSpeciesArrival';
import { useCorridor } from '@/corridor/useCorridor';

export type { HabitatAssessment, HabitatZone, HabitatZoneType, HabitatConfidence } from '@/ecosystem/habitatZones';

export function useHabitatZones(): HabitatAssessment {
  const seasonal = useSeasonalProfile();
  const drift = useCorridorDrift();
  const { snapshot } = useSensors();
  const arrival = useSpeciesArrival();
  const corridor = useCorridor();

  // Determine proximity flags
  const inYard = corridor.proximity === 'in-yard' || corridor.proximity === 'near-yard';
  const nearTrail = corridor.proximity === 'near-trail';

  // Determine coastal proximity from trail name
  const nearCoastal = useMemo(() => {
    const name = corridor.nearestTrailName?.toLowerCase() ?? '';
    return name.includes('beach') || name.includes('cove') || name.includes('coast') ||
      name.includes('bluff') || name.includes('harbor') || name.includes('pier') ||
      name.includes('dana point') || name.includes('crystal cove') ||
      name.includes('laguna') || name.includes('aliso creek beach');
  }, [corridor.nearestTrailName]);

  return useMemo(
    () => evaluateHabitatZones({
      season: seasonal.phase,
      drift,
      snapshot,
      arrival,
      nearCoastal,
      inYard,
      nearTrail,
    }),
    [seasonal.phase, drift, snapshot.lux, snapshot.motionMagnitude, snapshot.soundRelativeDb, arrival, nearCoastal, inYard, nearTrail]
  );
}
