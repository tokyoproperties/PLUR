/**
 * TrailHeader.tsx — Mission 15
 * Hero block for trail detail: full-width image + name + stats.
 */
import { Image, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { TrailStatsBlock } from '@/components/TrailStatsBlock';
import { Spacing } from '@/constants/theme';

type Props = {
  name:          string;
  jurisdiction?: string;
  heroImage?:    string;
  distanceMiles?: number;
  elevationGain?: number;
  difficulty?:   string;
  heatRisk?:     string;
};

export function TrailHeader({ name, jurisdiction, heroImage, distanceMiles, elevationGain, difficulty, heatRisk }: Props) {
  return (
    <View style={styles.container}>
      {/* Hero image */}
      <View style={styles.heroSlot}>
        {heroImage ? (
          <Image source={{ uri: heroImage }} style={styles.heroImg} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImg, styles.heroFallback]} />
        )}
      </View>

      <View style={styles.meta}>
        {jurisdiction && (
          <ThemedText style={styles.jurisdiction}>{jurisdiction.toUpperCase()}</ThemedText>
        )}
        <ThemedText style={styles.name}>{name}</ThemedText>
        <TrailStatsBlock
          distanceMiles={distanceMiles}
          elevationGain={elevationGain}
          difficulty={difficulty}
          heatRisk={heatRisk}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.three },
  heroSlot: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.two,
    backgroundColor: '#1C3A2A',
  },
  heroImg: { width: '100%', height: '100%' },
  heroFallback: { backgroundColor: '#1C3A2A' },
  meta: { paddingHorizontal: 2, gap: 6 },
  jurisdiction: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.35)',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Georgia',
    color: 'rgba(255,255,255,0.90)',
    lineHeight: 30,
  },
});
