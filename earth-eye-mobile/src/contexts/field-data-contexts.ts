/**
 * field-data-contexts.ts
 *
 * Context creation only — no hook imports, no circular dependencies.
 * The provider (field-data-context.tsx) imports these contexts and
 * the internal hooks. Consumer hooks import contexts from HERE,
* breaking the require cycle.
 */

import { createContext } from 'react';

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

export const SensorsContext = createContext<UseSensorsResult | null>(null);
export const CorridorsContext = createContext<UseCorridorsResult | null>(null);
export const LocationContext = createContext<UseLocationResult | null>(null);
export const AtlasContext = createContext<AtlasResult | null>(null);
export const HybridContext = createContext<HybridState | null>(null);
export const CorridorContext = createContext<CorridorState | null>(null);
export const EcosystemContext = createContext<EcosystemState | null>(null);
export const EmergencyContext = createContext<EmergencyState | null>(null);
export const SuitContext = createContext<SuitState | null>(null);
