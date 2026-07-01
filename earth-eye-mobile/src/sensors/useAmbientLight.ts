/**
 * useAmbientLight.ts
 * Species-safe ambient light (lux) watcher.
 *
 * Wraps expo-sensors LightSensor. Note: LightSensor hardware access is
 * Android-only at the OS level — on iOS/web this hook degrades gracefully
 * and reports isAvailable: false rather than throwing.
 *
 * Requires: expo-sensors (added to package.json dependencies)
 */

import { LightSensor } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { classifyLux, type LuxBand } from '@/utils/thresholds';

export interface AmbientLightReading {
  /** Raw illuminance in lux. Null until first sample arrives. */
  lux: number | null;
  /** Classified band derived from LUX_THRESHOLDS. */
  band: LuxBand | null;
  /** False on platforms/devices without a light sensor. */
  isAvailable: boolean;
  /** True once at least one reading has been received. */
  isReady: boolean;
  /** Timestamp (ms) of the most recent reading. */
  lastUpdated: number | null;
}

export interface UseAmbientLightOptions {
  /** Sensor update interval in ms. Defaults to 1000ms (species-safe polling, not aggressive). */
  updateInterval?: number;
  /** If false, the sensor subscription is not started. Defaults to true. */
  enabled?: boolean;
}

const DEFAULT_OPTIONS: Required<UseAmbientLightOptions> = {
  updateInterval: 1000,
  enabled: true,
};

export function useAmbientLight(
  options: UseAmbientLightOptions = {}
): AmbientLightReading {
  const { updateInterval, enabled } = { ...DEFAULT_OPTIONS, ...options };

  const [reading, setReading] = useState<AmbientLightReading>({
    lux: null,
    band: null,
    isAvailable: false,
    isReady: false,
    lastUpdated: null,
  });

  const subscriptionRef = useRef<ReturnType<typeof LightSensor.addListener> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    LightSensor.isAvailableAsync()
      .then((available) => {
        if (!mounted) return;

        if (!available) {
          setReading((prev) => ({ ...prev, isAvailable: false, isReady: true }));
          return;
        }

        LightSensor.setUpdateInterval(updateInterval);

        subscriptionRef.current = LightSensor.addListener(({ illuminance }) => {
          if (!mounted) return;
          setReading({
            lux: illuminance,
            band: classifyLux(illuminance),
            isAvailable: true,
            isReady: true,
            lastUpdated: Date.now(),
          });
        });
      })
      .catch(() => {
        if (!mounted) return;
        setReading((prev) => ({ ...prev, isAvailable: false, isReady: true }));
      });

    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [enabled, updateInterval]);

  return reading;
}
