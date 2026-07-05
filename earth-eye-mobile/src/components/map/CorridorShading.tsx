/**
 * CorridorShading.tsx
 *
 * Map-level ambient tint overlay (Phase V: A + E combined).
 *
 * Layer A — Corridor tone: reads CorridorState.tone and renders a
 * soft full-map tint. calm→sage, bright→amber, still→blue, noisy/
 * mixed→rose. Intensity modulated by tone classification.
 *
 * Layer E — PLUR/LOVE mode tint: PLUR adds a soft lavender breath,
 * LOVE adds a warmer amber embrace. Both soften harsh corridor tones.
 *
 * This is NOT a react-native-maps child — it's a View overlay on top
 * of the MapView with pointerEvents="none". Same pattern as the global
 * PLUROverlay, but scoped to the map container and driven by corridor
 * + mode state.
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { useCorridor } from '@/corridor/useCorridor';
import { useSymbolicMode } from '@/contexts/mode-context';

// EarthEye palette — tone → tint color (low alpha, always subtle)
const TONE_TINTS: Record<string, string> = {
  calm:   'rgba(122, 184, 122, 0.08)',  // sage
  bright: 'rgba(196, 151, 74, 0.10)',   // amber
  still:  'rgba(122, 154, 184, 0.12)',  // muted blue
  noisy:  'rgba(196, 122, 122, 0.10)',  // dusty rose
  mixed:  'rgba(196, 122, 122, 0.08)',  // dusty rose (lighter)
};

// Mode tint — blended on top of tone tint
const MODE_TINTS: Record<string, string> = {
  plur: 'rgba(154, 122, 184, 0.06)',  // lavender — soft, outward
  love: 'rgba(196, 151, 74, 0.08)',   // amber — warm, home
};

// Tone → intensity multiplier (how visible the tint is)
const TONE_INTENSITY: Record<string, number> = {
  calm:   0.5,
  bright: 0.85,
  still:  0.65,
  noisy:  1.0,
  mixed:  1.0,
};

export function CorridorShading() {
  const corridor = useCorridor();
  const { mode } = useSymbolicMode();

  const toneOpacity = useRef(new Animated.Value(0));
  const modeOpacity = useRef(new Animated.Value(0));

  const sensorIntensity = TONE_INTENSITY[corridor.tone] ?? 0.5;

  useEffect(() => {
    Animated.timing(toneOpacity.current, {
      toValue: sensorIntensity,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [sensorIntensity]);

  useEffect(() => {
    Animated.timing(modeOpacity.current, {
      toValue: 1.0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [mode]);

  const toneTint = TONE_TINTS[corridor.tone] ?? TONE_TINTS.calm;
  const modeTint = MODE_TINTS[mode] ?? 'transparent';

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, { backgroundColor: toneTint, opacity: toneOpacity.current }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, { backgroundColor: modeTint, opacity: modeOpacity.current }]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
});
