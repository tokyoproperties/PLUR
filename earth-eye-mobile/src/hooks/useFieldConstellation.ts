/**
 * hooks/useFieldConstellation.ts -- Arc 26
 *
 * Ring-native: reads moments directly + soul traits as hint.
 * No FieldMemory, no useFieldReweight dependency.
 */
import { useMemo } from 'react';
import { useAtlas } from '@/atlas/useAtlas';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { evaluateFieldConstellation, type FieldConstellation, type ConstellationSoulHint } from '@/atlas/fieldConstellation';

export type { FieldConstellation, ConstellationArchetype, ConstellationTone } from '@/atlas/fieldConstellation';

export function useFieldConstellation(): FieldConstellation {
  const atlas = useAtlas();
  const soul  = useFieldSoul();

  const soulHint: ConstellationSoulHint = useMemo(() => ({
    rootMovement:  soul.traits.rootMovement,
    rootTone:      soul.traits.rootTone,
    isEstablished: soul.isEstablished,
  }), [soul.traits, soul.isEstablished]);

  return useMemo(
    () => evaluateFieldConstellation(atlas.moments, soulHint),
    [atlas.moments.length, soulHint]
  );
}
