import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MicroEcosystemPanel } from '@/components/MicroEcosystemPanel';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

/**
 * FieldScreen — the living organism view.
 *
 * The counterpart to Atlas (cosmology) — this is where
 * species, habitat, and the living layers breathe.
 *
 * Scroll physics match Atlas: no bounce, no indicator, quiet.
 */
export default function EcosystemScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        scrollEventThrottle={16}
      >
        <ThemedText style={styles.pageTitle}>Micro-Ecosystem</ThemedText>
        <ThemedText style={styles.pageHint}>Species, habitat, and the living layers of the field</ThemedText>

        <MicroEcosystemPanel />
      </ScrollView>
    </SafeAreaView>
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
});
