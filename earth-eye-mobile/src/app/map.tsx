import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModeBadge } from '@/components/ModeBadge';
import { CorridorLayer } from '@/components/map/CorridorLayer';
import { FireworkWindowOverlay } from '@/components/map/FireworkWindowOverlay';
import { YardStripLayer } from '@/components/map/YardStripLayer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSymbolicMode } from '@/contexts/mode-context';
import { useCorridors } from '@/hooks/useCorridors';
import { useSensors } from '@/hooks/useSensors';
import { useYardStrip } from '@/hooks/useYardStrip';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

/**
 * Map screen.
 *
 * Real data: the 74 active trails, live from the production DB
 * (single-point markers — no walked-path polylines exist yet).
 * Real yard coordinates: 35.392238, -119.099642 (captured 2026-07-02).
 *
 * Mode-aware: PLUR dims the yard and brightens trails ("out in the
 * world"). LOVE dims trails and brightens the yard ("home"), and
 * shows the firework-window ring when Yard Mode's threshold logic
 * says it's active.
 */
export default function MapScreen() {
  const { mode } = useSymbolicMode();
  const { trails } = useCorridors();
  const yard = useYardStrip();
  const { snapshot } = useSensors();

  const lite = evaluateLiteMode(snapshot);
  const yardEval = evaluateYardMode(snapshot);
  const sensorSummary = mode === 'plur' ? lite.summary : yardEval.summary;

  const initialRegion = useMemo(
    () =>
      mode === 'love'
        ? { latitude: yard.lat, longitude: yard.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }
        : { latitude: 33.6, longitude: -117.75, latitudeDelta: 0.9, longitudeDelta: 0.9 },
    [mode, yard.lat, yard.lng]
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <MapView
          key={mode}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}>
          <CorridorLayer trails={trails} mode={mode} />
          <YardStripLayer yard={yard} mode={mode} sensorSummary={sensorSummary} />
          {mode === 'love' && yardEval.isFireworkWindow && <FireworkWindowOverlay yard={yard} />}
        </MapView>

        <ThemedView style={styles.badgeCorner} type="background">
          <ModeBadge mode={mode} compact pulse={false} />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  badgeCorner: {
    position: 'absolute',
    top: Spacing.four,
    right: Spacing.four,
    zIndex: 1,
  },
});
