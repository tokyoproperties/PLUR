/**
 * contexts/field-data-context.tsx
 *
 * Global provider for ALL state-bearing hooks.
 * Context objects live in field-data-contexts.ts (no cycles).
 * This file imports contexts + internal hooks and wires them together.
 */

import { useMemo, type ReactNode } from 'react';

// Contexts (from split file — no circular deps)
import {
  SensorsContext,
  CorridorsContext,
  LocationContext,
  AtlasContext,
  HybridContext,
  CorridorContext,
  EcosystemContext,
  EmergencyContext,
  SuitContext,
} from '@/contexts/field-data-contexts';

// Internal hooks (state-bearing, called once here)
import { useSensorsInternal } from '@/hooks/useSensors';
import { useCorridorsInternal } from '@/hooks/useCorridors';
import { useLocationInternal } from '@/hooks/useLocation';
import { useCorridorInternal } from '@/corridor/useCorridor';
import { useHybridInternal } from '@/hybrid/useHybrid';
import { useEcosystemInternal } from '@/ecosystem/useEcosystem';
import { useEmergencyInternal } from '@/emergency/useEmergency';
import { useSuitDevicesInternal } from '@/suit/useSuitDevices';
import { useAtlasInternal } from '@/atlas/useAtlas';
import { useYardStrip } from '@/hooks/useYardStrip';

// Re-export contexts for backwards compatibility
export {
  SensorsContext,
  CorridorsContext,
  LocationContext,
  AtlasContext,
  HybridContext,
  CorridorContext,
  EcosystemContext,
  EmergencyContext,
  SuitContext,
} from '@/contexts/field-data-contexts';

export function FieldDataProvider({ children }: { children: ReactNode }) {
  // 1. Base hooks — raw data sources
  const sensors = useSensorsInternal();
  const corridors = useCorridorsInternal();
  const location = useLocationInternal();
  const yard = useYardStrip();

  // 2. Derived hooks — receive base values as direct arguments
  const corridor = useCorridorInternal({ corridors, location, sensors, yard });
  const hybrid = useHybridInternal({ sensors, corridor });
  const suit = useSuitDevicesInternal();
  const ecosystem = useEcosystemInternal({ sensors, hybrid, corridor, suit });
  const emergency = useEmergencyInternal({ sensors, hybrid });

  // 3. Atlas — depends on all derived state
  const atlas = useAtlasInternal({ sensors, location, hybrid, corridor, ecosystem, emergency, suit });

  // 4. Memoize context values
  const sensorsValue = useMemo(
    () => sensors,
    [sensors.light, sensors.motion, sensors.sound, sensors.barometer, sensors.snapshot],
  );

  const corridorsValue = useMemo(
    () => corridors,
    [corridors.trails, corridors.isLoading, corridors.error],
  );

  const locationValue = useMemo(
    () => location,
    // confidence must be included — it changes on the staleness ticker
    // even when location/permissionStatus/isLoading haven't, and this
    // memo is what actually crosses the context boundary to consumers.
    [location.location, location.confidence, location.permissionStatus, location.isLoading],
  );

  const atlasValue = useMemo(
    () => ({
      moments: atlas.moments,
      summary: atlas.summary,
      latest: atlas.latest,
      totalMoments: atlas.totalMoments,
      isHydrated: atlas.isHydrated,
    }),
    [atlas.moments, atlas.summary, atlas.isHydrated],
  );

  const corridorValue = useMemo(() => corridor, [corridor]);
  const hybridValue = useMemo(() => hybrid, [hybrid]);
  const ecosystemValue = useMemo(() => ecosystem, [ecosystem]);
  const emergencyValue = useMemo(() => emergency, [emergency]);
  const suitValue = useMemo(() => suit, [suit]);

  return (
    <SensorsContext.Provider value={sensorsValue}>
      <CorridorsContext.Provider value={corridorsValue}>
        <LocationContext.Provider value={locationValue}>
          <HybridContext.Provider value={hybridValue}>
            <CorridorContext.Provider value={corridorValue}>
              <EcosystemContext.Provider value={ecosystemValue}>
                <EmergencyContext.Provider value={emergencyValue}>
                  <SuitContext.Provider value={suitValue}>
                    <AtlasContext.Provider value={atlasValue}>
                      {children}
                    </AtlasContext.Provider>
                  </SuitContext.Provider>
                </EmergencyContext.Provider>
              </EcosystemContext.Provider>
            </CorridorContext.Provider>
          </HybridContext.Provider>
        </LocationContext.Provider>
      </CorridorsContext.Provider>
    </SensorsContext.Provider>
  );
}
