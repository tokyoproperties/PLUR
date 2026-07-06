/**
 * IdentityStrip.tsx
 *
 * Compact identity overlay for the Map screen — shows the soul
 * line and seasonal phase in a quiet strip at the bottom of the
 * map. Connects the map to the same identity layers as Home.
 *
 * Georgia italic soul line + whisper-label season badge.
 * Dark card surface (#1A1A17) with hairline border.
 * pointerEvents none on the container, but the inner card
 * uses pointerEvents auto for potential future interaction.
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { Spacing } from '@/constants/theme';

export function IdentityStrip() {
  const soul = useFieldSoul();
  const seasonal = useSeasonalProfile();

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.card}>
        <View style={styles.seasonRow}>
          <ThemedText style={styles.seasonLabel}>{seasonal.phaseLabel}</ThemedText>
          {seasonal.patternSuffix !== '' && (
            <ThemedText
              style={[
                styles.seasonSuffix,
                seasonal.patternStatus === 'unclear' && styles.seasonUnclear,
              ]}
            >
              {seasonal.patternSuffix}
            </ThemedText>
          )}
        </View>
        <ThemedText
          style={styles.soulLine}
          numberOfLines={2}
        >
          {soul.isEstablished
            ? soul.soulLine
            : 'The field is still becoming.'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 10,
  },
  card: {
    backgroundColor: 'rgba(26, 26, 23, 0.88)',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  seasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  seasonLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: 'rgba(255,255,255,0.50)',
  },
  seasonSuffix: {
    fontSize: 8,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.20)',
    marginLeft: 6,
  },
  seasonUnclear: {
    color: 'rgba(196,151,74,0.35)',
  },
  soulLine: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 1.5,
  },
});
