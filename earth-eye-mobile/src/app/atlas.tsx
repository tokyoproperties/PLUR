import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AtlasPanel } from '@/components/AtlasPanel';
import { CorridorSummary } from '@/components/CorridorSummary';
import { HybridFieldStateCard } from '@/components/HybridFieldState';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AtlasScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.pageTitle}>Field Atlas</ThemedText>
        <ThemedText style={styles.pageHint}>The complete layered story of the field</ThemedText>

        <HybridFieldStateCard />
        <CorridorSummary />
        <AtlasPanel />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0D' },
  scroll: { flex: 1 },
  content: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Georgia',
    color: 'rgba(255,255,255,0.90)',
    marginTop: Spacing.three,
  },
  pageHint: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: Spacing.two,
  },
});
