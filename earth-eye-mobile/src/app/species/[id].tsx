/**
 * Species Detail Screen  —  /species/[id]
 *
 * Full species record: hero image, name, scientific name, season,
 * habitat, behavior, field cue, fun fact, facts array, ecological role.
 *
 * Back navigation returns to list with scroll position preserved
 * (expo-router handles this via the browser history stack).
 */

import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { SpeciesHeader } from '@/components/SpeciesHeader';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useSpecies } from '@/hooks/useSpecies';

export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { species, loading, error } = useSpecies(id ?? '');

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedText style={styles.stateText}>Loading…</ThemedText>
      </SafeAreaView>
    );
  }

  if (error || !species) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ThemedText style={styles.backLabel}>← Species</ThemedText>
        </Pressable>
        <ThemedText style={styles.stateText}>
          {error ?? 'Species not found in atlas.'}
        </ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Back */}
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <ThemedText style={styles.backLabel}>← Species</ThemedText>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
      >
        {/* Hero image + name block */}
        <Animated.View entering={FadeIn.duration(400)}>
          <SpeciesHeader
            name={species.name}
            scientificName={species.scientificName}
            imageUrl={species.imageUrl}
            seasonPresence={species.seasonPresence}
            frequency={species.frequency}
            group={species.group}
          />
        </Animated.View>

        {/* Metadata sections */}
        <Animated.View entering={SlideInDown.duration(350).delay(120)}>
          {species.fieldCue ? (
            <Section label="Field Cue">
              <ThemedText style={styles.narrative}>{species.fieldCue}</ThemedText>
            </Section>
          ) : null}

          {species.habitat ? (
            <Section label="Habitat">
              <ThemedText style={styles.body}>{species.habitat}</ThemedText>
            </Section>
          ) : null}

          {species.behavior ? (
            <Section label="Behavior">
              <ThemedText style={styles.body}>{species.behavior}</ThemedText>
            </Section>
          ) : null}

          {species.ecologicalRole && species.ecologicalRole.length > 0 ? (
            <Section label="Ecological Role">
              {species.ecologicalRole.map((role, i) => (
                <ThemedText key={i} style={styles.body}>• {role}</ThemedText>
              ))}
            </Section>
          ) : null}

          {species.funFact ? (
            <Section label="Field Note">
              <ThemedText style={styles.narrative}>{species.funFact}</ThemedText>
            </Section>
          ) : null}

          {species.facts && species.facts.length > 0 ? (
            <Section label="Atlas Facts">
              {species.facts.map((fact, i) => (
                <ThemedText key={i} style={[styles.body, styles.factRow]}>
                  {fact}
                </ThemedText>
              ))}
            </Section>
          ) : null}

          {species.conservationStatus ? (
            <Section label="Conservation">
              <ThemedText style={styles.body}>
                {species.conservationStatus}
                {species.riskCategory ? ` — ${species.riskCategory}` : ''}
              </ThemedText>
            </Section>
          ) : null}

          {/* Similar species — stub for Mission 15 */}
          <Section label="Similar Species">
            {species.lookalikes && species.lookalikes.length > 0
              ? species.lookalikes.map((lk, i) => (
                  <ThemedText key={i} style={styles.body}>• {lk}</ThemedText>
                ))
              : <ThemedText style={styles.placeholder}>
                  Lookalike records will expand in a future field update.
                </ThemedText>
            }
          </Section>

          {/* Field Notes — empty placeholder */}
          <Section label="Field Notes">
            <ThemedText style={styles.placeholder}>
              No notes recorded yet.
            </ThemedText>
          </Section>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionLabel}>{label}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0D',
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontSize: 13,
    color: 'rgba(122,184,122,0.80)',
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: Spacing.two,
  },
  narrative: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 26,
  },
  body: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 22,
    marginBottom: 4,
  },
  factRow: {
    marginBottom: 10,
  },
  placeholder: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.30)',
    lineHeight: 21,
  },
  stateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.40)',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 60,
  },
});
