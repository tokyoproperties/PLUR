/**
 * useEmergency.ts
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The internal version accepts deps as direct arguments.
 */

import { useContext, useMemo, useState } from 'react';

import {
  evaluateEmergencyState,
  type EmergencyState,
  type NetworkInput,
  type BatteryInput,
} from '@/emergency/state';
import { EmergencyContext } from '@/contexts/field-data-context';
import type { UseSensorsResult } from '@/hooks/useSensors';
import type { HybridState } from '@/hybrid/hybrid-engine';

export type { EmergencyState } from '@/emergency/state';

// Internal — called by FieldDataProvider with deps passed directly
export function useEmergencyInternal(args: {
  sensors: UseSensorsResult;
  hybrid: HybridState;
}): EmergencyState {
  const { sensors } = args;
  const { snapshot } = sensors;

  const [networkState] = useState<NetworkInput>({
    isConnected: true,
    type: 'unknown',
    effectiveType: 'unknown',
    latencyMs: null,
  });
  const [batteryState] = useState<BatteryInput>({
    level: null,
    isCharging: null,
  });

  return useMemo(
    () => evaluateEmergencyState({ network: networkState, battery: batteryState }),
    [networkState, batteryState],
  );
}

// Consumer — reads from context
export function useEmergency(): EmergencyState {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error('useEmergency must be used within FieldDataProvider');
  return ctx;
}
