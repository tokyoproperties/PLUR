/**
 * MicroEcosystemPanel.tsx
 *
 * The "heart" card — the living organism of the field.
 * Species, seasonal context, arrivals, habitat zones,
 * memory, continuity, mythology, lore, spirit, and soul.
 *
 * Sections fade in with staggered delays — life emerging:
 *   Summary (0ms) → Species (100ms) → Seasonal (200ms) →
 *   Arrivals (300ms) → Habitat (380ms) → Memory (460ms) →
 *   Continuity (540ms) → Mythology (620ms) → Soul (720ms) →
 *   Spirit (820ms) → Lore (920ms) → Actions (1020ms)
 *
 * Visual hierarchy (biological, not cosmological):
 *   Soul 17px > Spirit 16px > Mythology 15px > Species 15px >
 *   Lore 14px > Continuity 15px > Memory 13px > Habitat 14px >
 *   Arrivals 14px > Summary 15px > Actions 13px
 */

import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useEcosystem } from '@/ecosystem/useEcosystem';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { useSpeciesArrival } from '@/ecosystem/useSpeciesArrival';
import { useHabitatZones } from '@/ecosystem/useHabitatZones';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldContinuity } from '@/atlas/useFieldContinuity';
import { useFieldMythology } from '@/atlas/useFieldMythology';
import { useFieldLore } from '@/atlas/useFieldLore';
import { useFieldSpirit } from '@/atlas/useFieldSpirit';
import { useFieldSoul } from '@/atlas/useFieldSoul';
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

// Staggered fade-in presets — life emerging
const FADE_SUMMARY = FadeIn.duration(400).delay(0);
const FADE_SPECIES = FadeIn.duration(400).delay(100);
const FADE_SEASONAL = FadeIn.duration(400).delay(200);
const FADE_ARRIVALS = FadeIn.duration(400).delay(300);
const FADE_HABITAT = FadeIn.duration(400).delay(380);
const FADE_MEMORY = FadeIn.duration(400).delay(460);
const FADE_CONTINUITY = FadeIn.duration(400).delay(540);
const FADE_MYTHOLOGY = FadeIn.duration(500).delay(620);
const FADE_SOUL = FadeIn.duration(600).delay(720);
const FADE_SPIRIT = FadeIn.duration(500).delay(820);
const FADE_LORE = FadeIn.duration(400).delay(920);
const FADE_ACTIONS = FadeIn.duration(400).delay(1020);

export function MicroEcosystemPanel() {
  const ecosystem = useEcosystem();
  const seasonal = useSeasonalProfile();
  const arrivals = useSpeciesArrival();
  const habitats = useHabitatZones();
  const memory = useFieldMemory();
  const continuity = useFieldContinuity();
  const mythology = useFieldMythology();
  const lore = useFieldLore();
  const spirit = useFieldSpirit();
  const soul = useFieldSoul();
  const conditionsColor = CONDITIONS_COLORS[ecosystem.conditionsScore] ?? Accents.sage;

  const visibleSpecies = ecosystem.invitedSpecies.slice(0, 3);
  const remainingCount = ecosystem.invitedSpecies.length - visibleSpecies.length;
  const inPeakSeason = ecosystem.invitedSpecies.filter((inv) =>
    seasonal.likelySpecies.includes(inv.species.name)
  );
  const visibleArrivals = arrivals.species.filter((s) => s.likelihood !== 'dormant').slice(0, 5);
  const visibleHabitats = habitats.zones.slice(0, 5);

  const frequencyLookup: Record<string, string> = {};
  if (memory.isEstablished) {
    for (const sf of memory.speciesHistory) frequencyLookup[sf.name] = sf.frequencyLabel;
  }
  const continuityLookup: Record<string, string> = {};
  if (continuity.isEstablished) {
    for (const sc of continuity.speciesContinuity) continuityLookup[sc.name] = sc.continuityLabel;
  }
  const mythicRoleLookup: Record<string, string> = {};
  if (mythology.isEstablished) {
    for (const sr of mythology.speciesRoles) {
      if (sr.isEarned) mythicRoleLookup[sr.name] = sr.roleLabel;
    }
  }
  const loreLookup: Record<string, string> = {};
  if (lore.isEstablished) {
    for (const sl of lore.speciesLore) loreLookup[sl.name] = sl.loreText;
  }

  return (
    <Card style={styles.panelCard}>
      {/* Summary + Conditions */}
      <Animated.View entering={FADE_SUMMARY}>
        <ThemedText style={styles.whisper}>MICRO-ECOSYSTEM</ThemedText>
        <ThemedText style={styles.summaryLine}>{ecosystem.summary}</ThemedText>

        <View style={styles.conditionsRow}>
          <ThemedText style={styles.conditionsLabel}>Conditions</ThemedText>
          <ThemedText style={[styles.conditionsValue, { color: conditionsColor }]}>{ecosystem.conditionsScore}</ThemedText>
        </View>
      </Animated.View>

      {/* Invited Species */}
      {visibleSpecies.length > 0 ? (
        <Animated.View entering={FADE_SPECIES} style={styles.section}>
          <ThemedText style={styles.subLabel}>INVITED</ThemedText>
          {visibleSpecies.map((inv, i) => {
            const isPeak = seasonal.likelySpecies.includes(inv.species.name);
            const myth = mythicRoleLookup[inv.species.name];
            const loreText = loreLookup[inv.species.name];
            const freq = frequencyLookup[inv.species.name];
            const cont = continuityLookup[inv.species.name];
            return (
              <View key={i}>
                <ThemedText style={styles.speciesName}>
                  {inv.species.name}
                  {myth && <ThemedText style={styles.mythNote}> — {myth}</ThemedText>}
                  {!myth && isPeak && <ThemedText style={styles.peakNote}> — peak season</ThemedText>}
                  {!myth && !isPeak && cont && <ThemedText style={styles.contNote}> — {cont}</ThemedText>}
                  {!myth && !isPeak && !cont && freq && <ThemedText style={styles.freqNote}> — {freq}</ThemedText>}
                </ThemedText>
                <ThemedText style={styles.speciesLatin}>{inv.species.scientificName}</ThemedText>
                <ThemedText style={styles.speciesReason}>{inv.reason}</ThemedText>
                {loreText && <ThemedText style={styles.loreChip}>{loreText}</ThemedText>}
              </View>
            );
          })}
          {remainingCount > 0 && (
            <ThemedText style={styles.remainingText}>+{remainingCount} more</ThemedText>
          )}
        </Animated.View>
      ) : (
        <Animated.View entering={FADE_SPECIES} style={styles.section}>
          <ThemedText style={styles.emptyText}>No species invited at current conditions.</ThemedText>
        </Animated.View>
      )}

      {/* Seasonal Canon */}
      {inPeakSeason.length > 0 && (
        <Animated.View entering={FADE_SEASONAL} style={styles.section}>
          <ThemedText style={styles.subLabel}>{seasonal.phaseLabel.toUpperCase()} CANON</ThemedText>
          <ThemedText style={styles.seasonalText}>{seasonal.fieldRhythm}</ThemedText>
        </Animated.View>
      )}

      {/* Species Arrivals */}
      {visibleArrivals.length > 0 && (
        <Animated.View entering={FADE_ARRIVALS} style={styles.section}>
          <ThemedText style={styles.subLabel}>SPECIES ARRIVAL</ThemedText>
          {visibleArrivals.map((arrival, i) => {
            const myth = mythicRoleLookup[arrival.name];
            const cont = continuityLookup[arrival.name];
            const freq = frequencyLookup[arrival.name];
            const suffix = myth || cont || freq;
            return (
              <View key={i} style={styles.arrivalRow}>
                <View style={[styles.dot, { backgroundColor: ARRIVAL_COLORS[arrival.likelihood] }]} />
                <ThemedText style={styles.arrivalName}>{arrival.name}</ThemedText>
                <ThemedText style={styles.arrivalLikelihood}>
                  {ARRIVAL_LABELS[arrival.likelihood]}{suffix ? ` · ${suffix}` : ''}
                </ThemedText>
              </View>
            );
          })}
          {arrivals.imminent.length > 0 && <ThemedText style={styles.arrivalNote}>{arrivals.headline}</ThemedText>}
        </Animated.View>
      )}

      {/* Habitat Zones */}
      {visibleHabitats.length > 0 && (
        <Animated.View entering={FADE_HABITAT} style={styles.section}>
          <ThemedText style={styles.subLabel}>HABITAT ZONES</ThemedText>
          {visibleHabitats.map((zone, i) => (
            <View key={i} style={styles.habitatRow}>
              <View style={[styles.dot, { backgroundColor: HABITAT_COLORS[zone.confidence] }]} />
              <ThemedText style={styles.habitatLabel}>{zone.label}</ThemedText>
              <ThemedText style={styles.habitatAffinity}>
                {zone.speciesAffinity.length > 1 ? `${zone.speciesAffinity[0]} +${zone.speciesAffinity.length - 1}` : zone.speciesAffinity[0]}
              </ThemedText>
            </View>
          ))}
          {habitats.primary && <ThemedText style={styles.habitatNote}>{habitats.primary.description}</ThemedText>}
        </Animated.View>
      )}

      {/* Field Memory */}
      {memory.isEstablished && memory.currentChapter && (
        <Animated.View entering={FADE_MEMORY} style={styles.section}>
          <ThemedText style={styles.subLabel}>FIELD MEMORY</ThemedText>
          <ThemedText style={styles.memoryText}>{memory.memoryLine}</ThemedText>
          {memory.chapters.length > 1 && (
            <ThemedText style={styles.chapterCount}>
              {memory.chapters.length} chapters · {memory.totalMoments} moments
            </ThemedText>
          )}
        </Animated.View>
      )}

      {/* Field Continuity */}
      {continuity.isEstablished && (
        <Animated.View entering={FADE_CONTINUITY} style={styles.section}>
          <ThemedText style={styles.subLabel}>FIELD CONTINUITY</ThemedText>
          <ThemedText style={styles.continuityArc}>{continuity.arcLabel}</ThemedText>
          <ThemedText style={styles.continuityText}>{continuity.continuityLine}</ThemedText>
        </Animated.View>
      )}

      {/* Field Mythology */}
      {mythology.isEstablished && (
        <Animated.View entering={FADE_MYTHOLOGY} style={styles.section}>
          <ThemedText style={styles.subLabel}>FIELD MYTHOLOGY</ThemedText>
          <ThemedText style={styles.mythArc}>{mythology.archetype.label}</ThemedText>
          <ThemedText style={styles.mythText}>{mythology.mythologyLine}</ThemedText>
        </Animated.View>
      )}

      {/* Field Soul — the capstone */}
      {soul.isEstablished && (
        <Animated.View entering={FADE_SOUL} style={styles.soulSection}>
          <ThemedText style={styles.subLabel}>FIELD SOUL</ThemedText>
          <ThemedText style={styles.soulName}>{soul.name}</ThemedText>
          <ThemedText style={styles.soulText}>{soul.soulLine}</ThemedText>
          <View style={styles.rootTraitsRow}>
            <ThemedText style={styles.rootChip}>{soul.traits.rootTone}</ThemedText>
            <ThemedText style={styles.rootChip}>{soul.traits.rootMovement}</ThemedText>
            <ThemedText style={styles.rootChip}>{soul.traits.rootSeasonLabel}</ThemedText>
          </View>
          {soul.traits.rootAnchor && (
            <ThemedText style={styles.rootAnchor}>root anchor — {soul.traits.rootAnchor}</ThemedText>
          )}
          {soul.traits.rootHabitat && (
            <ThemedText style={styles.rootHabitat}>root habitat — {soul.traits.rootHabitat}</ThemedText>
          )}
        </Animated.View>
      )}

      {/* Field Spirit */}
      {spirit.isEstablished && (
        <Animated.View entering={FADE_SPIRIT} style={styles.spiritSection}>
          <ThemedText style={styles.subLabel}>FIELD SPIRIT</ThemedText>
          <ThemedText style={styles.spiritName}>{spirit.name}</ThemedText>
          <ThemedText style={styles.spiritText}>{spirit.spiritLine}</ThemedText>
          <View style={styles.traitsRow}>
            <ThemedText style={styles.traitChip}>{spirit.traits.temperament}</ThemedText>
            <ThemedText style={styles.traitChip}>{spirit.traits.movement}</ThemedText>
            <ThemedText style={styles.traitChip}>{spirit.traits.voice}</ThemedText>
            <ThemedText style={styles.traitChip}>{spirit.traits.seasonalStrengthLabel}</ThemedText>
          </View>
        </Animated.View>
      )}

      {/* Field Lore */}
      {lore.isEstablished && (
        <Animated.View entering={FADE_LORE} style={styles.section}>
          <ThemedText style={styles.subLabel}>FIELD LORE</ThemedText>
          <ThemedText style={styles.loreText}>{lore.loreLine}</ThemedText>
        </Animated.View>
      )}

      {/* Suggested Actions */}
      {ecosystem.suggestedActions.length > 0 && (
        <Animated.View entering={FADE_ACTIONS} style={styles.actionsSection}>
          <ThemedText style={styles.subLabel}>WHAT WOULD HELP</ThemedText>
          {ecosystem.suggestedActions.slice(0, 2).map((action, i) => (
            <ThemedText key={i} style={styles.actionText}>{ACTION_LABELS[action] ?? action}</ThemedText>
          ))}
        </Animated.View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  panelCard: {
    paddingVertical: Spacing.four,
  },
  whisper: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.35)',
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
    fontSize: 12,
    color: 'rgba(255,255,255,0.50)',
  },
  conditionsValue: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: '400',
    fontStyle: 'italic',
  },

  // Section
  section: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.28)',
    marginBottom: Spacing.two,
  },

  // Species
  speciesName: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 1.7,
  },
  speciesLatin: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.40)',
    marginTop: 2,
    marginBottom: 4,
  },
  speciesReason: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.50)',
    lineHeight: 1.5,
    marginBottom: 6,
  },
  peakNote: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(122,184,122,0.70)',
  },
  freqNote: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(196,151,74,0.60)',
  },
  contNote: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(154,122,184,0.60)',
  },
  mythNote: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.55)',
  },
  loreChip: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(196,151,74,0.50)',
    lineHeight: 1.5,
    marginLeft: 4,
    marginBottom: 8,
  },
  remainingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.6,
  },

  // Seasonal
  seasonalText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.6,
  },

  // Arrivals
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dot: {
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
    color: 'rgba(255,255,255,0.45)',
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

  // Habitat
  habitatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  habitatLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 20,
  },
  habitatAffinity: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 20,
  },
  habitatNote: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.60)',
    lineHeight: 1.6,
    marginTop: Spacing.one,
  },

  // Memory
  memoryText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(196,151,74,0.55)',
    lineHeight: 1.6,
  },
  chapterCount: {
    fontSize: 11,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.30)',
    marginTop: 4,
  },

  // Continuity
  continuityArc: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 1.6,
    marginBottom: 4,
  },
  continuityText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(154,122,184,0.55)',
    lineHeight: 1.6,
  },

  // Mythology
  mythArc: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 1.6,
    marginBottom: 4,
  },
  mythText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.7,
  },

  // Soul — the capstone (largest, brightest)
  soulSection: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  soulName: {
    fontSize: 17,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 1.6,
    marginBottom: 4,
  },
  soulText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 1.7,
  },
  rootTraitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  rootChip: {
    fontSize: 10,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.35)',
    marginRight: 10,
    marginTop: 2,
  },
  rootAnchor: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.30)',
    marginTop: 4,
  },
  rootHabitat: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.30)',
    marginTop: 2,
  },

  // Spirit
  spiritSection: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  spiritName: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(154,122,184,0.85)',
    lineHeight: 1.6,
    marginBottom: 4,
  },
  spiritText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(154,122,184,0.72)',
    lineHeight: 1.7,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  traitChip: {
    fontSize: 10,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.40)',
    marginRight: 10,
    marginTop: 2,
  },

  // Lore
  loreText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(196,151,74,0.65)',
    lineHeight: 1.7,
  },

  // Actions
  actionsSection: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
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
