/**
 * useSuitDevices.ts
 *
 * Combined hook for all suit devices. Returns a SuitState with
 * readings from QuietBand, SoilBand, LightBand, and Field Tags.
 *
 * Currently returns mock/offline data — no hardware connected.
 * When real devices are added, replace the mock defaults with
 * adapter-driven state (BLE, USB-C, Wi-Fi, etc.).
 *
 * Architecture for real integration:
 *   1. Create an adapter per device type (e.g. src/suit/adapters/ble-quietband.ts)
 *   2. Adapter connects to hardware and writes readings to a store
 *   3. This hook reads from the store instead of mock constants
 *   4. Hybrid engine consumes suit readings as additional context
 *
 * The hook is designed so swapping mock → real is a one-file change.
 */

import { useMemo } from 'react';

import {
  MOCK_FIELD_TAGS,
  MOCK_LIGHTBAND,
  MOCK_QUIETBAND,
  MOCK_SOILBAND,
  type SuitState,
} from '@/suit/types';

export function useSuitDevices(): SuitState {
  return useMemo<SuitState>(() => {
    const quietBand = MOCK_QUIETBAND;
    const soilBand = MOCK_SOILBAND;
    const lightBand = MOCK_LIGHTBAND;
    const fieldTags = MOCK_FIELD_TAGS;

    const devices = [quietBand, soilBand, lightBand];
    const onlineCount = devices.filter(
      (d) => d.status === 'online'
    ).length;
    const totalConfigured = devices.length + fieldTags.length;

    // Summary for UI
    const parts: string[] = [];
    if (onlineCount === 0) {
      parts.push('No devices connected');
    } else {
      parts.push(`${onlineCount} online`);
    }

    if (soilBand.status === 'online' && soilBand.needsWater) {
      parts.push('yard moisture low');
    }
    if (quietBand.status === 'online' && !quietBand.isQuietZone) {
      parts.push('noise elevated');
    }
    if (lightBand.status === 'online' && lightBand.isShadeStable) {
      parts.push('shade stable');
    }

    return {
      quietBand,
      soilBand,
      lightBand,
      fieldTags,
      onlineCount,
      totalConfigured,
      summary: parts.join(' · ') || 'Awaiting devices',
    };
  }, []);
}
