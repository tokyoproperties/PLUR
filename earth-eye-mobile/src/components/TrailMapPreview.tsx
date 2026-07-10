/**
 * TrailMapPreview.tsx — Mission 15
 *
 * Lightweight map pin preview for the trail detail screen.
 * Tapping it navigates to the full Map screen.
 * Uses react-native-maps MapView with a single Marker.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ThemedText } from '@/components/themed-text';
import { Accents } from '@/constants/theme';
import type { TrailGeometry } from '@/hooks/useTrailGeometry';

type Props = {
  geometry:  TrailGeometry;
  trailName: string;
  onPress?:  () => void;
};

const DELTA = 0.025;

export function TrailMapPreview({ geometry, trailName, onPress }: Props) {
  if (!geometry.center) {
    return (
      <View style={[styles.container, styles.fallback]}>
        <ThemedText style={styles.fallbackText}>Map data unavailable</ThemedText>
      </View>
    );
  }

  const region = {
    latitude:       geometry.center.latitude,
    longitude:      geometry.center.longitude,
    latitudeDelta:  DELTA,
    longitudeDelta: DELTA,
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        pointerEvents="none"
        mapType="terrain"
      >
        <Marker
          coordinate={geometry.center}
          title={trailName}
          pinColor={Accents.sage}
        />
      </MapView>
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
  },
  map: {
    flex: 1,
  },
  fallback: {
    backgroundColor: '#1A1A17',
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
