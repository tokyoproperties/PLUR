/**
 * hooks/useFieldInitiative.ts -- Arc 21
 *
 * React hook wrapping the field initiative engine.
 * Composes the full intelligence stack into a single initiative read.
 */
import { useMemo } from 'react';
import { useSeason } from '@/hooks/useSeason';
import { useSeasonalFieldWindow } from '@/hooks/useSeasonalFieldWindow';
import { useFieldAlignment } from '@/hooks/useFieldAlignment';
import { useFieldPresence } from '@/hooks/useFieldPresence';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useSymbolicMode } from '@/contexts/mode-context';
import { evaluateFieldInitiative, type FieldInitiative } from '@/atlas/fieldInitiative';

export type { FieldInitiative, InitiativeAction, InitiativeReason } from '@/atlas/fieldInitiative';

export function useFieldInitiative(): FieldInitiative {
  const { season }  = useSeason();
  const fieldWindow = useSeasonalFieldWindow();
  const alignment   = useFieldAlignment();
  const presence    = useFieldPresence();
  const memory      = useFieldMemory();
  const { mode }    = useSymbolicMode();

  return useMemo(
    () => evaluateFieldInitiative({
      quality:          fieldWindow.quality,
      alignment:        alignment.state,
      alignMode:        alignment.mode,
      presence:         presence.state,
      presenceQuality:  presence.quality,
      presenceStrength: presence.strength,
      memory,
      mode,
      season,
    }),
    [fieldWindow.quality, alignment, presence, memory, mode, season]
  );
}
