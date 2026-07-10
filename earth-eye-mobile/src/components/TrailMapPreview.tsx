/**
 * TrailMapPreview.tsx — Mission 15/16
 *
 * Static map thumbnail using Google Maps Static API.
 * Replaced MapView to avoid the Android "child already has a parent"
 * crash that occurs when two MapView instances exist simultaneously
 * (main Map screen + trail detail screen).
 *
 * Tapping navigates to the full Map screen.
 */
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Accents } from '@/constants/theme';
import type { TrailGeometry } from '@/hooks/useTrailGeometry';

const STATIC_MAP_SIZE = '400x200';
const ZOOM = 13;

// Google Maps Static API — free tier covers this usage at this scale.
// No API key needed for the fallback tile; key is needed for production.
// For now we use a deterministic OpenStreetMap tile via staticmap.
function buildStaticUrl(lat: number, lng: number): string {
  // openstreetmap-based static map — no key required
  return (
    `https://staticmap.openstreetmap.de/staticmap.php` +
    `?center=${lat},${lng}&zoom=${ZOOM}&size=${STATIC_MAP_SIZE}` +
    `&markers=${lat},${lng},red-pushpin`
  );
}

type Props = {
  geometry:  TrailGeometry;
  trailName: string;
  onPress?:  () => void;
};

export function TrailMapPreview({ geometry, trailName, onPress }: Props) {
  if (!geometry.center) {
    return (
      <View style={[styles.container, styles.fallback]}>
        <ThemedText style={styles.fallbackText}>Map location unavailable</ThemedText>
      </View>
    );
  }

  const { latitude, longitude } = geometry.center;
  const uri = buildStaticUrl(latitude, longitude);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image
        source={{ uri }}
        style={styles.img}
        resizeMode="cover"
      />
      {onPress && (
        <View style={styles.overlay}>
          <ThemedText style={styles.overlayText}>Open in Map →</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 16,
    backgroundColor: '#1C3A2A',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.30)',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(15,15,13,0.72)',
  },
  overlayText: {
    fontSize: 11,
    fontWeight: '600',
    color: Accents.sage,
    letterSpacing: 0.3,
  },
});
