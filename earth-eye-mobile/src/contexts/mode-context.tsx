/**
 * mode-context.tsx
 * The symbolic layer that sits on top of the environmental mode logic
 * (Lite Mode / Yard Mode, see @/modes). PLUR and LOVE are not new
 * sensor logic — they're the emotional lens the user chooses for
 * interpreting the same live sensor data:
 *
 *   PLUR — out in the world. Peace, love, unity, respect. Community
 *          and environmental awareness. Maps to Lite Mode's lens.
 *   LOVE — home. Family, safety, grounding. Maps to Yard Mode's lens
 *          (its dampening curves are the literal expression of "go
 *          gentle, you're near the people/creatures you love").
 *
 * This is a lightweight React Context — no persistence yet (resets to
 * 'plur' on app restart). AsyncStorage persistence is a easy follow-up
 * if wanted.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type SymbolicMode = 'plur' | 'love';

export interface ModeMeta {
  label: string;
  tagline: string;
  /** Solid accent color for text/icons/active states. */
  color: string;
  /** Soft translucent version of color, for badge/panel backgrounds. */
  glowColor: string;
  /** The environmental mode this symbolic mode is the lens for. */
  environmentalLens: 'lite' | 'yard';
}

export const MODE_META: Record<SymbolicMode, ModeMeta> = {
  plur: {
    label: 'PLUR',
    tagline: 'Peace, love, unity, respect — tuned outward, to the world.',
    color: '#9A7AB8',
    glowColor: 'rgba(154, 122, 184, 0.18)',
    environmentalLens: 'lite',
  },
  love: {
    label: 'LOVE',
    tagline: 'Home. Family, safety, grounding — tuned inward, to the yard.',
    color: '#C4974A',
    glowColor: 'rgba(196, 151, 74, 0.18)',
    environmentalLens: 'yard',
  },
};

interface ModeContextValue {
  mode: SymbolicMode;
  meta: ModeMeta;
  setMode: (mode: SymbolicMode) => void;
  toggle: () => void;
}

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SymbolicMode>('plur');

  const value = useMemo<ModeContextValue>(
    () => ({
      mode,
      meta: MODE_META[mode],
      setMode,
      toggle: () => setMode((current) => (current === 'plur' ? 'love' : 'plur')),
    }),
    [mode]
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useSymbolicMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error('useSymbolicMode must be used within a ModeProvider');
  }
  return ctx;
}
