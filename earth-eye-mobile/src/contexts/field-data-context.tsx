/**
 * contexts/field-data-context.tsx
 *
 * Global provider for the 4 state-bearing hooks.
 *
 * PERFORMANCE NOTES:
 * - Context values are memoized so consumers only re-render when
 *   the underlying data actually changes, not on every provider render.
 * - AtlasContext is the critical one: it only changes when the ring
 *   buffer updates (new moment captured). This prevents the deep
 *   derived hook chain (useFieldMemory → useFieldContinuity →
 *   useFieldMythology → useFieldLore → useFieldSpirit → useFieldSoul)
 *   from re-rendering on sensor ticks.
 * - SensorsContext changes every ~2s (motion) — only hooks that
 *   directly use sensor data (useHybrid, useCorridor, useEcosystem)
 *   re-render. The deep chain is insulated by the stable AtlasContext.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { UseSensorsResult } from '@/hooks/useSensors';
import type { UseCorridorsResult } from '@/hooks/useCorridors';
import type { UseLocationResult } from '@/hooks/useLocation';
import type { AtlasResult } from '@/atlas/useAtlas';

// Contexts
export const SensorsContext = createContext<UseSensorsResult | null>(null);
export const CorridorsContext = createContext<UseCorridorsResult | null>(null);
export const LocationContext = createContext<UseLocationResult | null>(null);
export const AtlasContext = createContext<AtlasResult | null>(null);

// Provider — instantiates each hook once via the internal versions
import { useSensorsInternal } from '@/hooks/useSensors';
import { useCorridorsInternal } from '@/hooks/useCorridors';
import { useLocationInternal } from '@/hooks/useLocation';
import { useAtlasInternal } from '@/atlas/useAtlas';

export function FieldDataProvider({ children }: { children: ReactNode }) {
  const sensors = useSensorsInternal();
  const corridors = useCorridorsInternal();
  const location = useLocationInternal();
  const atlas = useAtlasInternal();

  // Memoize each context value so the reference is stable
  // unless the underlying data actually changed.
  //
  // sensors: changes every ~2s (motion) — consumers that use
  //   sensor data will re-render, but the deep atlas chain won't
  //   because it depends on AtlasContext, not SensorsContext.
  const sensorsValue = useMemo(
    () => sensors,
    [sensors.light, sensors.motion, sensors.sound, sensors.snapshot],
  );

  // corridors: stable after initial fetch — only changes when
  //   trails array, loading state, or error changes
  const corridorsValue = useMemo(
    () => corridors,
    [corridors.trails, corridors.isLoading, corridors.error],
  );

  // location: changes on GPS update (~10s interval)
  const locationValue = useMemo(
    () => location,
    [location.location, location.permissionStatus, location.isLoading],
  );

  // atlas: THE CRITICAL ONE — only changes when ring buffer updates
  //   (new moment captured, at most every 5 minutes). This insulates
  //   the deep derived hook chain from sensor ticks.
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

  return (
    <SensorsContext.Provider value={sensorsValue}>
      <CorridorsContext.Provider value={corridorsValue}>
        <LocationContext.Provider value={locationValue}>
          <AtlasContext.Provider value={atlasValue}>
            {children}
          </AtlasContext.Provider>
        </LocationContext.Provider>
      </CorridorsContext.Provider>
    </SensorsContext.Provider>
  );
}
