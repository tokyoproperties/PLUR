/**
 * hooks/useFieldReweight.ts -- Arc 26
 *
 * Ring-native: reads moments directly + soul traits as hint.
 * No FieldMemory dependency.
 */
import { useMemo } from 'react';
import { useAtlas } from '@/atlas/useAtlas';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { evaluateFieldReweight, type FieldReweight, type SoulHint } from '@/atlas/fieldReweight';

export type { FieldReweight, ReweightSignal, ReweightEmphasis } from '@/atlas/fieldReweight';

export function useFieldReweight(): FieldReweight {
  const atlas = useAtlas();
  const soul  = useFieldSoul();

  const soulHint: SoulHint = useMemo(() => ({
    rootMovement:  soul.traits.rootMovement,
    rootTone:      soul.traits.rootTone,
    isRevealed:    soul.isRevealed,
    isEstablished: soul.isEstablished,
  }), [soul.traits, soul.isRevealed, soul.isEstablished]);

  return useMemo(
    () => evaluateFieldReweight(atlas.moments, soulHint),
    [atlas.moments.length, soulHint]
  );
}
