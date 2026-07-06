/**
 * useSuitDevices.ts
 *
 * PERFORMANCE: Split into internal (state-bearing) + consumer (context).
 * The internal version is called once by FieldDataProvider.
 */

import { useContext, useMemo } from 'react';

import {
  MOCK_FIELD_TAGS,
  MOCK_LIGHTBAND,
  MOCK_QUIETBAND,
  MOCK_SOILBAND,
  type SuitState,
} from '@/suit/types';
import { SuitContext } from '@/contexts/field-data-contexts';

// Internal — only called by FieldDataProvider
export function useSuitDevicesInternal(): SuitState {
  return useMemo<SuitState>(() => {
    const quietBand = MOCK_QUIETBAND;
    const soilBand = MOCK_SOILBAND;
    const lightBand = MOCK_LIGHTBAND;
    const fieldTags = MOCK_FIELD_TAGS;

    const devices = [quietBand, soilBand, lightBand];
    const onlineCount = devices.filter((d) => d.status === 'online').length;

    return {
      quietBand,
      soilBand,
      lightBand,
      fieldTags,
      onlineCount,
      totalConfigured: 4,
      summary: `${onlineCount}/4 devices online`,
    };
  }, []);
}

// Consumer — reads from context
export function useSuitDevices(): SuitState {
  const ctx = useContext(SuitContext);
  if (!ctx) throw new Error('useSuitDevices must be used within FieldDataProvider');
  return ctx;
}
