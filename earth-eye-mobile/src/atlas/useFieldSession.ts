/**
 * useFieldSession.ts
 *
 * Wraps the session evaluator with the existing Atlas moment ring.
 * Returns the current/most recent session's summary, or null before
 * any moments have been captured yet.
 */

import { useMemo } from 'react';

import { getCurrentSession, summarizeSession, type FieldSessionSummary } from '@/atlas/fieldSession';
import { useAtlas } from '@/atlas/useAtlas';

export type { FieldSession, FieldSessionSummary, CorridorStability } from '@/atlas/fieldSession';

export function useFieldSession(): FieldSessionSummary | null {
  const atlas = useAtlas();

  return useMemo(() => {
    const session = getCurrentSession(atlas.moments);
    return session ? summarizeSession(session) : null;
  }, [atlas.moments]);
}
