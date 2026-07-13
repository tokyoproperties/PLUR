/**
 * atlas/fieldPresence.ts -- Arc 20
 *
 * Presence Engine.
 *
 * Derives the user's presence state from data the system already holds:
 *   - Field session activity (moments accumulating vs stalled)
 *   - Time since last moment capture (ring buffer velocity)
 *   - Live motion band (still / forming / active)
 *   - Alignment state (are conditions converging or diverging)
 *
 * Three output states:
 *   present  -- session active, moments recent, field engaged
 *   drifting -- session exists but slowing, attention fading
 *   absent   -- no active session, or long silence
 *
 * Design note: same derivation-over-events philosophy as fieldSession.ts.
 * No startPresence() / endPresence() hooks. Presence is recomputed
 * fresh from timestamps on every render -- no dangling state.
 *
 * Pure logic -- no React, no hooks.
 */

import type { FieldSessionSummary } from '@/atlas/fieldSession';
import type { AlignmentState } from '@/atlas/fieldAlignment';
import type { MotionBand } from '@/utils/thresholds';

// ---- Types -----------------------------------------------------------

export type PresenceState = 'present' | 'drifting' | 'absent';

export type PresenceQuality = 'deep' | 'light' | 'forming' | 'none';

export interface FieldPresence {
  /** Core presence state */
  state: PresenceState;
  /** Finer quality read -- how engaged the presence is */
  quality: PresenceQuality;
  /** Short Field Window line when presence is surfaced */
  line: string;
  /** Whisper label for tile accents */
  label: string;
  /** 0.0-1.0 presence strength (used for accent intensity) */
  strength: number;
  /** Whether presence engine has enough data to be meaningful */
  isCalibrated: boolean;
}

// ---- Timing constants ------------------------------------------------

/** A moment within this window = field is actively sampling */
const RECENT_MOMENT_MS  = 8  * 60 * 1000;  // 8 minutes
/** A moment this old = field is still warm but slowing */
const DRIFTING_MOMENT_MS = 20 * 60 * 1000; // 20 minutes
/** Beyond this = absent (matches ~half of SESSION_GAP_THRESHOLD_MS) */
const ABSENT_MOMENT_MS   = 45 * 60 * 1000; // 45 minutes

// ---- Presence text ---------------------------------------------------

const LINES: Record<PresenceState, Record<PresenceQuality, string>> = {
  present: {
    deep:    'Field attentive. Deep presence -- continue exploring.',
    light:   'Field attentive. Continue as you are.',
    forming: 'Presence forming. Field is beginning to register you.',
    none:    'Field attentive.',
  },
  drifting: {
    deep:    'Presence drifting. Return when ready -- the field remembers.',
    light:   'Attention softening. Rest or return to center.',
    forming: 'Drifting. No strong presence recorded yet.',
    none:    'Drifting.',
  },
  absent: {
    deep:    'Field quiet. Waiting for your return.',
    light:   'Field quiet.',
    forming: 'Field forming. Check in when you can.',
    none:    'Field quiet.',
  },
};

const LABELS: Record<PresenceState, string> = {
  present:  'Present',
  drifting: 'Drifting',
  absent:   'Absent',
};

// ---- Evaluator -------------------------------------------------------

export function evaluateFieldPresence(
  session:    FieldSessionSummary | null,
  nowMs:      number,
  motion:     MotionBand,
  alignment:  AlignmentState,
  totalMoments: number
): FieldPresence {
  const isCalibrated = totalMoments >= 3;

  // No session at all
  if (!session) {
    return {
      state:        'absent',
      quality:      'none',
      line:         LINES.absent.none,
      label:        LABELS.absent,
      strength:     0,
      isCalibrated: false,
    };
  }

  const lastMomentAge = nowMs - session.session.endTimestamp;
  const sessionActive = session.session.isActive;

  // ---- State derivation ----

  let state: PresenceState;
  if (lastMomentAge < RECENT_MOMENT_MS && sessionActive) {
    state = 'present';
  } else if (lastMomentAge < DRIFTING_MOMENT_MS) {
    state = 'drifting';
  } else if (lastMomentAge < ABSENT_MOMENT_MS && sessionActive) {
    state = 'drifting';
  } else {
    state = 'absent';
  }

  // ---- Quality derivation ----
  // Deep: present + active motion + alignment converging
  // Light: present but still or neutral alignment
  // Forming: early session (few moments)
  // None: absent

  let quality: PresenceQuality = 'none';
  if (state === 'absent') {
    quality = 'none';
  } else if (session.momentCount < 3) {
    quality = 'forming';
  } else if (
    state === 'present' &&
    (motion === 'active' || motion === 'forming') &&
    alignment === 'aligned'
  ) {
    quality = 'deep';
  } else if (state === 'present') {
    quality = 'light';
  } else {
    quality = 'forming';
  }

  // ---- Strength ----
  // Linear decay from 1.0 (just now) to 0.0 (ABSENT_MOMENT_MS)
  const rawStrength = Math.max(0, 1 - lastMomentAge / ABSENT_MOMENT_MS);
  // Boost slightly for deep quality
  const strength = quality === 'deep'
    ? Math.min(1, rawStrength * 1.2)
    : rawStrength;

  return {
    state,
    quality,
    line:         LINES[state][quality],
    label:        LABELS[state],
    strength,
    isCalibrated,
  };
}
