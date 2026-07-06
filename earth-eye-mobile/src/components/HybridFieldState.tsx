/**
 * HybridFieldState.tsx
 *
 * The unified field state card for the Home screen — the "one
 * sentence summary" of the world around you. Shows field state,
 * proximity, mode, suggestion, and an intensity bar.
 *
 * Data quality states:
 *   forming — sensors not yet active, quiet placeholder
 *   partial — one sensor active, note shown
 *   live    — both sensors active, full display
 *
 * Mode-aware accent:
 *   PLUR → muted blue intensity bar
 *   LOVE → warm amber intensity bar
 *
 * Styled to EarthEye design language:
 * - Card component (#1A1A17 surface, hairline border)
 * - Whisper label (9px, uppercase, 35% white)
 * - Georgia italic serif for the field state value
 * - Muted body text (rgba 0.70)
 * - Intensity bar using EarthEye accent palette
 * - No exclamation marks, no directives
 *
 * Depth pass (July 6 2026): stat rows now sit in a CardInset panel
 * with hairline row dividers (CardRow), so Proximity/Mode/Suggestion
 * read as a distinct layered group rather than flush with the card
 * background. No shadow, no glow — background contrast only.
 */

import { StyleSheet, View } from 'react-native';

import { Card, CardInset, CardRow } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useHybrid } from '@/hybrid/useHybrid';

const FIELD_STATE_COLORS: Record<string, string> = {
  calm:     Accents.sage,
  bright:   Accents.amber,
  noisy:    Accents.rose,
  still:    Accents.blue,
  mixed:    Accents.rose,
  alert:    Accents.rose,
  dim:      Accents.blue,
  forming:  'rgba(255,255,255,0.25)',
};

const ACCENT_COLORS: Record<string, string> = {
  blue:  Accents.blue,
  amber: Accents.amber,
  sage:  Accents.sage,
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
  const accentColor = ACCENT_COLORS[hybrid.accent] ?? Accents.sage;
  const isForming = hybrid.dataQuality === 'forming';

  // Forming state — quiet placeholder
  if (isForming) {
    return (
      <Card>
        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
          FIELD STATE
        </ThemedText>
        <ThemedText style={styles.formingValue}>
          Forming
        </ThemedText>
        <ThemedText style={styles.formingHint}>
          Sensors not yet active — the field will show its state once readings arrive.
        </ThemedText>
        <CardInset>
          <CardRow noDivider>
            <View style={styles.rowLine}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.rowLabel}>
                Mode
              </ThemedText>
              <ThemedText type="small" style={styles.rowValue}>
                {hybrid.symbolic === 'plur' ? 'PLUR' : 'LOVE'}
              </ThemedText>
            </View>
          </CardRow>
        </CardInset>
      </Card>
    );
  }

  return (
    <Card>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        FIELD STATE{hybrid.dataQuality === 'partial' ? ' · PARTIAL' : ''}
      </ThemedText>

      <ThemedText style={styles.fieldValue}>
        {hybrid.fieldState}
      </ThemedText>

      <CardInset>
        <CardRow noDivider>
          <View style={styles.rowLine}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.rowLabel}>
              Proximity
            </ThemedText>
            <ThemedText type="small" style={styles.rowValue}>
              {PROXIMITY_LABEL[hybrid.proximity] ?? hybrid.proximity}
            </ThemedText>
          </View>
        </CardRow>

        <CardRow>
          <View style={styles.rowLine}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.rowLabel}>
              Mode
            </ThemedText>
            <ThemedText type="small" style={styles.rowValue}>
              {hybrid.symbolic === 'plur' ? 'PLUR' : 'LOVE'}
            </ThemedText>
          </View>
        </CardRow>

        <CardRow>
          <View style={styles.rowLine}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.rowLabel}>
              Suggestion
            </ThemedText>
            <ThemedText type="small" style={styles.rowValue}>
              {SUGGESTION_LABEL[hybrid.suggestion] ?? hybrid.suggestion}
            </ThemedText>
          </View>
        </CardRow>
      </CardInset>

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
                backgroundColor: accentColor,
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
  formingValue: {
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: '400',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.40)',
    marginBottom: Spacing.one,
  },
  formingHint: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 21,
    marginBottom: Spacing.two,
  },
  rowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // RN's default flexShrink is 0 — without it, a long value (e.g.
  // "Stillness suggested") overflows the row instead of wrapping.
  rowLabel: {
    lineHeight: 20,
    flexShrink: 0,
    marginRight: Spacing.two,
  },
  rowValue: {
    lineHeight: 20,
    flexShrink: 1,
    textAlign: 'right',
  },
  intensitySection: {
    marginTop: Spacing.three,
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
