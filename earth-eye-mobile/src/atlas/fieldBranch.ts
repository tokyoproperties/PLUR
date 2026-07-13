/**
 * atlas/fieldBranch.ts -- Arc 22 (SPLIT)
 *
 * Field Branch Engine.
 *
 * The field begins branching -- generating a chapter path based on
 * the full intelligence stack. A branch is a directional suggestion
 * about HOW to engage with the field, not just WHAT to do next.
 *
 * Initiative (Arc 21) answered: "What should you do?"
 * Branch (Arc 22) answers:     "What kind of field are you in?"
 *
 * Five branch paths:
 *   stillness    -- the field has gone quiet; settle into it
 *   movement     -- the field is pulling outward; follow it
 *   observation  -- the field is dense with information; read it
 *   return       -- the field is receding; complete the loop
 *   exploration  -- the field has opened new territory; range wider
 *
 * Branch variant refines the path using soul root movement:
 *   steady    -- the branch is stable and consistent
 *   wandering -- the branch is shifting; follow loosely
 *   pooling   -- the branch is concentrating; go deep
 *   breathing -- the branch is rhythmic; pace with it
 *
 * Priority stack (above initiative):
 *   danger    -> return/steady
 *   drift     -> return/wandering
 *   deep soul + memory -> path derived from soul root movement
 *   initiative -> path mirrors initiative action
 *   session velocity -> refines variant
 *   season fallback
 *
 * Confidence gates:
 *   Branch surfaces only when confidence >= 0.58
 *   Soul variant surfaces only when soul.isEstablished
 *
 * Pure logic -- no React, no hooks.
 */

import type { InitiativeAction } from '@/atlas/fieldInitiative';
import type { AlignmentState, AlignmentMode } from '@/atlas/fieldAlignment';
import type { PresenceState } from '@/atlas/fieldPresence';
import type { FieldMemory } from '@/atlas/fieldMemory';
import type { FieldSoul } from '@/atlas/fieldSoul';
import type { SymbolicMode } from '@/contexts/mode-context';
import type { FieldWindowQuality } from '@/hooks/useSeasonalFieldWindow';
import type { CalendarSeason } from '@/hooks/useSeason';

// ---- Types -----------------------------------------------------------

export type BranchPath =
  | 'stillness'
  | 'movement'
  | 'observation'
  | 'return'
  | 'exploration';

export type BranchVariant =
  | 'steady'
  | 'wandering'
  | 'pooling'
  | 'breathing'
  | null;

export interface FieldBranch {
  path:       BranchPath;
  variant:    BranchVariant;
  confidence: number;
  /** Field Window chapter overlay line */
  overlay:    string;
  /** Whether branch has enough signal to surface in the UI */
  isSurfaced: boolean;
  /** Implied mode for this branch */
  impliedMode: SymbolicMode;
}

// ---- Thresholds ------------------------------------------------------

const SURFACE_THRESHOLD = 0.58;
const MIN_MOMENTS       = 5;   // higher bar than initiative -- branch needs more data

// ---- Overlay text ----------------------------------------------------

const OVERLAYS: Record<BranchPath, Record<BranchVariant | 'default', string>> = {
  stillness: {
    steady:    'Field holds a stillness branch. Settle in.',
    wandering: 'Stillness branch shifting. Rest where you are.',
    pooling:   'Field concentrating into stillness. Go deep.',
    breathing: 'Stillness branch rhythmic. Breathe with it.',
    default:   'Field opens a stillness branch.',
  },
  movement: {
    steady:    'Movement branch steady. Follow the field outward.',
    wandering: 'Movement branch wandering. Move loosely.',
    pooling:   'Movement branch concentrating. Find the corridor.',
    breathing: 'Movement branch rhythmic. Let your pace find itself.',
    default:   'Movement branch widening.',
  },
  observation: {
    steady:    'Observation branch open. Read the field carefully.',
    wandering: 'Observation branch shifting. Follow what catches your eye.',
    pooling:   'Field dense with signal. Slow and look closely.',
    breathing: 'Observation branch rhythmic. Scan, pause, scan.',
    default:   'Observation branch forming.',
  },
  return: {
    steady:    'Return branch clear. Complete the loop.',
    wandering: 'Return branch forming. Begin heading back.',
    pooling:   'Field receding. Consolidate what you have observed.',
    breathing: 'Return branch rhythmic. Wind down naturally.',
    default:   'Return branch strengthening.',
  },
  exploration: {
    steady:    'Exploration branch open. New territory available.',
    wandering: 'Exploration branch wandering. Range wider.',
    pooling:   'Exploration concentrating. One new direction.',
    breathing: 'Exploration branch breathing. Expand gradually.',
    default:   'Exploration branch available.',
  },
};

// ---- Mode coupling ---------------------------------------------------

const BRANCH_MODE: Record<BranchPath, SymbolicMode> = {
  stillness:   'love',
  movement:    'plur',
  observation: 'plur',
  return:      'love',
  exploration: 'plur',
};

// ---- Root movement -> variant ----------------------------------------

function movementToVariant(
  movement: 'steady' | 'wandering' | 'pooling' | 'breathing' | undefined
): BranchVariant {
  if (!movement) return null;
  return movement;
}

// ---- Initiative -> path ----------------------------------------------

function initiativeToPath(action: InitiativeAction): BranchPath {
  switch (action) {
    case 'observe':  return 'observation';
    case 'move':     return 'movement';
    case 'rest':     return 'stillness';
    case 'explore':  return 'exploration';
    case 'return':   return 'return';
  }
}

// ---- Season fallback -------------------------------------------------

function seasonPath(season: CalendarSeason, quality: FieldWindowQuality): BranchPath {
  if (quality === 'avoid')    return 'return';
  if (quality === 'marginal') return 'stillness';
  if (season === 'spring' || season === 'fall') return 'movement';
  if (season === 'summer')    return 'observation';
  return 'stillness';
}

// ---- Main evaluator --------------------------------------------------

export interface BranchInput {
  quality:           FieldWindowQuality;
  alignment:         AlignmentState;
  alignMode:         AlignmentMode;
  presence:          PresenceState;
  initiative:        InitiativeAction;
  initiativeConf:    number;
  memory:            FieldMemory;
  soul:              FieldSoul;
  mode:              SymbolicMode;
  season:            CalendarSeason;
  sessionMomentCount: number;
}

export function evaluateFieldBranch(input: BranchInput): FieldBranch {
  const {
    quality, alignment, presence,
    initiative, initiativeConf,
    memory, soul, mode, season,
    sessionMomentCount,
  } = input;

  // Not enough field data
  if (memory.totalMoments < MIN_MOMENTS) {
    return dormant();
  }

  // Derive soul variant if established
  const variant: BranchVariant = soul.isEstablished
    ? movementToVariant(soul.traits.rootMovement)
    : null;

  // ---- Priority stack ----

  // 1. Danger -> return
  if (quality === 'avoid') {
    return make('return', variant, 0.88, 'love');
  }

  // 2. Absent / drifting -> return
  if (presence === 'absent') {
    return make('return', variant ?? 'wandering', 0.72, 'love');
  }
  if (presence === 'drifting') {
    return make('return', variant ?? 'wandering', 0.62, 'love');
  }

  // 3. Deep soul + established memory -> soul-guided branch
  if (soul.isEstablished && soul.isRevealed && memory.totalMoments >= 20) {
    const soulPath = soulGuidedPath(soul.traits.rootMovement, mode);
    // Soul path must agree with alignment or initiative to earn high confidence
    const soulConf = soulPath === initiativeToPath(initiative) ? 0.82 : 0.68;
    return make(soulPath, variant, soulConf, BRANCH_MODE[soulPath]);
  }

  // 4. High-confidence initiative -> mirror as branch
  if (initiativeConf >= 0.70) {
    const path = initiativeToPath(initiative);
    return make(path, variant, initiativeConf * 0.92, BRANCH_MODE[path]);
  }

  // 5. Medium initiative + alignment agreement -> branch
  if (initiativeConf >= 0.55) {
    const path = initiativeToPath(initiative);
    const alignAgrees = alignmentAgrees(alignment, path);
    const conf = alignAgrees ? initiativeConf * 0.88 : initiativeConf * 0.72;
    return make(path, variant, conf, BRANCH_MODE[path]);
  }

  // 6. Session velocity refinement -- many moments in short session = observation
  if (sessionMomentCount >= 6 && alignment === 'aligned') {
    return make('observation', variant, 0.62, mode);
  }

  // 7. Season fallback
  const path = seasonPath(season, quality);
  return make(path, null, 0.52, BRANCH_MODE[path]);
}

// ---- Helpers ---------------------------------------------------------

function soulGuidedPath(
  movement: 'steady' | 'wandering' | 'pooling' | 'breathing',
  mode: SymbolicMode
): BranchPath {
  switch (movement) {
    case 'steady':    return mode === 'love' ? 'stillness' : 'movement';
    case 'wandering': return 'exploration';
    case 'pooling':   return 'observation';
    case 'breathing': return mode === 'love' ? 'stillness' : 'observation';
  }
}

function alignmentAgrees(alignment: AlignmentState, path: BranchPath): boolean {
  if (alignment === 'aligned')    return true;
  if (alignment === 'misaligned') return path === 'return' || path === 'stillness';
  return false; // neutral
}

function make(
  path: BranchPath,
  variant: BranchVariant,
  confidence: number,
  impliedMode: SymbolicMode
): FieldBranch {
  const variantKey = variant ?? 'default';
  return {
    path,
    variant,
    confidence,
    overlay:     OVERLAYS[path][variantKey],
    isSurfaced:  confidence >= SURFACE_THRESHOLD,
    impliedMode,
  };
}

function dormant(): FieldBranch {
  return {
    path:        'observation',
    variant:     null,
    confidence:  0,
    overlay:     OVERLAYS.observation.default,
    isSurfaced:  false,
    impliedMode: 'plur',
  };
}
