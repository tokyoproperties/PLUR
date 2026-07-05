/**
 * MicroEcosystemPanel.tsx
 *
 * The "heart" card — shows which species are invited to the current
 * environment and what actions could welcome more. This is where
 * Carson and Jaycie eventually see "what wants to live here."
 *
 * Styled to EarthEye design language:
 * - Card component (#1A1A17 surface)
 * - Whisper label 'MICRO-ECOSYSTEM' (9px, uppercase, 35% white)
 * - Georgia italic serif for species names and summary
 * - Conditions score as a single word, not a badge
 * - Suggested actions in quiet, observational language
 * - No exclamation marks, no directives
 */

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useEcosystem } from '@/ecosystem/useEcosystem';
import type { SuggestedAction } from '@/ecosystem/ecosystem-engine';

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

export function MicroEcosystemPanel() {
  const ecosystem = useEcosystem();
  const conditionsColor = CONDITIONS_COLORS[ecosystem.conditionsScore] ?? Accents.sage;

  // Show up to 3 invited species names
  const visibleSpecies = ecosystem.invitedSpecies.slice(0, 3);
  const remainingCount = ecosystem.invitedSpecies.length - visibleSpecies.length;

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
          {visibleSpecies.map((inv, i) => (
            <ThemedText key={i} style={styles.speciesName}>
              {inv.species.name}
            </ThemedText>
          ))}
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
