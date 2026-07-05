import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import { EmergencyBanner } from '@/components/EmergencyBanner';
import { HybridFieldStateCard } from '@/components/HybridFieldState';
import { ModeBadge } from '@/components/ModeBadge';
import { ModeToggle } from '@/components/ModeToggle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { useFieldSpirit } from '@/atlas/useFieldSpirit';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { useSymbolicMode } from '@/contexts/mode-context';
import { useSensors } from '@/hooks/useSensors';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

// Staggered fade-in — first breath of the instrument
const FADE_TITLE = FadeIn.duration(400).delay(0);
const FADE_SEASON = FadeIn.duration(400).delay(80);
const FADE_IDENTITY = FadeIn.duration(500).delay(180);
const FADE_MODE = FadeIn.duration(400).delay(320);
const FADE_STATE = FadeIn.duration(400).delay(400);
const FADE_LAUNCH = FadeIn.duration(400).delay(520);

type LaunchHref = '/map' | '/sensors' | '/atlas' | '/ecosystem' | '/suit';

function QuickLaunchTile({ href, label, hint }: { href: LaunchHref; label: string; hint: string }) {
  return (
    <Link href={href} asChild>
      <ThemedView style={styles.tile} type="backgroundElement">
        <ThemedText style={styles.tileLabel}>{label}</ThemedText>
        <ThemedText style={styles.tileHint}>{hint}</ThemedText>
      </ThemedView>
    </Link>
  );
}

export default function HomeScreen() {
  const { snapshot } = useSensors();
  const { mode } = useSymbolicMode();
  const soul = useFieldSoul();
  const spirit = useFieldSpirit();
  const seasonal = useSeasonalProfile();

  const lite = evaluateLiteMode(snapshot);
  const yard = evaluateYardMode(snapshot);
  const activeSummary = mode === 'plur' ? lite.summary : yard.summary;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          scrollEventThrottle={16}
        >
          <EmergencyBanner />

          {/* Title */}
          <Animated.View entering={FADE_TITLE}>
            <ThemedText style={styles.title}>EarthEye</ThemedText>
            <ThemedText style={styles.subtitle}>Field atlas for Orange County ecology</ThemedText>
          </Animated.View>

          {/* Season badge */}
          <Animated.View entering={FADE_SEASON}>
            <View style={styles.seasonBadge}>
              <ThemedText style={styles.seasonLabel}>{seasonal.phaseLabel}</ThemedText>
              {seasonal.patternConfirmed && (
                <ThemedText style={styles.seasonConfirmed}>pattern confirmed</ThemedText>
              )}
            </View>
          </Animated.View>

          {/* Soul & Spirit preview — the first breath of identity */}
          <Animated.View entering={FADE_IDENTITY} style={styles.identitySection}>
            {soul.isEstablished ? (
              <ThemedText style={styles.soulPreview}>{soul.soulLine}</ThemedText>
            ) : (
              <ThemedText style={styles.identityPlaceholder}>
                The field has not yet revealed its soul.
              </ThemedText>
            )}
            {spirit.isEstablished && (
              <ThemedText style={styles.spiritPreview}>{spirit.spiritLine}</ThemedText>
            )}
          </Animated.View>

          {/* Mode */}
          <Animated.View entering={FADE_MODE} style={styles.modeSection}>
            <ModeToggle />
            <View style={styles.badgeSpacer}>
              <ModeBadge mode={mode} statusText={activeSummary} />
            </View>
          </Animated.View>

          {/* Field State */}
          <Animated.View entering={FADE_STATE}>
            <HybridFieldStateCard />
          </Animated.View>

          {/* Quick Launch grid — 2 columns */}
          <Animated.View entering={FADE_LAUNCH}>
            <ThemedText style={styles.sectionLabel}>EXPLORE</ThemedText>
            <View style={styles.tileGrid}>
              <QuickLaunchTile href="/atlas" label="Atlas" hint="Cosmology stack" />
              <QuickLaunchTile href="/ecosystem" label="Field" hint="Living ecosystem" />
              <QuickLaunchTile href="/map" label="Map" hint="Trails & corridors" />
              <QuickLaunchTile href="/suit" label="Suit" hint="Sensor bands" />
              <QuickLaunchTile href="/sensors" label="Sensors" hint="Live readings" />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Georgia',
    color: 'rgba(255,255,255,0.90)',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: Spacing.three,
  },

  // Season badge
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    marginBottom: Spacing.three,
  },
  seasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: 'rgba(255,255,255,0.65)',
  },
  seasonConfirmed: {
    fontSize: 9,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.25)',
    marginLeft: 8,
  },

  // Identity preview
  identitySection: {
    marginBottom: Spacing.three,
  },
  soulPreview: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 1.7,
    marginBottom: 6,
  },
  spiritPreview: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(154,122,184,0.72)',
    lineHeight: 1.6,
  },
  identityPlaceholder: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.40)',
    lineHeight: 1.6,
  },

  // Mode
  modeSection: {
    marginBottom: Spacing.two,
  },
  badgeSpacer: {
    marginTop: Spacing.two,
  },

  // Quick launch
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: Spacing.two,
    marginTop: Spacing.four,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    borderRadius: 10,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  tileLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 2,
  },
  tileHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.40)',
  },
});
