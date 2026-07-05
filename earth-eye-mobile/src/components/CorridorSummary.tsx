/**
 * CorridorSummary.tsx
 *
 * A compact card for the Home screen showing the current corridor
 * awareness state, now including corridor drift (Phase XIII).
 *
 * Styled to EarthEye design language:
 * - dark card surface (#1A1A17)
 * - whisper label (9px, uppercase, 35% white)
 * - muted body text (rgba 0.70)
 * - Georgia serif for tone value and drift note
 * - no exclamation marks, no directives
 */

import { StyleSheet } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useCorridor } from '@/corridor/useCorridor';
import { useCorridorDrift } from '@/corridor/useCorridorDrift';

const PROXIMITY_LABEL: Record<string, string> = {
  'in-yard': 'In yard corridor',
  'near-yard': 'Near yard',
  'near-trail': 'Near a trail',
  'field': 'Out in the field',
  'unknown': 'No GPS lock',
};

export function CorridorSummary() {
  const corridor = useCorridor();
  const drift = useCorridorDrift();

  return (
    <Card>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        CORRIDOR AWARENESS
      </ThemedText>

      <ThemedText type="smallBold" style={styles.proximity}>
        {PROXIMITY_LABEL[corridor.proximity] ?? 'Unknown'}
      </ThemedText>

      {corridor.nearestTrailName && corridor.nearestTrailDistanceMeters !== null && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.line}>
          Nearest trail: {corridor.nearestTrailName} ({Math.round(corridor.nearestTrailDistanceMeters)}m)
        </ThemedText>
      )}

      <ThemedText type="small" themeColor="textSecondary" style={styles.line}>
        Yard corridor: {corridor.inYardCorridor ? 'active' : 'inactive'}
      </ThemedText>

      <ThemedText style={styles.toneValue}>
        {corridor.tone}
      </ThemedText>

      {corridor.suggestStillness && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.line}>
          Stillness suggested — ease up.
        </ThemedText>
      )}

      {/* Corridor drift — Phase XIII */}
      {drift.isAssessed && (
        <ThemedText style={styles.driftNote}>
          {drift.description}
        </ThemedText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.two,
  },
  proximity: {
    marginBottom: Spacing.one,
  },
  line: {
    marginTop: Spacing.half,
    lineHeight: 20,
  },
  toneValue: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: '400',
    color: 'rgba(255,255,255,0.90)',
    marginTop: Spacing.one,
    fontStyle: 'italic',
  },
  driftNote: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.6,
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
});
