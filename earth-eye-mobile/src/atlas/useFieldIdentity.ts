/**
 * useFieldIdentity.ts
 *
 * Wraps the Field Identity evaluator with the atlas ring buffer.
 * Returns a memoized FieldIdentity derived from accumulated moments.
 *
 * The identity grows as the atlas grows — with fewer than 3 moments,
 * the field is "still revealing itself."
 */

import { useMemo } from 'react';

import { evaluateFieldIdentity, type FieldIdentity } from '@/atlas/fieldIdentity';
import { useAtlas } from '@/atlas/useAtlas';

export type { FieldIdentity } from '@/atlas/fieldIdentity';

export function useFieldIdentity(): FieldIdentity {
  const atlas = useAtlas();
  return useMemo(() => evaluateFieldIdentity(atlas.moments), [atlas.moments]);
}
