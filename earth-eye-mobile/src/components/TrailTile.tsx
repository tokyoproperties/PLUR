/**
 * TrailTile.tsx — Mission 15
 * List row: hero image | name + jurisdiction + stats.
 */
import { Pressable, StyleSheet, View, Image } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { TrailStatsBlock } from '@/components/TrailStatsBlock';
import { Spacing } from '@/constants/theme';
import type { AtlasTrail } from '@/atlas/atlasApi';

type Props = {
  trail:   AtlasTrail;
  index:   number;
  onPress: (id: string) => void;
};

export function TrailTile({ trail, index, onPress }: Props) {
  const entering = index < 20
    ? FadeIn.duration(220).delay(index * 22)
    : FadeIn.duration(100);

  return (
    <Animated.View entering={entering}>
      <Pressable
        onPress={() => onPress(trail.id)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        {/* Thumbnail */}
        <View style={styles.thumbSlot}>
          {trail.heroImage ? (
            <Image
              source={{ uri: trail.heroImage }}
              style={styles.thumb}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]} />
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <ThemedText style={styles.name} numberOfLines={2}>{trail.name}</ThemedText>
          {trail.jurisdiction ? (
            <ThemedText style={styles.jurisdiction} numberOfLines={1}>
              {trail.jurisdiction}
            </ThemedText>
          ) : null}
          <View style={styles.stats}>
            <TrailStatsBlock
              distanceMiles={trail.distanceMiles}
              elevationGain={trail.elevationGain}
              difficulty={trail.difficulty}
              heatRisk={trail.heatRisk}
              compact
            />
          </View>
          {/* Amenity dots */}
          <View style={styles.amenities}>
            {trail.dogFriendly === 'yes' && <Dot label="DOG" />}
            {trail.hasWater    === 'yes' && <Dot label="H₂O" />}
            {trail.restrooms   === 'yes' && <Dot label="WC"  />}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Dot({ label }: { label: string }) {
  return (
    <View style={dotStyles.chip}>
      <ThemedText style={dotStyles.label}>{label}</ThemedText>
    </View>
  );
}

const dotStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  label: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.35)',
  },
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  pressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  thumbSlot: {
    width: 80,
    aspectRatio: 4 / 3,
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: '#1C3A2A',
  },
  thumb: { width: '100%', height: '100%' },
  thumbFallback: { backgroundColor: '#1C3A2A' },
  info: { flex: 1, minWidth: 0, gap: 4 },
  name: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: 'rgba(255,255,255,0.90)',
    lineHeight: 20,
  },
  jurisdiction: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.2,
  },
  stats: { marginTop: 2 },
  amenities: { flexDirection: 'row', gap: 6, marginTop: 4 },
});
