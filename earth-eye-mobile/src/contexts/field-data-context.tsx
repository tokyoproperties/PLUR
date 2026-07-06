/**
 * contexts/field-data-context.tsx
 *
 * Global provider for ALL state-bearing hooks.
 *
 * ARCHITECTURE:
 * - Base hooks (sensors, corridors, location) instantiated first
 * - Derived hooks (corridor, hybrid, ecosystem, emergency, suit) 
 *   computed next, receiving deps as direct arguments
 * - Atlas computed last, receiving all derived state
 * - Everything wrapped in memoized context providers
 * - Screens read from context — zero duplicate hook instances
 *
 * PERFORMANCE:
 * - Only the provider re-computes on sensor ticks (~2s)
 * - Screens that don't use sensor-derived data don't re-render
 * - AtlasContext only changes when ring buffer updates (~5 min)
 * - With lazy:true + freezeOnBlur, only the active screen's
 *   components render. Inactive screens are frozen.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';

// Types
import type { UseSensorsResult } from '@/hooks/useSensors';
import type { UseCorridorsResult } from '@/hooks/useCorridors';
import type { UseLocationResult } from '@/hooks/useLocation';
import type { AtlasResult } from '@/atlas/useAtlas';
import type { HybridState } from '@/hybrid/hybrid-engine';
import type { CorridorState } from '@/corridor/corridor-engine';
import type { EcosystemState } from '@/ecosystem/ecosystem-engine';
import type { EmergencyState } from '@/emergency/state';
import type { SuitState } from '@/suit/types';

// Contexts
export const SensorsContext = createContext<UseSensorsResult | null>(null);
export const CorridorsContext = createContext<UseCorridorsResult | null>(null);
export const LocationContext = createContext<UseLocationResult | null>(null);
export const AtlasContext = createContext<AtlasResult | null>(null);
export const HybridContext = createContext<HybridState | null>(null);
export const CorridorContext = createContext<CorridorState | null>(null);
export const EcosystemContext = createContext<EcosystemState | null>(null);
export const EmergencyContext = createContext<EmergencyState | null>(null);
export const SuitContext = createContext<SuitState | null>(null);

// Internal hooks
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

export function FieldDataProvider({ children }: { children: ReactNode }) {
  // 1. Base hooks — raw data sources (no context deps)
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

  // 4. Memoize context values — reference only changes when data changes
  const sensorsValue = useMemo(
    () => sensors,
    [sensors.light, sensors.motion, sensors.sound, sensors.snapshot],
  );

  const corridorsValue = useMemo(
    () => corridors,
    [corridors.trails, corridors.isLoading, corridors.error],
  );

  const locationValue = useMemo(
    () => location,
    [location.location, location.permissionStatus, location.isLoading],
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

  // Derived values — internal hooks already use useMemo, so stable references
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
