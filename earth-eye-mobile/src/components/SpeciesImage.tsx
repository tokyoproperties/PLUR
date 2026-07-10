/**
 * SpeciesImage.tsx
 *
 * CDN image loader with:
 * - expo-image for caching + fast decode
 * - 4:3 aspect ratio (locked — see constitution)
 * - opacity fade-in on load
 * - offline/error fallback (#1C3A2A slot — the one valid use of that color)
 * - no broken-image icon ever shown
 */

import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

type Props = {
  uri?: string;
  style?: object;
  priority?: 'low' | 'normal' | 'high';
};

export function SpeciesImage({ uri, style, priority = 'normal' }: Props) {
  return (
    <View style={[styles.slot, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          transition={{ duration: 300, effect: 'cross-dissolve' }}
          priority={priority}
          cachePolicy="disk"
        />
      ) : (
        <View style={styles.fallback} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    aspectRatio: 4 / 3,
    backgroundColor: '#1C3A2A',  // ONLY valid use — image fallback slot
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    backgroundColor: '#1C3A2A',
  },
});
