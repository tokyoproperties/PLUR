/**
 * PLUROverlay.tsx
 *
 * Global ambient overlay — sits on top of all screens but beneath
 * the interaction layer (pointerEvents="none"). Reads the PLUR
 * overlay engine state and renders a soft tint that breathes with
 * the environmental sensor data.
 *
 * The overlay is intentionally subtle. It should be felt, not seen.
 * A gentle warm tint in bright light. A cool dim in darkness.
 * A soft pulse when motion or sound spikes. Never harsh, never
 * distracting — this is the "breathing" of the app.
 *
 * Colors are drawn from the EarthEye design language accent palette:
 *   calm  → neutral (barely visible)
 *   bright → warm amber wash
 *   dim    → cool blue-lavender wash
 *   alert  → muted rose
 *   quiet  → soft sage (PLUR softening of alert states)
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { usePLUROverlayState, type OverlayShade } from '@/overlays/plur-overlay-engine';

const SHADE_TINTS: Record<OverlayShade, string> = {
  calm:    'rgba(200, 200, 220, 0.08)',
  bright:  'rgba(196, 151, 74, 0.12)',   // warm amber
  dim:     'rgba(122, 154, 184, 0.15)',  // muted blue
  alert:   'rgba(196, 122, 122, 0.18)',  // dusty rose
  quiet:   'rgba(122, 184, 122, 0.12)',  // sage
};

export default function PLUROverlay() {
  const overlay = usePLUROverlayState();
  const opacityRef = useRef(new Animated.Value(0));
  const scaleRef = useRef(new Animated.Value(1));

  // Smooth opacity transitions when intensity changes
  useEffect(() => {
    Animated.timing(opacityRef.current, {
      toValue: overlay.intensity,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [overlay.intensity]);

  // Pulse effect for pulse/shimmer cues
  useEffect(() => {
    if (overlay.cue === 'pulse') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleRef.current, {
            toValue: 1.02,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleRef.current, {
            toValue: 1.0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      // Reset scale for non-pulse cues
      scaleRef.current.setValue(1.0);
    }
  }, [overlay.cue]);

  const tint = SHADE_TINTS[overlay.shade] ?? SHADE_TINTS.calm;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          backgroundColor: tint,
          opacity: opacityRef.current,
          transform: [{ scale: scaleRef.current }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});
