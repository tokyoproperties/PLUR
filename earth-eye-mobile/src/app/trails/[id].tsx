/**
 * Trail Detail Screen — /trails/[id]   (Mission 15)
 */
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TrailHeader } from '@/components/TrailHeader';
import { TrailMapPreview } from '@/components/TrailMapPreview';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTrail } from '@/hooks/useTrail';
import { useTrailGeometry } from '@/hooks/useTrailGeometry';

export default function TrailDetailScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { trail, loading, error } = useTrail(id ?? '');
  const geometry = useTrailGeometry(trail);

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <ThemedText style={s.state}>Loading…</ThemedText>
      </SafeAreaView>
    );
  }

  if (error || !trail) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <ThemedText style={s.backLabel}>← Trails</ThemedText>
        </Pressable>
        <ThemedText style={s.state}>{error ?? 'Trail not found in atlas.'}</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Pressable onPress={() => router.back()} style={s.back}>
        <ThemedText style={s.backLabel}>← Trails</ThemedText>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        contentContainerStyle={s.content}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <TrailHeader
            name={trail.name}
            jurisdiction={trail.jurisdiction}
            heroImage={trail.heroImage}
            distanceMiles={trail.distanceMiles}
            elevationGain={trail.elevationGain}
            difficulty={trail.difficulty}
            heatRisk={trail.heatRisk}
          />
        </Animated.View>

        <Animated.View entering={SlideInDown.duration(350).delay(120)}>
          {/* Map preview */}
          <Section label="Location">
            <TrailMapPreview
              geometry={geometry}
              trailName={trail.name}
              onPress={() => router.push('/map')}
            />
          </Section>

          {/* Habitat */}
          {trail.habitatTypes && trail.habitatTypes.length > 0 && (
            <Section label="Habitat Zones">
              <View style={s.tags}>
                {trail.habitatTypes.map((h, i) => (
                  <View key={i} style={s.tag}>
                    <ThemedText style={s.tagText}>{h}</ThemedText>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Seasonal conditions */}
          {trail.seasonalConditions && (
            <Section label="Seasonal Conditions">
              <ThemedText style={s.narrative}>{trail.seasonalConditions}</ThemedText>
            </Section>
          )}

          {/* Ecological notes */}
          {trail.ecologicalNotes && (
            <Section label="Ecological Notes">
              <ThemedText style={s.body}>{trail.ecologicalNotes}</ThemedText>
            </Section>
          )}

          {/* Soundscape */}
          {trail.soundscape && (
            <Section label="Soundscape">
              <ThemedText style={s.narrative}>{trail.soundscape}</ThemedText>
            </Section>
          )}

          {/* Species hotspots */}
          {trail.speciesHotspots && (
            <Section label="Species Hotspots">
              <ThemedText style={s.body}>{trail.speciesHotspots}</ThemedText>
            </Section>
          )}

          {/* Safety cues */}
          {trail.sarCues && (
            <Section label="Field Safety">
              <ThemedText style={s.body}>{trail.sarCues}</ThemedText>
            </Section>
          )}

          {/* Amenities */}
          <Section label="Amenities">
            <View style={s.amenRow}>
              <Amen label="Dog-friendly" value={trail.dogFriendly} />
              <Amen label="Water"        value={trail.hasWater}    />
              <Amen label="Restrooms"    value={trail.restrooms}   />
            </View>
          </Section>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <ThemedText style={s.sectionLabel}>{label}</ThemedText>
      {children}
    </View>
  );
}

function Amen({ label, value }: { label: string; value?: string }) {
  const yes = value === 'yes';
  return (
    <View style={amenS.row}>
      <ThemedText style={[amenS.dot, yes ? amenS.dotYes : amenS.dotNo]}>●</ThemedText>
      <ThemedText style={amenS.label}>{label}</ThemedText>
    </View>
  );
}

const amenS = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { fontSize: 10 },
  dotYes: { color: '#7AB87A' },
  dotNo:  { color: 'rgba(255,255,255,0.20)' },
  label:  { fontSize: 13, color: 'rgba(255,255,255,0.60)' },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0D' },
  content: {
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    maxWidth: 800, width: '100%', alignSelf: 'center',
  },
  back:      { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, alignSelf: 'flex-start' },
  backLabel: { fontSize: 13, color: 'rgba(122,184,122,0.80)', fontWeight: '600' },
  section:   { marginBottom: Spacing.four },
  sectionLabel: {
    fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.1,
    color: 'rgba(255,255,255,0.35)', marginBottom: Spacing.two,
  },
  narrative: {
    fontSize: 15, fontFamily: 'Georgia', fontStyle: 'italic',
    color: 'rgba(255,255,255,0.72)', lineHeight: 26,
  },
  body: { fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tagText: { fontSize: 12, color: 'rgba(255,255,255,0.60)' },
  amenRow: { gap: 2 },
  state: {
    fontSize: 14, color: 'rgba(255,255,255,0.40)', fontFamily: 'Georgia',
    fontStyle: 'italic', textAlign: 'center', marginTop: 60,
  },
});
