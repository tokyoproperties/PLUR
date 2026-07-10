import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

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

type LaunchHref = '/map' | '/sensors' | '/atlas' | '/ecosystem' | '/suit' | '/species' | '/trails';

interface LaunchItem {
  href: LaunchHref;
  label: string;
  hint: string;
}

const LAUNCH_ITEMS: LaunchItem[] = [
  { href: '/species', label: 'Species', hint: '542 atlas entries' },
  { href: '/trails',  label: 'Trails',  hint: '74 field routes'  },
  { href: '/map',     label: 'Map',     hint: 'Trails & corridors' },
  { href: '/atlas',   label: 'Atlas',   hint: 'Cosmology stack' },
  { href: '/ecosystem', label: 'Field', hint: 'Living ecosystem' },
  { href: '/suit',    label: 'Suit',    hint: 'Sensor bands' },
  { href: '/sensors', label: 'Sensors', hint: 'Live readings' },
];

function QuickLaunchTile({
  item,
  index,
  isLastInRow,
}: {
  item: LaunchItem;
  index: number;
  isLastInRow: boolean;
}) {
  const handlePressIn = () => {
    Haptics.selectionAsync();
  };

  // Each tile staggers 50ms after the grid container appears at 520ms
  const tileDelay = 520 + index * 50;
  const tileEntering = FadeIn.duration(300).delay(tileDelay);

  return (
    <Link href={item.href} asChild>
      <Pressable
        onPressIn={handlePressIn}
        style={({ pressed }) => [styles.tileFlex, pressed && styles.tilePressed]}>
        <Animated.View
          entering={tileEntering}
          style={[styles.tile, !isLastInRow && styles.tileGap]}>
          <ThemedText style={styles.tileLabel} numberOfLines={1} allowFontScaling={false}>
            {item.label}
          </ThemedText>
          <ThemedText style={styles.tileHint} numberOfLines={2} allowFontScaling={false}>
            {item.hint}
          </ThemedText>
        </Animated.View>
      </Pressable>
    </Link>
  );
}

// Chunk into rows of 2 — deterministic, no reliance on flexWrap +
// percentage-width interaction (which proved unreliable: tiles kept
// rendering past the screen edge regardless of upstream width fixes).
// flex:1 on a fixed-length row always splits available width evenly,
// full stop, independent of any ancestor's width propagation quirks.
function chunkPairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
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
          <Animated.View entering={FADE_TITLE} style={styles.fullWidth}>
            <ThemedText style={styles.title}>EarthEye</ThemedText>
            <ThemedText style={styles.subtitle}>Field atlas for Orange County ecology</ThemedText>
          </Animated.View>

          {/* Season badge */}
          <Animated.View entering={FADE_SEASON} style={styles.fullWidth}>
            <View style={styles.seasonBadge}>
              <ThemedText style={styles.seasonLabel}>{seasonal.phaseLabel}</ThemedText>
              {seasonal.patternSuffix !== '' && (
                <ThemedText
                  style={[
                    styles.seasonSuffix,
                    seasonal.patternStatus === 'unclear' && styles.seasonUnclear,
                  ]}
                >
                  {seasonal.patternSuffix}
                </ThemedText>
              )}
            </View>
          </Animated.View>

          {/* Soul & Spirit preview — the first breath of identity */}
          <Animated.View entering={FADE_IDENTITY} style={styles.identitySection}>
            {soul.isEstablished ? (
              <ThemedText style={styles.soulPreview}>{soul.soulLine}</ThemedText>
            ) : (
              <ThemedText style={styles.identityPlaceholder}>
                The field is still becoming — its soul will emerge with time.
              </ThemedText>
            )}
            {spirit.isEstablished ? (
              <ThemedText style={styles.spiritPreview}>{spirit.spiritLine}</ThemedText>
            ) : (
              <ThemedText style={styles.spiritPlaceholder}>
                Spirit aligns when the field has enough memory to recognize itself.
              </ThemedText>
            )}
          </Animated.View>

          {/* Mode */}
          <Animated.View entering={FADE_MODE} style={[styles.modeSection, styles.fullWidth]}>
            <ModeToggle />
            <View style={styles.badgeSpacer}>
              <ModeBadge mode={mode} statusText={activeSummary} />
            </View>
          </Animated.View>

          {/* Field State */}
          <Animated.View entering={FADE_STATE} style={styles.fullWidth}>
            <HybridFieldStateCard />
          </Animated.View>

          {/* Quick Launch grid — tiles stagger individually */}
          <Animated.View entering={FADE_LAUNCH} style={styles.fullWidth}>
            <ThemedText style={styles.sectionLabel}>EXPLORE</ThemedText>
            <View style={styles.tileGrid}>
              {chunkPairs(LAUNCH_ITEMS).map((row, rowIndex) => (
                <View key={row[0].href} style={styles.tileRow}>
                  {row.map((item, i) => (
                    <QuickLaunchTile
                      key={item.href}
                      item={item}
                      index={rowIndex * 2 + i}
                      isLastInRow={i === row.length - 1}
                    />
                  ))}
                </View>
              ))}
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
  seasonSuffix: {
    fontSize: 9,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.25)',
    marginLeft: 8,
  },
  seasonUnclear: {
    color: 'rgba(196,151,74,0.40)',
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
    lineHeight: 27,
    marginBottom: 6,
  },
  spiritPreview: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(154,122,184,0.72)',
    lineHeight: 22,
  },
  identityPlaceholder: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.40)',
    lineHeight: 24,
    marginBottom: 6,
  },
  spiritPlaceholder: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.30)',
    lineHeight: 21,
  },

  // Mode
  modeSection: {
    marginBottom: Spacing.two,
  },
  // Belt-and-suspenders: Animated.View entrance wrappers don't always
  // reliably inherit the parent's flex-stretch width, which let
  // ModeToggle and HybridFieldStateCard size to their own (sometimes
  // wider-than-screen) content instead of the page width.
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
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
    width: '100%',
  },
  tileRow: {
    flexDirection: 'row',
    width: '100%',
  },
  // Each tile's outer wrapper (Link + Pressable) gets flex:1 so a
  // 2-item row always splits 50/50 — deterministic regardless of
  // content length or any ancestor width quirk.
  tileFlex: {
    flex: 1,
    minWidth: 0,
  },
  // NOTE (July 6 2026): these tiles never had visible chrome (no
  // background/border) since the very first version - confirmed via
  // git history, not a regression. With flex:1 correctly splitting
  // each row 50/50, invisible tiles made the right half of the row
  // look like empty dead space instead of a second tappable card.
  // Matches Card.tsx's own surface/border tokens for consistency.
  tile: {
    minHeight: 76,
    backgroundColor: '#1A1A17',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    marginBottom: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  tileGap: {
    marginRight: Spacing.two,
  },
  tilePressed: {
    opacity: 0.7,
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
    lineHeight: 15,
    color: 'rgba(255,255,255,0.40)',
  },
});
