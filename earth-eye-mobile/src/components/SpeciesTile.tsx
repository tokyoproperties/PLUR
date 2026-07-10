/**
 * SpeciesTile.tsx
 *
 * List row for the Species Browser.
 * 4:3 thumbnail left | name / scientific name / season badge right.
 * Tappable → navigates to /species/[id].
 *
 * Layout is a flex row so the image slot is always 80px wide
 * and the text block fills the remainder.
 */

import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { SeasonBadge } from '@/components/SeasonBadge';
import { SpeciesImage } from '@/components/SpeciesImage';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { AtlasSpecies } from '@/atlas/atlasApi';

type Props = {
  species:    AtlasSpecies;
  index:      number;
  onPress:    (id: string) => void;
};

export function SpeciesTile({ species, index, onPress }: Props) {
  // Stagger: first 30 items animate in sequence, rest appear instantly
  const entering = index < 30
    ? FadeIn.duration(220).delay(index * 18)
    : FadeIn.duration(120);

  return (
    <Animated.View entering={entering}>
      <Pressable
        onPress={() => onPress(species.id)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <SpeciesImage uri={species.imageUrl} style={styles.thumb} priority="normal" />
        <View style={styles.info}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {species.name}
          </ThemedText>
          {species.scientificName ? (
            <ThemedText style={styles.sci} numberOfLines={1}>
              {species.scientificName}
            </ThemedText>
          ) : null}
          <View style={styles.meta}>
            <SeasonBadge seasonPresence={species.seasonPresence} />
            {species.frequency ? (
              <ThemedText style={styles.freq}>{species.frequency}</ThemedText>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  thumb: {
    width: 80,
    marginRight: Spacing.two,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Georgia',
    color: 'rgba(255,255,255,0.90)',
    marginBottom: 2,
  },
  sci: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.40)',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  freq: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.30)',
  },
});
