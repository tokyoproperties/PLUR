/**
 * contexts/field-data-context.tsx
 *
 * Global provider for the 4 state-bearing hooks that were being
 * duplicated through the hook dependency tree:
 *
 *   useSensors    — sensor subscriptions (expo-sensors)
 *   useCorridors  — trail data fetch
 *   useLocation   — GPS subscription (expo-location)
 *   useAtlas      — ring buffer state + hydration
 *
 * Before this provider, calling useFieldSoul() on Home cascaded
 * through useFieldSpirit → useFieldMythology → useFieldMemory →
 * useAtlas, with each useAtlas creating its own sensor subscriptions,
 * trail fetch, GPS subscription, and ring buffer state. This resulted
 * in ~10 useAtlas instances and ~150 total hook instances per render.
 *
 * Now: each hook is instantiated ONCE here, and consumed everywhere
 * via context. Derived hooks read from the shared instances automatically.
 */

import { createContext, useContext, type ReactNode } from 'react';

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

  return (
    <SensorsContext.Provider value={sensors}>
      <CorridorsContext.Provider value={corridors}>
        <LocationContext.Provider value={location}>
          <AtlasContext.Provider value={atlas}>
            {children}
          </AtlasContext.Provider>
        </LocationContext.Provider>
      </CorridorsContext.Provider>
    </SensorsContext.Provider>
  );
}
