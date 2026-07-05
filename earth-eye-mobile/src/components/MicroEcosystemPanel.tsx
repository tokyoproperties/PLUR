/**
 * MicroEcosystemPanel.tsx
 *
 * The "heart" card — shows which species are invited, what actions
 * could welcome more, seasonal context (Phase XII), and species
 * arrival likelihoods (Phase XIV).
 *
 * Styled to EarthEye design language:
 * - Card component (#1A1A17 surface)
 * - Whisper labels (9px, uppercase, 35% white)
 * - Georgia italic serif for species names and summaries
 * - Arrival likelihood shown with quiet color dots
 * - No exclamation marks, no directives
 */

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useEcosystem } from '@/ecosystem/useEcosystem';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { useSpeciesArrival } from '@/ecosystem/useSpeciesArrival';
import type { SuggestedAction } from '@/ecosystem/ecosystem-engine';
import type { ArrivalLikelihood } from '@/ecosystem/speciesArrival';

const CONDITIONS_COLORS: Record<string, string> = {
  good: Accents.sage,
  fair: Accents.amber,
  poor: Accents.rose,
};

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
  high: Accents.sage,
  moderate: Accents.amber,
  low: 'rgba(255,255,255,0.35)',
  dormant: 'rgba(255,255,255,0.20)',
};

const ARRIVAL_LABELS: Record<ArrivalLikelihood, string> = {
  high: 'likely',
  moderate: 'favorable',
  low: 'unlikely',
  dormant: 'dormant',
};

export function MicroEcosystemPanel() {
  const ecosystem = useEcosystem();
  const seasonal = useSeasonalProfile();
  const arrivals = useSpeciesArrival();
  const conditionsColor = CONDITIONS_COLORS[ecosystem.conditionsScore] ?? Accents.sage;

  const visibleSpecies = ecosystem.invitedSpecies.slice(0, 3);
  const remainingCount = ecosystem.invitedSpecies.length - visibleSpecies.length;

  const inPeakSeason = ecosystem.invitedSpecies.filter((inv) =>
    seasonal.likelySpecies.includes(inv.species.name)
  );

  // Show top 5 arrival assessments (skip dormant for brevity)
  const visibleArrivals = arrivals.species.filter((s) => s.likelihood !== 'dormant').slice(0, 5);

  return (
    <Card>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        MICRO-ECOSYSTEM
      </ThemedText>

      <ThemedText style={styles.summaryLine}>
        {ecosystem.summary}
      </ThemedText>

      <View style={styles.conditionsRow}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.conditionsLabel}>
          Conditions
        </ThemedText>
        <ThemedText style={[styles.conditionsValue, { color: conditionsColor }]}>
          {ecosystem.conditionsScore}
        </ThemedText>
      </View>

      {visibleSpecies.length > 0 ? (
        <View style={styles.speciesSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>
            INVITED
          </ThemedText>
          {visibleSpecies.map((inv, i) => {
            const isPeak = seasonal.likelySpecies.includes(inv.species.name);
            return (
              <ThemedText key={i} style={styles.speciesName}>
                {inv.species.name}
                {isPeak && (
                  <ThemedText style={styles.peakNote}> — peak season</ThemedText>
                )}
              </ThemedText>
            );
          })}
          {remainingCount > 0 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.remainingText}>
              +{remainingCount} more
            </ThemedText>
          )}
        </View>
      ) : (
        <ThemedText style={styles.emptyText}>
          No species invited at current conditions.
        </ThemedText>
      )}

      {/* Seasonal context */}
      {inPeakSeason.length > 0 && (
        <View style={styles.seasonalSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>
            {seasonal.phaseLabel.toUpperCase()} CANON
          </ThemedText>
          <ThemedText style={styles.seasonalText}>
            {seasonal.fieldRhythm}
          </ThemedText>
        </View>
      )}

      {/* Species Arrival — Phase XIV */}
      {visibleArrivals.length > 0 && (
        <View style={styles.arrivalSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>
            SPECIES ARRIVAL
          </ThemedText>
          {visibleArrivals.map((arrival, i) => (
            <View key={i} style={styles.arrivalRow}>
              <View style={[styles.arrivalDot, { backgroundColor: ARRIVAL_COLORS[arrival.likelihood] }]} />
              <ThemedText style={styles.arrivalName}>
                {arrival.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.arrivalLikelihood}>
                {ARRIVAL_LABELS[arrival.likelihood]}
              </ThemedText>
            </View>
          ))}
          {arrivals.imminent.length > 0 && (
            <ThemedText style={styles.arrivalNote}>
              {arrivals.headline}
            </ThemedText>
          )}
        </View>
      )}

      {ecosystem.suggestedActions.length > 0 && (
        <View style={styles.actionsSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subLabel}>
            WHAT WOULD HELP
          </ThemedText>
          {ecosystem.suggestedActions.slice(0, 2).map((action, i) => (
            <ThemedText key={i} style={styles.actionText}>
              {ACTION_LABELS[action] ?? action}
            </ThemedText>
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
  summaryLine: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 1.6,
    marginBottom: Spacing.two,
  },
  conditionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  conditionsLabel: {
    lineHeight: 20,
  },
  conditionsValue: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  speciesSection: {
    marginBottom: Spacing.two,
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.one,
  },
  speciesName: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 1.7,
  },
  peakNote: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(122,184,122,0.70)',
  },
  remainingText: {
    marginTop: 2,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.6,
    marginBottom: Spacing.two,
  },
  seasonalSection: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  seasonalText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.6,
  },
  arrivalSection: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  arrivalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.two,
  },
  arrivalName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 20,
  },
  arrivalLikelihood: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  arrivalNote: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.60)',
    lineHeight: 1.6,
    marginTop: Spacing.one,
  },
  actionsSection: {
    marginTop: Spacing.two,
  },
  actionText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.7,
    marginTop: 4,
  },
});
