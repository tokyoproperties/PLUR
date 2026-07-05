/**
 * EmergencyBanner.tsx
 *
 * A small, calm banner shown at the top of the Home screen when
 * EarthEye enters fallback mode. No red flashing, no panic —
 * just a quiet acknowledgment that the app is conserving and
 * focusing on what matters.
 *
 * Styled to EarthEye design language:
 * - Subtle amber tint (not red, not alarming)
 * - Whisper-weight text
 * - Georgia italic for the reason line
 * - Disappears entirely when not in fallback mode (returns null)
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEmergency } from '@/emergency/useEmergency';

export function EmergencyBanner() {
  const emergency = useEmergency();

  // No banner when not in fallback mode — the absence IS the signal
  if (!emergency.fallbackMode) return null;

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        EMERGENCY FALLBACK
      </ThemedText>
      <ThemedText style={styles.reason}>
        {emergency.reason ?? 'Running in low-bandwidth mode.'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(196, 151, 74, 0.10)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(196, 151, 74, 0.20)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  reason: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.5,
  },
});
