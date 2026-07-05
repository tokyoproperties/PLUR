/**
 * plur-overlay-engine.ts
 *
 * Fuses sensor data + symbolic mode + Yard/Lite evaluation into a
 * single overlay state that drives the global PLUROverlay component.
 *
 * This is the "emotional weather" of the app — it translates raw
 * sensor numbers into a soft visual register that sits beneath the
 * interaction layer, never above it.
 *
 * PLUR overlays are always gentle. Even in alert states, the overlay
 * softens rather than sharpens. This is the design language: observe,
 * don't instruct.
 */

import { useMemo } from 'react';

import { useSensors, type SensorSnapshot } from '@/hooks/useSensors';
import { useSymbolicMode } from '@/contexts/mode-context';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

export type OverlayShade = 'calm' | 'bright' | 'dim' | 'alert' | 'quiet';
export type OverlayCue = 'none' | 'soft-glow' | 'pulse' | 'shimmer';

export interface PLUROverlayState {
  shade: OverlayShade;
  /** 0.0 (invisible) – 1.0 (fully present) */
  intensity: number;
  cue: OverlayCue;
  /** Human-readable one-line description for debug panel */
  description: string;
}

const NEUTRAL: PLUROverlayState = {
  shade: 'calm',
  intensity: 0.0,
  cue: 'none',
  description: 'Sensors warming up or unavailable.',
};

export function usePLUROverlayState(): PLUROverlayState {
  const { snapshot } = useSensors();
  const { mode } = useSymbolicMode();

  const lite = evaluateLiteMode(snapshot);
  const yard = evaluateYardMode(snapshot);

  return useMemo<PLUROverlayState>(() => {
    const { lux, motionMagnitude, soundRelativeDb } = snapshot;

    // If all sensors are null/unavailable, stay neutral
    if (lux === null && soundRelativeDb === null && motionMagnitude === 0) {
      return NEUTRAL;
    }

    let shade: OverlayShade = 'calm';
    let intensity = 0.15;
    let cue: OverlayCue = 'none';
    const notes: string[] = [];

    // --- LIGHT ---
    if (lux !== null) {
      if (lux < 20) {
        shade = 'dim';
        intensity = Math.max(intensity, 0.25);
        notes.push('low light');
      } else if (lux > 800) {
        shade = 'bright';
        intensity = Math.max(intensity, 0.30);
        notes.push('bright light');
      } else {
        notes.push('moderate light');
      }
    }

    // --- SOUND ---
    if (soundRelativeDb !== null) {
      if (soundRelativeDb > 60) {
        shade = 'alert';
        cue = 'shimmer';
        intensity = Math.max(intensity, 0.50);
        notes.push('loud');
      } else if (soundRelativeDb > 25) {
        cue = 'pulse';
        intensity = Math.max(intensity, 0.30);
        notes.push('moderate sound');
      } else {
        cue = 'soft-glow';
        notes.push('quiet');
      }
    }

    // --- MOTION ---
    // motionMagnitude is a smoothed delta — values >0.1 indicate real movement
    if (motionMagnitude > 0.15) {
      shade = 'alert';
      cue = 'pulse';
      intensity = Math.max(intensity, 0.55);
      notes.push('abrupt motion');
    } else if (motionMagnitude > 0.03) {
      notes.push('gentle motion');
    } else {
      notes.push('still');
    }

    // --- YARD MODE (firework window override) ---
    if (yard.isFireworkWindow) {
      // During firework sensitivity: dim everything, go quiet
      shade = 'dim';
      intensity = Math.max(intensity, 0.35);
      cue = 'soft-glow';
      notes.push('firework window active');
    }

    // --- LITE MODE (suggestStillness) ---
    if (lite.suggestStillness) {
      shade = 'alert';
      intensity = Math.max(intensity, 0.55);
      cue = 'pulse';
      notes.push('suggest stillness');
    }

    // --- PLUR MODE SOFTENING ---
    // PLUR is always gentle — reduce intensity, never pulse
    if (mode === 'plur') {
      intensity *= 0.70;
      if (cue === 'pulse') cue = 'soft-glow';
      if (shade === 'alert') shade = 'quiet';
    }

    // --- LOVE MODE GROUNDING ---
    // LOVE is home — even softer, more grounded
    if (mode === 'love') {
      intensity *= 0.80;
      if (cue === 'shimmer') cue = 'soft-glow';
      if (shade === 'alert') shade = 'quiet';
    }

    // Clamp intensity
    intensity = Math.min(Math.max(intensity, 0), 0.7);

    return {
      shade,
      intensity,
      cue,
      description: notes.join(' · ') || 'nominal',
    };
  }, [snapshot, mode, lite, yard]);
}
