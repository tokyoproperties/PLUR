/**
 * AtlasPanel.tsx
 *
 * The Field Atlas card — the complete cosmology of place.
 * Phases XI-XX: Identity, Seasonal Intelligence, Corridor Drift,
 * Species Arrival, Habitat Zones, Field Memory, Field Mythology,
 * Field Lore, Field Spirit, and Field Continuity.
 *
 * Layout:
 *   FIELD ATLAS → Season → Identity → Rhythm → Drift → Arrival →
 *   Habitat → Memory → Mythology → Spirit → Lore → Continuity →
 *   Moment → Summary → Log
 */

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useAtlas } from '@/atlas/useAtlas';
import { useFieldIdentity } from '@/atlas/useFieldIdentity';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { useCorridorDrift } from '@/corridor/useCorridorDrift';
import { useSpeciesArrival } from '@/ecosystem/useSpeciesArrival';
import { useHabitatZones } from '@/ecosystem/useHabitatZones';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldMythology } from '@/atlas/useFieldMythology';
import { useFieldSpirit } from '@/atlas/useFieldSpirit';
import { useFieldLore } from '@/atlas/useFieldLore';
import { useFieldContinuity } from '@/atlas/useFieldContinuity';
import type { AtlasCardType } from '@/atlas/fieldMoment';

const CARD_TYPE_COLORS: Partial<Record<AtlasCardType, string>> = {
  yard: Accents.sage, trail: Accents.sage, coastal: Accents.blue,
  night: Accents.lavender, fallback: Accents.amber, field: 'rgba(255,255,255,0.45)',
};
const CARD_TYPE_LABELS: Partial<Record<AtlasCardType, string>> = {
  yard: 'Yard', trail: 'Trail', coastal: 'Coastal',
  night: 'Night', fallback: 'Fallback', field: 'Field',
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h >= 12 ? 'pm' : 'am'}`;
}

export function AtlasPanel() {
  const atlas = useAtlas();
  const identity = useFieldIdentity();
  const seasonal = useSeasonalProfile();
  const drift = useCorridorDrift();
  const arrivals = useSpeciesArrival();
  const habitats = useHabitatZones();
  const memory = useFieldMemory();
  const mythology = useFieldMythology();
  const spirit = useFieldSpirit();
  const lore = useFieldLore();
  const continuity = useFieldContinuity();

  if (atlas.totalMoments === 0 || !atlas.latest) {
    return (
      <Card>
        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>FIELD ATLAS</ThemedText>
        <ThemedText style={styles.emptyText}>No field moments recorded yet. The atlas will grow as the environment changes.</ThemedText>
      </Card>
    );
  }

  const latest = atlas.latest;
  const cardColor = CARD_TYPE_COLORS[latest.cardType] ?? 'rgba(255,255,255,0.45)';
  const cardLabel = CARD_TYPE_LABELS[latest.cardType] ?? 'Field';
  const recentMoments = atlas.moments.slice(-4, -1).reverse();

  return (
    <Card>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>FIELD ATLAS</ThemedText>

      <View style={styles.seasonalRow}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.seasonalLabel}>
          {seasonal.phaseLabel.toUpperCase()}
        </ThemedText>
        {seasonal.patternConfirmed && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.confirmedText}>pattern confirmed</ThemedText>
        )}
      </View>

      {identity.isEstablished && (
        <View style={styles.identitySection}>
          <ThemedText style={styles.identityText}>{identity.reflection}</ThemedText>
        </View>
      )}

      <ThemedText style={styles.rhythmLine}>{seasonal.fieldRhythm}</ThemedText>
      {drift.isAssessed && <ThemedText style={styles.driftLine}>{drift.description}</ThemedText>}
      {arrivals.imminent.length > 0 && <ThemedText style={styles.arrivalLine}>{arrivals.atlasLine}</ThemedText>}
      {habitats.isAssessed && habitats.primary && <ThemedText style={styles.habitatLine}>{habitats.atlasLine}</ThemedText>}
      {memory.isEstablished && <ThemedText style={styles.memoryLine}>{memory.memoryLine}</ThemedText>}
      {mythology.isEstablished && <ThemedText style={styles.mythologyLine}>{mythology.mythologyLine}</ThemedText>}
      {spirit.isEstablished && <ThemedText style={styles.spiritLine}>{spirit.spiritLine}</ThemedText>}
      {lore.isEstablished && <ThemedText style={styles.loreLine}>{lore.loreLine}</ThemedText>}
      {continuity.isEstablished && <ThemedText style={styles.continuityLine}>{continuity.continuityLine}</ThemedText>}

      <View style={styles.latestSection}>
        <View style={styles.cardTypeRow}>
          <View style={[styles.cardTypeDot, { backgroundColor: cardColor }]} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.cardTypeLabel}>{cardLabel}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.timestamp}>{formatTime(latest.timestamp)}</ThemedText>
        </View>
        <ThemedText style={styles.cardText}>{latest.cardText}</ThemedText>
      </View>

      <ThemedText style={styles.summaryLine}>{atlas.summary.summary}</ThemedText>

      {recentMoments.length > 0 && (
        <View style={styles.recentSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>RECENT</ThemedText>
          {recentMoments.map((m) => (
            <View key={m.id} style={styles.recentRow}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.recentTime}>{formatTime(m.timestamp)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.recentText}>
                {m.fieldState} · {m.cardType}{m.invitedCount > 0 && ` · ${m.invitedCount} invited`}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: Spacing.two },
  emptyText: { fontSize: 15, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 },
  seasonalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.one },
  seasonalLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 },
  confirmedText: { fontSize: 9, fontStyle: 'italic', opacity: 0.6 },
  identitySection: { marginBottom: Spacing.two, paddingBottom: Spacing.two, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  identityText: { fontSize: 15, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 },
  rhythmLine: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 6 },
  driftLine: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, marginBottom: 6 },
  arrivalLine: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(122,184,122,0.60)', lineHeight: 1.6, marginBottom: 6 },
  habitatLine: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(122,154,184,0.60)', lineHeight: 1.6, marginBottom: 6 },
  memoryLine: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(196,151,74,0.55)', lineHeight: 1.6, marginBottom: 6 },
  mythologyLine: { fontSize: 14, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 6 },
  spiritLine: { fontSize: 15, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(154,122,184,0.80)', lineHeight: 1.7, marginBottom: 6 },
  loreLine: { fontSize: 14, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(196,151,74,0.65)', lineHeight: 1.7, marginBottom: 6 },
  continuityLine: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(154,122,184,0.55)', lineHeight: 1.6, marginBottom: Spacing.two },
  latestSection: { marginBottom: Spacing.two },
  cardTypeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardTypeDot: { width: 6, height: 6, borderRadius: 3, marginRight: Spacing.two },
  cardTypeLabel: { flex: 1, lineHeight: 18 },
  timestamp: { lineHeight: 18 },
  cardText: { fontSize: 15, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 },
  summaryLine: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: Spacing.two },
  recentSection: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: Spacing.two },
  subLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: Spacing.one },
  recentRow: { flexDirection: 'row', paddingVertical: 3 },
  recentTime: { width: 70, lineHeight: 18 },
  recentText: { flex: 1, lineHeight: 18 },
});
