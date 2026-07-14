/**
 * atlas/fieldReweightFeedback.ts -- Arc 29 (FEEDBACK)
 *
 * ReweightFeedback Engine.
 *
 * The first feedback arc. Applies a micro-nudge to reweight's
 * emphasis scores based on foresight + harmony coherence.
 *
 * Architecture position:
 *   ring -> reweight -> feedback(foresight, harmony) -> adjusted emphasis
 *
 * This is NOT a new layer in the stack. It is a post-processing step
 * applied inside useFieldReweight after evaluateFieldReweight runs.
 * The evaluator itself stays pure. The hook composes the nudge.
 *
 * Rules (sealed):
 *   1. Feedback only activates when harmony.agreement >= 0.60.
 *      Below that, foresight is noise -- do not apply.
 *   2. The nudge is 0.03 added to one signal's raw emphasis before
 *      re-normalization. This is small enough to never flip a strong
 *      dominant, but enough to break ties and reinforce near-winners.
 *   3. The nudge is applied to raw emphasis BEFORE normalize(), so
 *      normalization absorbs it proportionally across all signals.
 *      This means the dominant can only shift if the gap was already
 *      very small (< 0.03 after normalization = < ~0.18 raw).
 *   4. No new types exported. No new UI. Fully invisible.
 *   5. Arc 26 doctrine upheld: this function reads only foresight +
 *      harmony outputs. It does not read the ring.
 *
 * Feedback map (foresight -> which signal to nudge):
 *   opening    -> initiative  (field broadening = action-leaning)
 *   deepening  -> presence    (field stabilizing = attention-leaning)
 *   turning    -> branch      (field shifting = path-exploring)
 *   brightening -> alignment  (field brightening = cycle-responsive)
 *   cooling    -> season      (field cooling = ecological-calendar)
 *
 * Pure logic -- no React, no hooks.
 */

import type { ReweightEmphasis, ReweightSignal } from '@/atlas/fieldReweight';
import type { ForesightState } from '@/atlas/fieldForesight';

// ---- Constants -------------------------------------------------------

const NUDGE_AMOUNT         = 0.03;
const HARMONY_THRESHOLD    = 0.60;

// Foresight -> signal to nudge
const FEEDBACK_MAP: Record<ForesightState, ReweightSignal> = {
  opening:     'initiative',
  deepening:   'presence',
  turning:     'branch',
  brightening: 'alignment',
  cooling:     'season',
};

// ---- Feedback inputs (minimal -- no full engine outputs needed) ------

export interface FeedbackInputs {
  harmonyAgreement: number;      // from FieldHarmony.agreement
  foresightState:   ForesightState; // from FieldForesight.forecast
  foresightActive:  boolean;     // from FieldForesight.isActive
}

// ---- Main function ---------------------------------------------------

/**
 * Apply feedback nudge to raw emphasis scores.
 * Call this BEFORE normalize() in the reweight pipeline.
 * Returns the (possibly modified) emphasis object.
 * If feedback conditions aren't met, returns emphasis unchanged.
 */
export function applyReweightFeedback(
  raw:      ReweightEmphasis,
  feedback: FeedbackInputs,
): ReweightEmphasis {
  // Gate: only apply when harmony is coherent and foresight is active
  if (!feedback.foresightActive || feedback.harmonyAgreement < HARMONY_THRESHOLD) {
    return raw;
  }

  const target = FEEDBACK_MAP[feedback.foresightState];

  // Return a new object with the nudged signal
  return {
    ...raw,
    [target]: raw[target] + NUDGE_AMOUNT,
  };
}
