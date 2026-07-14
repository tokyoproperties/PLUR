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
  isWarm:          boolean;  // true once thread has been updated at least once
}

export const THREAD_NEUTRAL: NarratorThreadState = {
  threadClarity:   0.70,
  threadThreshold: 0.55,
  threadSkyTone:   0.50,
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
): NarratorThreadState {
  const smooth = (p: number, n: number) => p + (n - p) * SMOOTH;
  return {
    threadClarity:   smooth(prev.threadClarity,   nextClarity),
    threadThreshold: smooth(prev.threadThreshold, nextThreshold),
    threadSkyTone:   smooth(prev.threadSkyTone,   nextSkyTone),
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
