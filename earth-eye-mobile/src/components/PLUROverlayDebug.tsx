/**
 * PLUROverlayDebug.tsx
 *
 * Temporary debug overlay showing live PLUR overlay engine state.
 * Drop into _layout.tsx below <PLUROverlay /> during development,
 * remove before release.
 *
 * Styled to EarthEye design language: dark card, muted text,
 * whisper label.
 */

import { StyleSheet, View, Text } from 'react-native';

import { usePLUROverlayState } from '@/overlays/plur-overlay-engine';

export function PLUROverlayDebug() {
  const o = usePLUROverlayState();

  return (
    <View style={styles.box} pointerEvents="none">
      <Text style={styles.label}>PLUR OVERLAY</Text>
      <Text style={styles.value}>shade: {o.shade}</Text>
      <Text style={styles.value}>intensity: {o.intensity.toFixed(2)}</Text>
      <Text style={styles.value}>cue: {o.cue}</Text>
      <Text style={styles.value}>{o.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    backgroundColor: '#1A1A17',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  label: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  value: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 12,
    lineHeight: 18,
  },
});
