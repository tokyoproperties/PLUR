import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AtlasPanel } from '@/components/AtlasPanel';
import { CorridorSummary } from '@/components/CorridorSummary';
import { HybridFieldStateCard } from '@/components/HybridFieldState';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

/**
 * AtlasScreen — the cosmology view.
 *
 * Three sections in a quiet vertical scroll:
 *   FIELD STATE → CORRIDOR → COSMOLOGY
 *
 * Each section has a whisper label (9px uppercase) and
 * generous spacing. Scroll physics tuned for a calm,
 * premium feel — no overscroll bounce, no scroll indicator.
 */
export default function AtlasScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        scrollEventThrottle={16}
      >
        <ThemedText style={styles.pageTitle}>Field Atlas</ThemedText>
        <ThemedText style={styles.pageHint}>The complete layered story of the field</ThemedText>

        <Section label="Field State">
          <HybridFieldStateCard />
        </Section>

        <Section label="Corridor">
          <CorridorSummary />
        </Section>

        <Section label="Cosmology">
          <AtlasPanel />
        </Section>
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
  scroll: {
    flex: 1,
  },
  content: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Georgia',
    color: 'rgba(255,255,255,0.90)',
    marginTop: Spacing.four,
    marginBottom: 2,
  },
  pageHint: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: Spacing.three,
  },
  section: {
    marginBottom: Spacing.five,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: Spacing.two,
    marginLeft: Spacing.three,
  },
});
