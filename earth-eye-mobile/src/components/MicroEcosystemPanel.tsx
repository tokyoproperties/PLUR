/**
 * MicroEcosystemPanel.tsx
 *
 * The "heart" card — shows invited species, seasonal context,
 * species arrivals (XIV), habitat zones (XV), and continuity
 * markers from field memory (XVI).
 */

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useEcosystem } from '@/ecosystem/useEcosystem';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { useSpeciesArrival } from '@/ecosystem/useSpeciesArrival';
import { useHabitatZones } from '@/ecosystem/useHabitatZones';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import type { SuggestedAction } from '@/ecosystem/ecosystem-engine';
import type { ArrivalLikelihood } from '@/ecosystem/speciesArrival';
import type { HabitatConfidence } from '@/ecosystem/habitatZones';

const CONDITIONS_COLORS: Record<string, string> = { good: Accents.sage, fair: Accents.amber, poor: Accents.rose };
const ACTION_LABELS: Record<SuggestedAction, string> = {
  'add-native-grass': 'Native grasses would settle here — purple needlegrass is the anchor.',
  'reduce-night-noise': 'Quieter evenings would invite nocturnal species back.',
  'leave-dead-wood': 'Dead wood hosts decomposers — turkey tail and beetles.',
  'add-water-source': 'A shallow water source would invite chorus frogs.',
  'plant-lemonade-berry': 'Lemonade berry would hold this ground — roots run deep.',
  'reduce-light-pollution': 'Less night light would invite bats back to the yard.',
  'preserve-snags': 'Standing dead trees feed and shelter dozens of species.',
};
const ARRIVAL_COLORS: Record<ArrivalLikelihood, string> = {
  high: Accents.sage, moderate: Accents.amber, low: 'rgba(255,255,255,0.35)', dormant: 'rgba(255,255,255,0.20)',
};
const ARRIVAL_LABELS: Record<ArrivalLikelihood, string> = {
  high: 'likely', moderate: 'favorable', low: 'unlikely', dormant: 'dormant',
};
const HABITAT_COLORS: Record<HabitatConfidence, string> = {
  high: Accents.sage, medium: Accents.amber, low: 'rgba(255,255,255,0.30)',
};

export function MicroEcosystemPanel() {
  const ecosystem = useEcosystem();
  const seasonal = useSeasonalProfile();
  const arrivals = useSpeciesArrival();
  const habitats = useHabitatZones();
  const memory = useFieldMemory();
  const conditionsColor = CONDITIONS_COLORS[ecosystem.conditionsScore] ?? Accents.sage;

  const visibleSpecies = ecosystem.invitedSpecies.slice(0, 3);
  const remainingCount = ecosystem.invitedSpecies.length - visibleSpecies.length;
  const inPeakSeason = ecosystem.invitedSpecies.filter((inv) =>
    seasonal.likelySpecies.includes(inv.species.name)
  );
  const visibleArrivals = arrivals.species.filter((s) => s.likelihood !== 'dormant').slice(0, 5);
  const visibleHabitats = habitats.zones.slice(0, 5);

  // Build a lookup of species frequency from field memory
  const frequencyLookup: Record<string, string> = {};
  if (memory.isEstablished) {
    for (const sf of memory.speciesHistory) {
      frequencyLookup[sf.name] = sf.frequencyLabel;
    }
  }

  return (
    <Card>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>MICRO-ECOSYSTEM</ThemedText>
      <ThemedText style={styles.summaryLine}>{ecosystem.summary}</ThemedText>

      <View style={styles.conditionsRow}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.conditionsLabel}>Conditions</ThemedText>
        <ThemedText style={[styles.conditionsValue, { color: conditionsColor }]}>{ecosystem.conditionsScore}</ThemedText>
      </View>

      {/* Invited species */}
      {visibleSpecies.length > 0 ? (
        <View style={styles.speciesSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>INVITED</ThemedText>
          {visibleSpecies.map((inv, i) => {
            const isPeak = seasonal.likelySpecies.includes(inv.species.name);
            const freq = frequencyLookup[inv.species.name];
            return (
              <ThemedText key={i} style={styles.speciesName}>
                {inv.species.name}
                {isPeak && <ThemedText style={styles.peakNote}> — peak season</ThemedText>}
                {freq && !isPeak && <ThemedText style={styles.freqNote}> — {freq}</ThemedText>}
              </ThemedText>
            );
          })}
          {remainingCount > 0 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.remainingText}>+{remainingCount} more</ThemedText>
          )}
        </View>
      ) : (
        <ThemedText style={styles.emptyText}>No species invited at current conditions.</ThemedText>
      )}

      {/* Seasonal context */}
      {inPeakSeason.length > 0 && (
        <View style={styles.seasonalSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>{seasonal.phaseLabel.toUpperCase()} CANON</ThemedText>
          <ThemedText style={styles.seasonalText}>{seasonal.fieldRhythm}</ThemedText>
        </View>
      )}

      {/* Species Arrival — Phase XIV */}
      {visibleArrivals.length > 0 && (
        <View style={styles.arrivalSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>SPECIES ARRIVAL</ThemedText>
          {visibleArrivals.map((arrival, i) => {
            const freq = frequencyLookup[arrival.name];
            return (
              <View key={i} style={styles.arrivalRow}>
                <View style={[styles.dot, { backgroundColor: ARRIVAL_COLORS[arrival.likelihood] }]} />
                <ThemedText style={styles.arrivalName}>{arrival.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.arrivalLikelihood}>
                  {ARRIVAL_LABELS[arrival.likelihood]}{freq ? ` · ${freq}` : ''}
                </ThemedText>
              </View>
            );
          })}
          {arrivals.imminent.length > 0 && (
            <ThemedText style={styles.arrivalNote}>{arrivals.headline}</ThemedText>
          )}
        </View>
      )}

      {/* Habitat Zones — Phase XV */}
      {visibleHabitats.length > 0 && (
        <View style={styles.habitatSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>HABITAT ZONES</ThemedText>
          {visibleHabitats.map((zone, i) => (
            <View key={i} style={styles.habitatRow}>
              <View style={[styles.dot, { backgroundColor: HABITAT_COLORS[zone.confidence] }]} />
              <ThemedText style={styles.habitatLabel}>{zone.label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.habitatAffinity}>
                {zone.speciesAffinity.length > 1 ? `${zone.speciesAffinity[0]} +${zone.speciesAffinity.length - 1}` : zone.speciesAffinity[0]}
              </ThemedText>
            </View>
          ))}
          {habitats.primary && (
            <ThemedText style={styles.habitatNote}>{habitats.primary.description}</ThemedText>
          )}
        </View>
      )}

      {/* Field Memory continuity — Phase XVI */}
      {memory.isEstablished && memory.currentChapter && (
        <View style={styles.memorySection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>FIELD MEMORY</ThemedText>
          <ThemedText style={styles.memoryText}>{memory.memoryLine}</ThemedText>
          {memory.chapters.length > 1 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.chapterCount}>
              {memory.chapters.length} chapters in memory · {memory.totalMoments} moments recorded
            </ThemedText>
          )}
        </View>
      )}

      {/* Suggested actions */}
      {ecosystem.suggestedActions.length > 0 && (
        <View style={styles.actionsSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>WHAT WOULD HELP</ThemedText>
          {ecosystem.suggestedActions.slice(0, 2).map((action, i) => (
            <ThemedText key={i} style={styles.actionText}>{ACTION_LABELS[action] ?? action}</ThemedText>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: Spacing.two },
  summaryLine: { fontSize: 15, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, marginBottom: Spacing.two },
  conditionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two },
  conditionsLabel: { lineHeight: 20 },
  conditionsValue: { fontSize: 18, fontFamily: 'Georgia', fontWeight: '400', fontStyle: 'italic' },
  speciesSection: { marginBottom: Spacing.two },
  subLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: Spacing.one },
  speciesName: { fontSize: 15, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.88)', lineHeight: 1.7 },
  peakNote: { fontSize: 12, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(122,184,122,0.70)' },
  freqNote: { fontSize: 12, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(196,151,74,0.60)' },
  remainingText: { marginTop: 2 },
  emptyText: { fontSize: 15, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: Spacing.two },
  seasonalSection: { marginTop: Spacing.two, paddingTop: Spacing.two, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  seasonalText: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 },
  arrivalSection: { marginTop: Spacing.two, paddingTop: Spacing.two, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  arrivalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: Spacing.two },
  arrivalName: { flex: 1, fontSize: 14, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.78)', lineHeight: 20 },
  arrivalLikelihood: { fontSize: 12, fontStyle: 'italic', lineHeight: 20 },
  arrivalNote: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, marginTop: Spacing.one },
  habitatSection: { marginTop: Spacing.two, paddingTop: Spacing.two, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  habitatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  habitatLabel: { flex: 1, fontSize: 14, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.78)', lineHeight: 20 },
  habitatAffinity: { fontSize: 12, fontStyle: 'italic', lineHeight: 20 },
  habitatNote: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, marginTop: Spacing.one },
  memorySection: { marginTop: Spacing.two, paddingTop: Spacing.two, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  memoryText: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(196,151,74,0.55)', lineHeight: 1.6 },
  chapterCount: { fontSize: 11, fontStyle: 'italic', marginTop: 4, opacity: 0.7 },
  actionsSection: { marginTop: Spacing.two },
  actionText: { fontSize: 13, fontFamily: 'Georgia', fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginTop: 4 },
});
