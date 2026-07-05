/**
 * AtlasPanel.tsx
 *
 * The Field Atlas card — shows the living record of the field.
 * Now includes the Field Identity reflection at the top — the
 * land speaking about itself, derived from accumulated moments.
 *
 * Layout:
 *   FIELD ATLAS (whisper label)
 *   ── Field Identity reflection (Georgia italic, the poetic voice) ──
 *   Latest moment card (type dot + timestamp + card text)
 *   Summary line (N moments · mostly calm · N species seen)
 *   Recent moments log (last 3, quiet timestamp + state)
 *
 * Styled to EarthEye design language:
 * - Card component (#1A1A17 surface)
 * - Whisper labels (9px, uppercase, 35% white)
 * - Georgia italic serif for reflection and card text
 * - No exclamation marks, no directives
 */

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useAtlas } from '@/atlas/useAtlas';
import { useFieldIdentity } from '@/atlas/useFieldIdentity';
import type { AtlasCardType } from '@/atlas/fieldMoment';

const CARD_TYPE_COLORS: Partial<Record<AtlasCardType, string>> = {
  yard:     Accents.sage,
  trail:    Accents.sage,
  coastal:  Accents.blue,
  night:    Accents.lavender,
  fallback: Accents.amber,
  field:    'rgba(255,255,255,0.45)',
};

const CARD_TYPE_LABELS: Partial<Record<AtlasCardType, string>> = {
  yard: 'Yard',
  trail: 'Trail',
  coastal: 'Coastal',
  night: 'Night',
  fallback: 'Fallback',
  field: 'Field',
};

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function AtlasPanel() {
  const atlas = useAtlas();
  const identity = useFieldIdentity();

  // No moments yet — quiet empty state
  if (atlas.totalMoments === 0 || !atlas.latest) {
    return (
      <Card>
        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
          FIELD ATLAS
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          No field moments recorded yet. The atlas will grow as the environment changes.
        </ThemedText>
      </Card>
    );
  }

  const latest = atlas.latest;
  const cardColor = CARD_TYPE_COLORS[latest.cardType] ?? 'rgba(255,255,255,0.45)';
  const cardLabel = CARD_TYPE_LABELS[latest.cardType] ?? 'Field';

  // Show up to 3 recent moments (excluding the latest, which is shown in full)
  const recentMoments = atlas.moments.slice(-4, -1).reverse();

  return (
    <Card>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        FIELD ATLAS
      </ThemedText>

      {/* Field Identity — the land speaking about itself */}
      {identity.isEstablished && (
        <View style={styles.identitySection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.identityLabel}>
            {identity.temperamentLabel.toUpperCase()}
          </ThemedText>
          <ThemedText style={styles.identityText}>
            {identity.reflection}
          </ThemedText>
        </View>
      )}

      {/* Latest moment — the poetic card */}
      <View style={styles.latestSection}>
        <View style={styles.cardTypeRow}>
          <View style={[styles.cardTypeDot, { backgroundColor: cardColor }]} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardTypeLabel}>
            {cardLabel}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.timestamp}>
            {formatTime(latest.timestamp)}
          </ThemedText>
        </View>
        <ThemedText style={styles.cardText}>
          {latest.cardText}
        </ThemedText>
      </View>

      {/* Summary line */}
      <ThemedText style={styles.summaryLine}>
        {atlas.summary.summary}
      </ThemedText>

      {/* Recent moments — quiet log */}
      {recentMoments.length > 0 && (
        <View style={styles.recentSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>
            RECENT
          </ThemedText>
          {recentMoments.map((m) => (
            <View key={m.id} style={styles.recentRow}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.recentTime}>
                {formatTime(m.timestamp)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.recentText}>
                {m.fieldState} · {m.cardType}
                {m.invitedCount > 0 && ` · ${m.invitedCount} invited`}
              </ThemedText>
            </View>
          ))}
        </View>
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
  emptyText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.6,
  },
  identitySection: {
    marginBottom: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  identityLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.one,
  },
  identityText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 1.7,
  },
  latestSection: {
    marginBottom: Spacing.two,
  },
  cardTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.two,
  },
  cardTypeLabel: {
    flex: 1,
    lineHeight: 18,
  },
  timestamp: {
    lineHeight: 18,
  },
  cardText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 1.7,
  },
  summaryLine: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.6,
    marginBottom: Spacing.two,
  },
  recentSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: Spacing.two,
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.one,
  },
  recentRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  recentTime: {
    width: 70,
    lineHeight: 18,
  },
  recentText: {
    flex: 1,
    lineHeight: 18,
  },
});
