/**
 * hooks/useFieldPresence.ts -- Arc 20
 *
 * React hook wrapping the field presence engine.
 * Derives presence state from session recency, motion band,
 * and alignment -- all already available in the system.
 */
import { useMemo } from 'react';
import { useFieldSession } from '@/atlas/useFieldSession';
import { useAtlas } from '@/atlas/useAtlas';
import { useSensors } from '@/hooks/useSensors';
import { useFieldAlignment } from '@/hooks/useFieldAlignment';
import { evaluateFieldPresence, type FieldPresence } from '@/atlas/fieldPresence';

export type { FieldPresence, PresenceState, PresenceQuality } from '@/atlas/fieldPresence';

export function useFieldPresence(): FieldPresence {
  const session   = useFieldSession();
  const atlas     = useAtlas();
  const { snapshot } = useSensors();
  const alignment = useFieldAlignment();

  return useMemo(
    () => evaluateFieldPresence(
      session,
      Date.now(),
      snapshot.motionBand,
      alignment.state,
      atlas.totalMoments
    ),
    [session, snapshot.motionBand, alignment.state, atlas.totalMoments]
  );
}
