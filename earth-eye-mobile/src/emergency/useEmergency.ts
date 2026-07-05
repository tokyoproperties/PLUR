/**
 * useEmergency.ts
 *
 * Hook that monitors network + battery and returns an EmergencyState.
 *
 * Currently returns UNKNOWN state because expo-battery and
 * @react-native-community/netinfo are not installed (would require
 * a native rebuild). The architecture is ready — when those modules
 * are added, uncomment the import lines and this hook automatically
 * feeds real data to the evaluator.
 *
 * Install path (when ready for native rebuild):
 *   npx expo install expo-battery @react-native-community/netinfo
 *   Then uncomment the marked sections below.
 */

import { useMemo, useState, useEffect } from 'react';

import {
  UNKNOWN_EMERGENCY_STATE,
  evaluateEmergencyState,
  type EmergencyState,
  type NetworkInput,
  type BatteryInput,
} from '@/emergency/state';

export type { EmergencyState } from '@/emergency/state';

export function useEmergency(): EmergencyState {
  // --- Network monitoring (uncomment when @react-native-community/netinfo is installed) ---
  // import NetInfo from '@react-native-community/netinfo';
  // const [netInfo, setNetInfo] = useState<NetworkInput | null>(null);
  // useEffect(() => {
  //   const unsub = NetInfo.addEventListener((state) => {
  //     setNetInfo({
  //       isConnected: state.isConnected,
  //       type: state.type,
  //       effectiveType: (state.details as any)?.effectiveType ?? null,
  //       latencyMs: null, // not provided by NetInfo, needs custom probe
  //     });
  //   });
  //   return () => unsub();
  // }, []);

  // --- Battery monitoring (uncomment when expo-battery is installed) ---
  // import * as Battery from 'expo-battery';
  // const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  // const [isCharging, setIsCharging] = useState<boolean | null>(null);
  // useEffect(() => {
  //   Battery.getBatteryLevelAsync().then(setBatteryLevel);
  //   const levelSub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
  //     setBatteryLevel(batteryLevel);
  //   });
  //   const stateSub = Battery.addBatteryStateListener(({ batteryState }) => {
  //     setIsCharging(batteryState === Battery.BatteryState.CHARGING);
  //   });
  //   return () => {
  //     levelSub.remove();
  //     stateSub.remove();
  //   };
  // }, []);

  // Until native modules are installed, return unknown state.
  // The evaluator is still tested and ready — just no data flowing yet.
  const network: NetworkInput = {
    isConnected: null,
    type: null,
    effectiveType: null,
    latencyMs: null,
  };
  const battery: BatteryInput = {
    level: null,
    isCharging: null,
  };

  return useMemo(
    () => evaluateEmergencyState({ network, battery }),
    [network.isConnected, network.latencyMs, network.effectiveType, battery.level, battery.isCharging]
  );
}
