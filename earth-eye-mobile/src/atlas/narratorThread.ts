/**
 * narratorThread.ts
 * Arc 56: THREAD -- narrator continuity across screens and renders.
 *
 * The narrator thread is a lightweight moving-average filter applied to
 * the two numeric signals that most affect perceived narrator character:
 *
 *   threadClarity    -- smoothed reflectionClarity (0-1), drives clause density
 *   threadThreshold  -- smoothed COMPRESS_THRESHOLD (0.46-0.65), drives layer visibility
 *
 * Smoothing prevents the narrator from jumping abruptly when:
 *   - the user navigates between screens
 *   - the ring crosses a threshold boundary
 *   - harmony flips readable/unreadable
 *   - sky tone shifts
 *
 * The thread lives in NarratorContext (via useRef<NarratorThreadState>).
 * It is read by SeasonalFieldCard and written after each render commit.
 * It resets to neutral (0.70, 0.55) when rebirth fires.
 *
 * SMOOTHING FACTOR: 0.12 per render
 *   At 60fps this would be aggressive. In practice SeasonalFieldCard
 *   re-renders at most a few times per minute (sensor events are throttled).
 *   0.12 means it takes ~18 renders to close 90% of the gap -- roughly
 *   3-5 minutes of normal field use. Abrupt is eliminated; lag is minimal.
 *
 * DESIGN INVARIANT: thread is pure numeric smoothing -- no strings,
 * no phrase tables, no engine calls. Phrase shape is determined by the
 * smoothed floats after the fact. This keeps it side-effect-free.
 */

export interface NarratorThreadState {
  threadClarity:   number;   // smoothed reflectionClarity, default 0.70
  threadThreshold: number;   // smoothed COMPRESS_THRESHOLD, default 0.55
  threadSkyTone:   number;   // smoothed sky.continuity proxy, default 0.50
  threadSkyDrift:  number;   // Arc 58: smoothed sky.drift (-1..+1), default 0

  // Arc 65: Cross-field drift memory (smoothed, -1..+1)
  threadNoseDrift:  number;   // smoothed nose.drift
  threadSkinDrift:  number;   // Arc 65: skin has no drift; stores thermal load delta proxy
  threadFootDrift:  number;   // smoothed foot.drift
  threadPulseDrift: number;   // smoothed pulse.drift

  // Arc 65: Cross-field continuity memory (smoothed, 0-1)
  threadSkyContinity:    number;   // smoothed sky.continuity
  threadNoseContinuity:  number;   // smoothed nose.continuity
  threadSkinContinuity:  number;   // smoothed skin.continuity
  threadFootContinuity:  number;   // smoothed foot.continuity
  threadPulseContinuity: number;   // smoothed pulse.continuity

  isWarm:          boolean;  // true once thread has been updated at least once
}

export const THREAD_NEUTRAL: NarratorThreadState = {
  threadClarity:   0.70,
  threadThreshold: 0.55,
  threadSkyTone:   0.50,
  threadSkyDrift:  0,

  // Arc 65: cross-field drift memory
  threadNoseDrift:   0,
  threadSkinDrift:   0,
  threadFootDrift:   0,
  threadPulseDrift:  0,

  // Arc 65: cross-field continuity memory
  threadSkyContinity:    0.50,
  threadNoseContinuity:  0.50,
  threadSkinContinuity:  0.50,
  threadFootContinuity:  0.50,
  threadPulseContinuity: 0.50,

  isWarm:          false,
};

const SMOOTH = 0.12;  // exponential moving average factor

/**
 * advance() -- call once per render after computing clarity + threshold.
 * Returns the new thread state (caller writes it to the ref).
 */
export function advanceThread(
  prev: NarratorThreadState,
  nextClarity:   number,
  nextThreshold: number,
  nextSkyTone:   number,   // sky.continuity (0-1), or 0.50 if sky inactive
  nextSkyDrift:  number,   // Arc 58: sky.drift (-1..+1), or 0 if sky inactive
  // Arc 65: cross-field drift + continuity inputs (all optional for backward compat)
  fieldDrifts?: {
    nose?:   number;   // nose.drift (-1..+1)
    skin?:   number;   // skin thermal load proxy (0-1, used as drift proxy)
    foot?:   number;   // foot.drift (-1..+1)
    pulse?:  number;   // pulse.drift (-1..+1)
  },
  fieldContinuities?: {
    sky?:    number;   // sky.continuity (0-1)
    nose?:   number;   // nose.continuity (0-1)
    skin?:   number;   // skin.continuity (0-1)
    foot?:   number;   // foot.continuity (0-1)
    pulse?:  number;   // pulse.continuity (0-1)
  },
): NarratorThreadState {
  const smooth = (p: number, n: number) => p + (n - p) * SMOOTH;
  return {
    threadClarity:   smooth(prev.threadClarity,   nextClarity),
    threadThreshold: smooth(prev.threadThreshold, nextThreshold),
    threadSkyTone:   smooth(prev.threadSkyTone,   nextSkyTone),
    threadSkyDrift:  smooth(prev.threadSkyDrift,  nextSkyDrift),

    // Arc 65: cross-field drift memory
    threadNoseDrift:   smooth(prev.threadNoseDrift,   fieldDrifts?.nose   ?? 0),
    threadSkinDrift:   smooth(prev.threadSkinDrift,   fieldDrifts?.skin   ?? 0),
    threadFootDrift:   smooth(prev.threadFootDrift,   fieldDrifts?.foot   ?? 0),
    threadPulseDrift:  smooth(prev.threadPulseDrift,  fieldDrifts?.pulse  ?? 0),

    // Arc 65: cross-field continuity memory
    threadSkyContinity:    smooth(prev.threadSkyContinity,    fieldContinuities?.sky   ?? prev.threadSkyContinity),
    threadNoseContinuity:  smooth(prev.threadNoseContinuity,  fieldContinuities?.nose  ?? prev.threadNoseContinuity),
    threadSkinContinuity:  smooth(prev.threadSkinContinuity,  fieldContinuities?.skin  ?? prev.threadSkinContinuity),
    threadFootContinuity:  smooth(prev.threadFootContinuity,  fieldContinuities?.foot  ?? prev.threadFootContinuity),
    threadPulseContinuity: smooth(prev.threadPulseContinuity, fieldContinuities?.pulse ?? prev.threadPulseContinuity),

    isWarm:          true,
  };
}

/**
 * blendWithThread() -- blend a just-computed value toward the thread.
 * Used by SeasonalFieldCard to produce the output value that the
 * narrator actually uses. Blend factor is smaller than SMOOTH (0.06)
 * so the thread stabilizes rather than dictating.
 */
export function blendWithThread(
  live: number,
  threadValue: number,
  factor = 0.06,
): number {
  return live + (threadValue - live) * factor;
}
