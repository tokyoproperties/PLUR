/**
 * TrailMapPreview.tsx — Mission 16 revision
 *
 * The static thumbnail service (staticmap.openstreetmap.de) went offline,
 * so the preview is now an honest route card: it states whether the trail
 * has a mapped route and hands off to the full Map screen, which opens
 * focused on this trail with its real route drawn (TrailRoutesLayer).
 *
 * Observational register — no directives, no exclamation marks.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { TrailGeometry } from '@/hooks/useTrailGeometry';

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

  const hasRoute = geometry.hasRoute;
  const segCount = geometry.segments.length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.routeGlyph}>
        <View style={styles.routeLine} />
        <View style={[styles.routeDot, styles.routeDotStart]} />
        <View style={[styles.routeDot, styles.routeDotEnd]} />
      </View>
      <View style={styles.textColumn}>
        <ThemedText style={styles.label}>
          {hasRoute ? 'ROUTE · MAPPED' : 'TRAILHEAD · MAPPED'}
        </ThemedText>
        <ThemedText style={styles.value}>
          {hasRoute
            ? `Route geometry on record${segCount > 0 ? ` · ${segCount} segment${segCount === 1 ? '' : 's'}` : ''}. Opens on the map.`
            : 'Center point on record. Opens on the map.'}
        </ThemedText>
      </View>
      <ThemedText style={styles.arrow}>→</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 16,
    backgroundColor: '#1A1A17',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    transform: [{ scale: 0.99 }],
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
  routeGlyph: {
    width: 44,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeLine: {
    position: 'absolute',
    width: 34,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(122,184,122,0.55)',
  },
  routeDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#7AB87A',
  },
  routeDotStart: { left: 2 },
  routeDotEnd: { right: 2 },
  textColumn: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.12,
    color: 'rgba(255,255,255,0.35)',
  },
  value: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 18,
  },
  arrow: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.35)',
  },
});
