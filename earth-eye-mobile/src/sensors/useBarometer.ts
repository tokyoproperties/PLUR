/**
 * useBarometer.ts
 * Arc 61: EARTHNOSE -- barometric pressure watcher.
 *
 * Wraps expo-sensors Barometer. Pressure is returned in hPa (hectopascals).
 * Standard sea-level pressure is ~1013 hPa.
 *
 * Hardware availability varies by device -- many Android phones have
 * barometers, some don't. This hook degrades gracefully and reports
 * isAvailable: false rather than throwing when hardware is absent.
 *
 * Requires: expo-sensors (already installed, v57)
 * Pattern: mirrors useAmbientLight.ts exactly.
 */

import { Barometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

export interface BarometerReading {
  /** Raw pressure in hPa. Null until first sample arrives. */
  pressure: number | null;
  /** False on platforms/devices without a barometer. */
  isAvailable: boolean;
  /** True once at least one reading has been received. */
  isReady: boolean;
  /** Timestamp (ms) of the most recent reading. */
  lastUpdated: number | null;
}

export interface UseBarometerOptions {
  /** Sensor update interval in ms. Defaults to 2000ms (pressure changes slowly). */
  updateInterval?: number;
  /** If false, the sensor subscription is not started. Defaults to true. */
  enabled?: boolean;
}

const DEFAULT_OPTIONS: Required<UseBarometerOptions> = {
  updateInterval: 2000,
  enabled: true,
};

export function useBarometer(
  options: UseBarometerOptions = {}
): BarometerReading {
  const { updateInterval, enabled } = { ...DEFAULT_OPTIONS, ...options };

  const [reading, setReading] = useState<BarometerReading>({
    pressure: null,
    isAvailable: false,
    isReady: false,
    lastUpdated: null,
  });

  const subscriptionRef = useRef<ReturnType<typeof Barometer.addListener> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    Barometer.isAvailableAsync()
      .then((available) => {
        if (!mounted) return;

        if (!available) {
          setReading((prev) => ({ ...prev, isAvailable: false, isReady: true }));
          return;
        }

        Barometer.setUpdateInterval(updateInterval);

        subscriptionRef.current = Barometer.addListener(({ pressure }) => {
          if (!mounted) return;
          setReading({
            pressure,
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
