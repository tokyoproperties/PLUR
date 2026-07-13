/**
 * hooks/useFieldBranch.ts -- Arc 22
 *
 * React hook wrapping the field branch engine.
 * Composes the full intelligence stack into a single branch read.
 */
import { useMemo } from 'react';
import { useSeason } from '@/hooks/useSeason';
import { useSeasonalFieldWindow } from '@/hooks/useSeasonalFieldWindow';
import { useFieldAlignment } from '@/hooks/useFieldAlignment';
import { useFieldPresence } from '@/hooks/useFieldPresence';
import { useFieldInitiative } from '@/hooks/useFieldInitiative';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { useFieldSession } from '@/atlas/useFieldSession';
import { useSymbolicMode } from '@/contexts/mode-context';
import { evaluateFieldBranch, type FieldBranch } from '@/atlas/fieldBranch';

export type { FieldBranch, BranchPath, BranchVariant } from '@/atlas/fieldBranch';

export function useFieldBranch(): FieldBranch {
  const { season }    = useSeason();
  const fieldWindow   = useSeasonalFieldWindow();
  const alignment     = useFieldAlignment();
  const presence      = useFieldPresence();
  const initiative    = useFieldInitiative();
  const memory        = useFieldMemory();
  const soul          = useFieldSoul();
  const session       = useFieldSession();
  const { mode }      = useSymbolicMode();

  return useMemo(
    () => evaluateFieldBranch({
      quality:            fieldWindow.quality,
      alignment:          alignment.state,
      alignMode:          alignment.mode,
      presence:           presence.state,
      initiative:         initiative.action,
      initiativeConf:     initiative.confidence,
      memory,
      soul,
      mode,
      season,
      sessionMomentCount: session?.momentCount ?? 0,
    }),
    [
      fieldWindow.quality, alignment, presence,
      initiative, memory, soul, mode, season, session,
    ]
  );
}
