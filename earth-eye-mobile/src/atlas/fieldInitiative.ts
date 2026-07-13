/**
 * atlas/fieldInitiative.ts -- Arc 21 (BLACK JACK)
 *
 * Field Initiative Engine.
 *
 * The field's first act of agency. Reads the full intelligence stack
 * (memory, alignment, presence, season, mode, soul) and computes
 * what the field is suggesting you do next.
 *
 * This is NOT a notification, alert, or prompt. It is a subtle
 * ambient signal -- a recommendation from the field to the user,
 * surfaced only when confidence is high enough to be meaningful.
 *
 * Five initiative actions:
 *   observe  -- slow attention, scan the environment carefully
 *   move     -- deliberate movement, trail or terrain
 *   rest     -- stillness, reflection, the field wants quiet
 *   explore  -- range wider, leave familiar ground
 *   return   -- come back to center, session winding down
 *
 * Priority stack (highest to lowest):
 *   danger (avoid window) -> return
 *   absence (no presence) -> return
 *   deep presence + aligned movement -> move or explore
 *   deep presence + aligned observation -> observe
 *   aligned stillness -> rest
 *   memory rising + calibrated -> explore
 *   drifting -> return
 *   default -> observe
 *
 * Confidence gates prevent the field from suggesting things it
 * does not have enough data to back up.
 *
 * Pure logic -- no React, no hooks.
 */

import type { AlignmentState, AlignmentMode } from '@/atlas/fieldAlignment';
import type { PresenceState, PresenceQuality } from '@/atlas/fieldPresence';
import type { FieldMemory } from '@/atlas/fieldMemory';
import type { SymbolicMode } from '@/contexts/mode-context';
import type { FieldWindowQuality } from '@/hooks/useSeasonalFieldWindow';
import type { CalendarSeason } from '@/hooks/useSeason';

// ---- Types -----------------------------------------------------------

export type InitiativeAction =
  | 'observe'
  | 'move'
  | 'rest'
  | 'explore'
  | 'return';

export type InitiativeReason =
  | 'alignment'
  | 'presence'
  | 'season'
  | 'memory'
  | 'danger'
  | 'drift';

export interface FieldInitiative {
  /** What the field is recommending */
  action: InitiativeAction;
  /** How confident the field is (0.0-1.0) */
  confidence: number;
  /** Primary reason for this recommendation */
  reason: InitiativeReason;
  /** Short directive line for Field Window (appears only if confidence >= threshold) */
  directive: string;
  /** Whether initiative has enough signal to surface in the UI */
  isSurfaced: boolean;
  /** Favored mode implied by this initiative */
  impliedMode: SymbolicMode;
}

// ---- Thresholds ------------------------------------------------------

/** Minimum confidence to surface the directive in Field Window */
const SURFACE_THRESHOLD = 0.55;

/** Minimum moments before initiative is meaningful */
const MIN_MOMENTS = 3;

// ---- Directive text --------------------------------------------------

const DIRECTIVES: Record<InitiativeAction, string> = {
  observe:  'Field invites slow attention. Observation window open.',
  move:     'Field suggests movement. Alignment is strong.',
  rest:     'Field recommends stillness. Let the moment settle.',
  explore:  'Field invites exploration. Memory is rising.',
  return:   'Field asks for return. Come back to center.',
};

// ---- Mode inference --------------------------------------------------

const IMPLIED_MODE: Record<InitiativeAction, SymbolicMode> = {
  move:    'plur',
  explore: 'plur',
  observe: 'plur',  // resolved by presence quality at call site
  rest:    'love',
  return:  'love',
};

// ---- Scoring ---------------------------------------------------------

interface InitiativeInput {
  quality:       FieldWindowQuality;
  alignment:     AlignmentState;
  alignMode:     AlignmentMode;
  presence:      PresenceState;
  presenceQuality: PresenceQuality;
  presenceStrength: number;
  memory:        FieldMemory;
  mode:          SymbolicMode;
  season:        CalendarSeason;
}

export function evaluateFieldInitiative(input: InitiativeInput): FieldInitiative {
  const {
    quality, alignment, alignMode,
    presence, presenceQuality, presenceStrength,
    memory, mode, season,
  } = input;

  // Not enough data -- return a dormant initiative
  if (memory.totalMoments < MIN_MOMENTS) {
    return {
      action:      'observe',
      confidence:  0,
      reason:      'presence',
      directive:   DIRECTIVES.observe,
      isSurfaced:  false,
      impliedMode: 'plur',
    };
  }

  // ---- Priority stack ----

  // 1. Danger window -- always return
  if (quality === 'avoid') {
    return make('return', 0.9, 'danger', 'love');
  }

  // 2. Absent -- quiet return signal
  if (presence === 'absent') {
    return make('return', 0.7, 'drift', 'love');
  }

  // 3. Drifting -- soft return
  if (presence === 'drifting') {
    return make('return', 0.6, 'drift', 'love');
  }

  // 4. Deep presence + aligned movement -> move or explore
  if (presenceQuality === 'deep' && alignment === 'aligned') {
    if (alignMode === 'movement') {
      // Memory rising = explore (range wider), established = move (purposeful)
      if (memory.isEstablished && memory.totalMoments >= 20) {
        return make('explore', 0.85, 'memory', 'plur');
      }
      return make('move', 0.80, 'alignment', 'plur');
    }
    // Aligned observation
    if (alignMode === 'observation') {
      return make('observe', 0.80, 'alignment', mode);
    }
    // Aligned stillness (LOVE alignment mode)
    if (alignMode === 'stillness') {
      return make('rest', 0.75, 'alignment', 'love');
    }
  }

  // 5. Light presence + aligned -> observe
  if (presenceQuality === 'light' && alignment === 'aligned') {
    return make('observe', 0.65, 'alignment', mode);
  }

  // 6. Memory calibrated + prime window + no strong presence signal -> explore
  if (
    memory.isEstablished &&
    quality === 'prime' &&
    presence === 'present'
  ) {
    return make('explore', 0.60, 'memory', 'plur');
  }

  // 7. LOVE mode + neutral alignment + present -> rest
  if (mode === 'love' && alignment !== 'misaligned' && presence === 'present') {
    return make('rest', 0.60, 'presence', 'love');
  }

  // 8. Misaligned + present -> observe lightly
  if (alignment === 'misaligned' && presence === 'present') {
    return make('observe', 0.55, 'alignment', mode);
  }

  // 9. Season-based nudge (spring/fall = move, summer = rest, winter = observe)
  const seasonAction = seasonNudge(season, quality);
  return make(seasonAction.action, seasonAction.confidence, 'season', IMPLIED_MODE[seasonAction.action]);
}

// ---- Helpers ---------------------------------------------------------

function make(
  action: InitiativeAction,
  confidence: number,
  reason: InitiativeReason,
  impliedMode: SymbolicMode
): FieldInitiative {
  return {
    action,
    confidence,
    reason,
    directive:   DIRECTIVES[action],
    isSurfaced:  confidence >= SURFACE_THRESHOLD,
    impliedMode,
  };
}

function seasonNudge(
  season: CalendarSeason,
  quality: FieldWindowQuality
): { action: InitiativeAction; confidence: number } {
  if (quality === 'prime') {
    if (season === 'spring' || season === 'fall') return { action: 'move',    confidence: 0.58 };
    if (season === 'summer')                      return { action: 'observe', confidence: 0.55 };
    if (season === 'winter')                      return { action: 'observe', confidence: 0.52 };
  }
  if (quality === 'good') {
    return { action: 'observe', confidence: 0.52 };
  }
  return { action: 'rest', confidence: 0.50 };
}
