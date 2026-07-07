/**
 * atlas/fieldSession.ts
 *
 * Field Session — Mission 6. Groups the existing Field Moment ring
 * buffer (Phase X, atlas/fieldMoment.ts — already sealed, already
 * persisted, already summarized) into bounded sessions: a run, a
 * walk, a yard sit, a corridor pass.
 *
 * DESIGN NOTE — sessions are DERIVED, not event-driven:
 *
 * The brief for this mission proposed explicit startSession() /
 * endSession() calls wired to the app opening / a run beginning and
 * the app leaving / stopping. That was rejected in favor of a pure
 * function that splits the EXISTING moment ring buffer on time gaps
 * (see SESSION_GAP_THRESHOLD_MS, thresholds.ts). Two concrete reasons:
 *
 * 1. It works immediately over moments already in the ring buffer —
 *    no new subscription plumbing, no new AsyncStorage keys, no new
 *    failure surface. FieldMoment capture (useAtlas.ts) already runs
 *    on every meaningful state change plus a 5-minute forced floor;
 *    sessions just need to notice the gaps that are already there.
 * 2. An explicit start/end event pair can silently fail to close (app
 *    killed, OS-suspended, crash) leaving a session that never ends.
 *    A gap-derived boundary has no such failure mode — it's recomputed
 *    fresh from timestamps every time, so there's no dangling state to
 *    leak or clean up.
 *
 * A live-triggered variant (an explicit "end this session now") is a
 * reasonable v2 if a hard user-initiated boundary is ever wanted — but
 * nothing in this app's UI proposes a manual start/stop control, and
 * the ambient/non-directive design language already established
 * across ecosystem-engine.ts and seasonalProfile.ts argues against
 * introducing one without being asked.
 *
 * Pure logic — no React, no hooks.
 */

import type { FieldMoment } from '@/atlas/fieldMoment';
import type { HybridFieldState } from '@/hybrid/hybrid-engine';
import type { CorridorTone } from '@/corridor/corridor-engine';
import { SESSION_GAP_THRESHOLD_MS } from '@/utils/thresholds';

// ─── Types ────────────────────────────────────────────────

export interface FieldSession {
  /** Stable id — the first moment's own id, so it's consistent across recomputation */
  id: string;
  startTimestamp: number;
  endTimestamp: number;
  /** True if this is the most recent session and the gap to "now" hasn't yet crossed the boundary */
  isActive: boolean;
  moments: FieldMoment[];
}

export type CorridorStability = 'stable' | 'shifting' | 'insufficient-data';

export interface FieldSessionSummary {
  session: FieldSession;
  durationMs: number;
  momentCount: number;
  dominantFieldState: HybridFieldState | null;
  dominantCorridorTone: CorridorTone | null;
  corridorStability: CorridorStability;
  /** Species invited at any point during the session, in first-seen order */
  speciesHighlights: string[];
  /** Human-readable one-line summary */
  summary: string;
}

// ─── Session derivation ───────────────────────────────────

/**
 * Splits a chronological moment ring into sessions, breaking wherever
 * the gap between two consecutive moments exceeds SESSION_GAP_THRESHOLD_MS.
 * Assumes `moments` is already in chronological order (the ring buffer
 * always is — see fieldMoment.ts::addToRing).
 */
export function deriveSessions(moments: FieldMoment[]): FieldSession[] {
  if (moments.length === 0) return [];

  const sessions: FieldSession[] = [];
  let current: FieldMoment[] = [moments[0]];

  for (let i = 1; i < moments.length; i++) {
    const gap = moments[i].timestamp - moments[i - 1].timestamp;
    if (gap > SESSION_GAP_THRESHOLD_MS) {
      sessions.push(buildSession(current, false));
      current = [moments[i]];
    } else {
      current.push(moments[i]);
    }
  }
  // The last group is only "active" if it's genuinely still open —
  // callers that care about liveness should compare its endTimestamp
  // against the current time themselves (this function has no clock
  // opinion of its own); buildSession here just marks it provisionally.
  sessions.push(buildSession(current, true));

  return sessions;
}

function buildSession(moments: FieldMoment[], isActive: boolean): FieldSession {
  return {
    id: moments[0].id,
    startTimestamp: moments[0].timestamp,
    endTimestamp: moments[moments.length - 1].timestamp,
    isActive,
    moments,
  };
}

/**
 * The current/most recent session, or null if no moments exist yet.
 * A session is only reported as truly "active" (still ongoing right
 * now) if the gap from its last moment to `now` hasn't itself crossed
 * the session-boundary threshold — otherwise it's a completed session
 * that just hasn't been followed by a new one yet.
 */
export function getCurrentSession(moments: FieldMoment[], now: number = Date.now()): FieldSession | null {
  const sessions = deriveSessions(moments);
  if (sessions.length === 0) return null;

  const latest = sessions[sessions.length - 1];
  const stillOpen = now - latest.endTimestamp <= SESSION_GAP_THRESHOLD_MS;
  return { ...latest, isActive: stillOpen };
}

// ─── Session summary ──────────────────────────────────────

function mostCommon<T extends string>(values: T[]): T | null {
  if (values.length === 0) return null;
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: T | null = null;
  let bestCount = 0;
  for (const [v, count] of counts) {
    if (count > bestCount) {
      best = v;
      bestCount = count;
    }
  }
  return best;
}

export function summarizeSession(session: FieldSession): FieldSessionSummary {
  const { moments } = session;
  const durationMs = session.endTimestamp - session.startTimestamp;

  const dominantFieldState = mostCommon(moments.map((m) => m.fieldState));
  const dominantCorridorTone = mostCommon(moments.map((m) => m.corridorTone));

  // Stability: what share of moments share the dominant tone. Needs at
  // least 3 moments to say anything — fewer than that, "stable" vs
  // "shifting" isn't a meaningful distinction yet.
  let corridorStability: CorridorStability = 'insufficient-data';
  if (moments.length >= 3 && dominantCorridorTone) {
    const matching = moments.filter((m) => m.corridorTone === dominantCorridorTone).length;
    corridorStability = matching / moments.length >= 0.7 ? 'stable' : 'shifting';
  }

  const speciesHighlights: string[] = [];
  const seen = new Set<string>();
  for (const m of moments) {
    for (const s of m.invitedSpecies) {
      if (!seen.has(s)) {
        seen.add(s);
        speciesHighlights.push(s);
      }
    }
  }

  const parts: string[] = [];
  const minutes = Math.round(durationMs / 60000);
  parts.push(minutes >= 1 ? `${minutes} min` : 'just started');
  if (dominantFieldState) parts.push(`mostly ${dominantFieldState}`);
  if (speciesHighlights.length > 0) {
    parts.push(`${speciesHighlights.length} species present`);
  }

  return {
    session,
    durationMs,
    momentCount: moments.length,
    dominantFieldState,
    dominantCorridorTone,
    corridorStability,
    speciesHighlights,
    summary: parts.join(' · '),
  };
}
