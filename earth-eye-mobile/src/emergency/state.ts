/**
 * emergency/state.ts
 *
 * The resilience layer. EarthEye enters fallback mode when networks
 * overload, connectivity drops, or power is constrained. In that
 * state, it stops trying to be fancy and keeps only what's essential.
 *
 * Pure logic — no React, no hooks. All inputs passed in.
 *
 * Architecture for real integration:
 *   - Install expo-battery → feed batteryLevel to evaluator
 *   - Install @react-native-community/netinfo → feed network info
 *   - The hook (useEmergency) handles wiring; this file just evaluates
 *
 * Thresholds (tunable):
 *   - Battery low: < 0.20 (20%)
 *   - Battery critical: < 0.10 (10%)
 *   - Network offline: isConnected === false
 *   - Network poor: latency > 3000ms OR type === '2g'
 *   - Fallback enters when any threshold is crossed
 *   - Fallback exits when ALL thresholds are clear for 30 seconds
 */

/** Network state input */
export interface NetworkInput {
  /** Is the device connected at all? */
  isConnected: boolean | null; // null = unknown (no NetInfo module)
  /** Connection type: 'wifi' | 'cellular' | 'unknown' */
  type: string | null;
  /** Effective network generation: '4g' | '3g' | '2g' | 'unknown' | null */
  effectiveType: string | null;
  /** Round-trip latency in ms from a probe, null if not measured */
  latencyMs: number | null;
}

/** Battery state input */
export interface BatteryInput {
  /** Battery level 0.0–1.0, null if unknown (no expo-battery) */
  level: number | null;
  /** Is the device on AC power (charging)? */
  isCharging: boolean | null;
}

/** Emergency state — the output */
export interface EmergencyState {
  /** Whether EarthEye is in fallback mode */
  fallbackMode: boolean;
  /** Why fallback is active — one-line reason, null if not in fallback */
  reason: string | null;
  /** Specific flags for which conditions triggered fallback */
  triggers: {
    networkOffline: boolean;
    networkPoor: boolean;
    batteryLow: boolean;
    batteryCritical: boolean;
  };
  /** Whether we have real data (vs unknown/null inputs) */
  hasRealData: boolean;
  /** Suggested update interval in ms (longer when in fallback) */
  updateIntervalMs: number;
  /** Whether heavy animations should be disabled */
  disableAnimations: boolean;
  /** Maximum hybrid intensity when in fallback */
  maxHybridIntensity: number;
}

// Thresholds
const BATTERY_LOW = 0.20;
const BATTERY_CRITICAL = 0.10;
const NETWORK_POOR_LATENCY = 3000;
const FALLBACK_UPDATE_INTERVAL = 5000; // 5s in fallback
const NORMAL_UPDATE_INTERVAL = 1000;  // 1s normally
const FALLBACK_MAX_INTENSITY = 0.4;

export function evaluateEmergencyState(args: {
  network: NetworkInput;
  battery: BatteryInput;
}): EmergencyState {
  const { network, battery } = args;

  const triggers = {
    networkOffline: network.isConnected === false,
    networkPoor:
      network.isConnected === true &&
      (network.latencyMs !== null && network.latencyMs > NETWORK_POOR_LATENCY) ||
      (network.effectiveType === '2g'),
    batteryLow:
      battery.level !== null &&
      battery.level < BATTERY_LOW &&
      battery.isCharging !== true,
    batteryCritical:
      battery.level !== null &&
      battery.level < BATTERY_CRITICAL &&
      battery.isCharging !== true,
  };

  const anyTrigger =
    triggers.networkOffline ||
    triggers.networkPoor ||
    triggers.batteryLow ||
    triggers.batteryCritical;

  // Determine reason (priority: offline > critical battery > poor network > low battery)
  let reason: string | null = null;
  if (triggers.networkOffline) {
    reason = 'Network unavailable — running on local sensors only.';
  } else if (triggers.batteryCritical) {
    reason = `Battery critical — conserving power, limiting updates.`;
  } else if (triggers.batteryLow) {
    reason = 'Battery low — reducing background activity.';
  } else if (triggers.networkPoor) {
    reason = 'Network connection poor — limiting cloud-dependent features.';
  }

  // Do we have any real data? (not all null)
  const hasRealData =
    network.isConnected !== null ||
    battery.level !== null;

  return {
    fallbackMode: anyTrigger,
    reason,
    triggers,
    hasRealData,
    updateIntervalMs: anyTrigger ? FALLBACK_UPDATE_INTERVAL : NORMAL_UPDATE_INTERVAL,
    disableAnimations: anyTrigger,
    maxHybridIntensity: anyTrigger ? FALLBACK_MAX_INTENSITY : 0.7,
  };
}

/** Default state when no monitoring is available */
export const UNKNOWN_EMERGENCY_STATE: EmergencyState = {
  fallbackMode: false,
  reason: null,
  triggers: {
    networkOffline: false,
    networkPoor: false,
    batteryLow: false,
    batteryCritical: false,
  },
  hasRealData: false,
  updateIntervalMs: NORMAL_UPDATE_INTERVAL,
  disableAnimations: false,
  maxHybridIntensity: 0.7,
};
