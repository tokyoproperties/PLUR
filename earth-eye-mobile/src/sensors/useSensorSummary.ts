/**
 * sensors/useSensorSummary.ts
 *
 * Wraps the sensor summary evaluator with live data from
 * existing hooks: sensors, seasonal profile, mode, atlas memory.
 *
 * Returns a memoized SensorSummaryResult.
 */

import { useMemo } from 'react';

import { deriveSensorSummary } from '@/sensors/sensorSummary';
import { useAtlas } from '@/atlas/useAtlas';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldContinuity } from '@/atlas/useFieldContinuity';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { useSymbolicMode } from '@/contexts/mode-context';
import { useSensors } from '@/hooks/useSensors';

export type { SensorSummaryResult } from '@/sensors/sensorSummary';

export function useSensorSummary() {
  const { snapshot } = useSensors();
  const { mode } = useSymbolicMode();
  const seasonal = useSeasonalProfile();
  const atlas = useAtlas();
  const memory = useFieldMemory();
  const continuity = useFieldContinuity();

  return useMemo(
    () =>
      deriveSensorSummary({
        snapshot,
        mode,
        seasonalPhase: seasonal.phase,
        seasonalLabel: seasonal.phaseLabel,
        patternStatus: seasonal.patternStatus,
        totalMoments: atlas.totalMoments,
        chapterCount: memory.chapters.length,
        continuityEstablished: continuity.isEstablished,
      }),
    [snapshot, mode, seasonal.phase, seasonal.patternStatus, atlas.totalMoments, memory.chapters.length, continuity.isEstablished],
  );
}
