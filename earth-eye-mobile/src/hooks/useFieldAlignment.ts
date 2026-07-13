/**
 * hooks/useFieldAlignment.ts -- Arc 19
 *
 * React hook wrapping the field alignment engine.
 * Combines season, field window quality, mode, memory, and soul
 * into a single alignment read.
 */
import { useMemo } from 'react';
import { useSeason } from '@/hooks/useSeason';
import { useSeasonalFieldWindow } from '@/hooks/useSeasonalFieldWindow';
import { useSymbolicMode } from '@/contexts/mode-context';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { evaluateFieldAlignment, type FieldAlignment } from '@/atlas/fieldAlignment';

export type { FieldAlignment, AlignmentState, AlignmentMode } from '@/atlas/fieldAlignment';

export function useFieldAlignment(): FieldAlignment {
  const { season, solarWindow } = useSeason();
  const fieldWindow = useSeasonalFieldWindow();
  const { mode } = useSymbolicMode();
  const memory = useFieldMemory();
  const soul   = useFieldSoul();

  return useMemo(
    () => evaluateFieldAlignment(
      fieldWindow.quality,
      solarWindow,
      season,
      mode,
      memory,
      soul
    ),
    [fieldWindow.quality, solarWindow, season, mode, memory, soul]
  );
}
