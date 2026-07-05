/**
 * HybridFieldState.tsx
 *
 * The unified field state card for the Home screen — the "one
 * sentence summary" of the world around you. Shows field state,
 * proximity, mode, suggestion, and an intensity bar.
 *
 * Styled to EarthEye design language:
 * - Card component (#1A1A17 surface)
 * - Whisper label (9px, uppercase, 35% white)
 * - Georgia italic serif for the field state value
 * - Muted body text (rgba 0.70)
 * - Intensity bar using EarthEye accent palette
 * - No exclamation marks, no directives
 */

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useHybrid } from '@/hybrid/useHybrid';

const FIELD_STATE_COLORS: Record<string, string> = {
  calm:   Accents.sage,
  bright: Accents.amber,
  noisy:  Accents.rose,
  still:  Accents.blue,
  mixed:  Accents.rose,
  alert:  Accents.rose,
  dim:    Accents.blue,
};

const PROXIMITY_LABEL: Record<string, string> = {
  'in-yard': 'In yard',
  'near-yard': 'Near yard',
  'near-trail': 'Near trail',
  'field': 'Out in field',
  'unknown': 'No GPS lock',
};

const SUGGESTION_LABEL: Record<string, string> = {
  stillness: 'Stillness suggested',
  explore: 'Explore',
  quiet: 'Quiet',
  none: '—',
};

export function HybridFieldStateCard() {
  const hybrid = useHybrid();
  const stateColor = FIELD_STATE_COLORS[hybrid.fieldState] ?? Accents.sage;

  return (
    <Card>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        FIELD STATE
      </ThemedText>

      <ThemedText style={styles.fieldValue}>
        {hybrid.fieldState}
      </ThemedText>

      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.rowLabel}>
          Proximity
        </ThemedText>
        <ThemedText type="small" style={styles.rowValue}>
          {PROXIMITY_LABEL[hybrid.proximity] ?? hybrid.proximity}
        </ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.rowLabel}>
          Mode
        </ThemedText>
        <ThemedText type="small" style={styles.rowValue}>
          {hybrid.symbolic === 'plur' ? 'PLUR' : 'LOVE'}
        </ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.rowLabel}>
          Suggestion
        </ThemedText>
        <ThemedText type="small" style={styles.rowValue}>
          {SUGGESTION_LABEL[hybrid.suggestion] ?? hybrid.suggestion}
        </ThemedText>
      </View>

      <View style={styles.intensitySection}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.rowLabel}>
          Intensity
        </ThemedText>
        <View style={styles.barOuter}>
          <View
            style={[
              styles.barInner,
              {
                width: `${Math.round(hybrid.intensity * 100)}%`,
                backgroundColor: stateColor,
              },
            ]}
          />
        </View>
      </View>
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
  fieldValue: {
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: '400',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.90)',
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  rowLabel: {
    lineHeight: 20,
  },
  rowValue: {
    lineHeight: 20,
  },
  intensitySection: {
    marginTop: Spacing.two,
  },
  barOuter: {
    marginTop: Spacing.half,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barInner: {
    height: 4,
    borderRadius: 2,
  },
});
