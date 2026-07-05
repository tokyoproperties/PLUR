import { Link } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AtlasPanel } from '@/components/AtlasPanel';
import { Card } from '@/components/Card';
import { CorridorSummary } from '@/components/CorridorSummary';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { HybridFieldStateCard } from '@/components/HybridFieldState';
import { MicroEcosystemPanel } from '@/components/MicroEcosystemPanel';
import { ModeBadge } from '@/components/ModeBadge';
import { ModeToggle } from '@/components/ModeToggle';
import { SuitPanel } from '@/components/SuitPanel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useSymbolicMode } from '@/contexts/mode-context';
import { useSensors } from '@/hooks/useSensors';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

type LaunchHref = '/map' | '/sensors' | '/atlas' | '/ecosystem' | '/suit';

function QuickLaunch({ href, label, hint }: { href: LaunchHref; label: string; hint: string }) {
  return (
    <Link href={href} asChild>
      <ThemedView style={styles.quickLaunchRow} type="backgroundElement">
        <ThemedView style={styles.quickLaunchText} type="backgroundElement">
          <ThemedText type="smallBold">{label}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {hint}
          </ThemedText>
        </ThemedView>
        <ThemedText type="link" themeColor="text">
          →
        </ThemedText>
      </ThemedView>
    </Link>
  );
}

export default function HomeScreen() {
  const { light, motion, sound, snapshot } = useSensors();
  const { mode } = useSymbolicMode();

  const lite = evaluateLiteMode(snapshot);
  const yard = evaluateYardMode(snapshot);

  const activeSummary = mode === 'plur' ? lite.summary : yard.summary;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}>
          {/* Emergency fallback banner — only visible when in fallback mode */}
          <EmergencyBanner />

          <ThemedText type="title" style={styles.title}>
            EarthEye
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Field atlas for Orange County ecology
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            MODE
          </ThemedText>
          <ModeToggle />
          <ThemedView style={styles.badgeSpacer} type="background">
            <ModeBadge mode={mode} statusText={activeSummary} />
          </ThemedView>

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            FIELD STATE
          </ThemedText>
          <HybridFieldStateCard />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            QUICK LAUNCH
          </ThemedText>
          <QuickLaunch href="/atlas" label="Atlas" hint="Full cosmology — soul, spirit, lore" />
          <QuickLaunch href="/ecosystem" label="Micro-Ecosystem" hint="Species, habitat, memory, continuity" />
          <QuickLaunch href="/suit" label="Field Suit" hint="Sensor bands and field tags" />
          <QuickLaunch href="/map" label="Map" hint="Trails, corridors, yard strip" />
          <QuickLaunch href="/sensors" label="Sensors" hint="Full live readings + mode detail" />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            CORRIDOR
          </ThemedText>
          <CorridorSummary />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            ENVIRONMENTAL DETAIL
          </ThemedText>
          <Card>
            <ThemedText type="smallBold">Lite Mode</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.cardBody}>
              {lite.summary}
            </ThemedText>
          </Card>
          <Card>
            <ThemedText type="smallBold">Yard Mode</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.cardBody}>
              {yard.summary}
            </ThemedText>
            {yard.isFireworkWindow && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.cardBody}>
                Firework sensitivity window active — dampening widened automatically.
              </ThemedText>
            )}
          </Card>

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            SUIT
          </ThemedText>
          <SuitPanel />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            MICRO-ECOSYSTEM
          </ThemedText>
          <MicroEcosystemPanel />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            SENSOR SUMMARY
          </ThemedText>
          <Card>
            <ThemedText type="small" themeColor="textSecondary">
              Light: {light.lux !== null ? `${light.lux.toFixed(1)} lux (${light.band})` : light.isAvailable ? 'reading…' : 'unavailable on this device'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.cardLine}>
              Motion: {motion.band}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.cardLine}>
              Sound: {sound.relativeDb !== null ? `${sound.relativeDb.toFixed(0)} (${sound.band})` : sound.permissionDenied ? 'mic permission denied' : 'reading…'}
            </ThemedText>
          </Card>

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            FIELD ATLAS
          </ThemedText>
          <AtlasPanel />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            WEATHER
          </ThemedText>
          <Card>
            <ThemedText type="small" themeColor="textSecondary">
              Not yet connected — weather snapshot integration is planned, not faked.
            </ThemedText>
          </Card>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  title: {
    marginBottom: Spacing.one,
  },
  subtitle: {
    marginBottom: Spacing.four,
  },
  sectionLabel: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeSpacer: {
    marginTop: Spacing.two,
  },
  cardBody: {
    marginTop: Spacing.one,
  },
  cardLine: {
    marginTop: Spacing.half,
  },
  quickLaunchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  quickLaunchText: {
    flexShrink: 1,
  },
});
