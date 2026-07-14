/**
 * hooks/useFieldReweight.ts -- Arc 29
 *
 * Ring-native reweight + feedback nudge from foresight.
 *
 * Circular dependency resolution:
 *   foresight depends on reweight, so useFieldReweight cannot import
 *   useFieldForesight. Instead, a module-level feedback store holds the
 *   previous render's FeedbackInputs. setReweightFeedback() is called
 *   from useFieldForesight after each render (one-cycle lag).
 *
 * The lag is intentional and correct: the field reacts to where it was
 * heading, not a self-referential loop. The nudge (0.03) is small enough
 * that a one-cycle lag has no perceptible effect on user experience.
 */
import { useMemo } from 'react';
import { useAtlas } from '@/atlas/useAtlas';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { evaluateFieldReweight, type FieldReweight, type SoulHint } from '@/atlas/fieldReweight';
import { applyReweightFeedback, type FeedbackInputs } from '@/atlas/fieldReweightFeedback';

export type { FieldReweight, ReweightSignal, ReweightEmphasis } from '@/atlas/fieldReweight';
export type { FeedbackInputs } from '@/atlas/fieldReweightFeedback';

// ---- Module-level feedback store ------------------------------------
// One instance per JS module (effectively per app). Safe for this app's
// architecture where there is exactly one reweight consumer tree.

let _feedback: FeedbackInputs | null = null;
let _feedbackVersion = 0;

export function setReweightFeedback(inputs: FeedbackInputs | null): void {
  _feedback  = inputs;
  _feedbackVersion++;
}

// ---- Inline renormalize (avoids exporting private fieldReweight fns) -

function renormalize(raw: Record<string, number>): Record<string, number> {
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  if (total === 0) return raw;
  const f = 1 / total;
  const out: Record<string, number> = {};
  for (const k of Object.keys(raw)) out[k] = raw[k] * f;
  return out;
}

const TONE_SHIFTS: Record<string, string> = {
  alignment:  'Field leaning toward cycle and rhythm.',
  presence:   'Field centering your attention.',
  initiative: 'Field emphasizing movement and action.',
  branch:     'Field exploring multiple paths.',
  soul:       'Field deepening into long-term identity.',
  season:     'Field following the ecological calendar.',
};

const SIGNAL_MODE: Record<string, 'plur' | 'love'> = {
  alignment: 'plur', presence: 'love', initiative: 'plur',
  branch: 'plur', soul: 'love', season: 'plur',
};

// ---- Hook -----------------------------------------------------------

export function useFieldReweight(): FieldReweight {
  const atlas = useAtlas();
  const soul  = useFieldSoul();

  const soulHint: SoulHint = useMemo(() => ({
    rootMovement:  soul.traits.rootMovement,
    rootTone:      soul.traits.rootTone,
    isRevealed:    soul.isRevealed,
    isEstablished: soul.isEstablished,
  }), [soul.traits, soul.isRevealed, soul.isEstablished]);

  return useMemo(() => {
    const base = evaluateFieldReweight(atlas.moments, soulHint);
    if (!base.isMature || !_feedback) return base;

    // Apply nudge to emphasis then re-normalize
    const nudged = applyReweightFeedback(base.emphasis, _feedback);
    const norm   = renormalize(nudged as Record<string, number>);

    const emphasis = {
      alignment:  norm.alignment,
      presence:   norm.presence,
      initiative: norm.initiative,
      branch:     norm.branch,
      soul:       norm.soul,
      season:     norm.season,
    };

    // Dominant = highest emphasis key
    const dom = (Object.entries(emphasis) as [string, number][])
      .reduce((a, b) => b[1] > a[1] ? b : a)[0];

    return {
      ...base,
      emphasis,
      dominant:    dom as FieldReweight['dominant'],
      toneShift:   TONE_SHIFTS[dom] ?? base.toneShift,
      impliedMode: SIGNAL_MODE[dom] ?? base.impliedMode,
    };
    // _feedbackVersion ensures recompute when feedback updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atlas.moments.length, soulHint, _feedbackVersion]);
}
