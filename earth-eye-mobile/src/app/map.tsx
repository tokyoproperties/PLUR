import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CorridorShading } from '@/components/map/CorridorShading';
import { CorridorLayer } from '@/components/map/CorridorLayer';
import { FireworkWindowOverlay } from '@/components/map/FireworkWindowOverlay';
import { SensorGradientLayer } from '@/components/map/SensorGradientLayer';
import { TrailProximityRing } from '@/components/map/TrailProximityRing';
import { YardCorridorRadius } from '@/components/map/YardCorridorRadius';
import { YardStripLayer } from '@/components/map/YardStripLayer';
import { ModeBadge } from '@/components/ModeBadge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCorridor } from '@/corridor/useCorridor';
import { useSymbolicMode } from '@/contexts/mode-context';
import { useCorridors } from '@/hooks/useCorridors';
import { useLocation } from '@/hooks/useLocation';
import { useSensors } from '@/hooks/useSensors';
import { useYardStrip } from '@/hooks/useYardStrip';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

/**
 * Map screen — Phase V: full overlay stack.
 *
 * Layer order (bottom to top):
 *   1. SensorGradientLayer  (D) — radial gradient at user position
 *   2. YardCorridorRadius   (C) — yard zone circle
 *   3. TrailProximityRing   (B) — nearest trail ring
 *   4. CorridorLayer        — 74 trail markers
 *   5. YardStripLayer       — yard marker
 *   6. FireworkWindowOverlay — July 4th ring (LOVE + firework window only)
 *   7. CorridorShading      (A+E) — tone + mode tint (View overlay, above map)
 *
 * All overlays degrade gracefully when GPS is unavailable.
 */
export default function MapScreen() {
  const { mode } = useSymbolicMode();
  const { trails } = useCorridors();
  const yard = useYardStrip();
  const { snapshot } = useSensors();
  const { location } = useLocation();

  const corridor = useCorridor();
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

  const hasGPS = location !== null;
  const userLat = location?.latitude ?? null;
  const userLng = location?.longitude ?? null;

  // Find the nearest trail object for the proximity ring
  const nearestTrail = useMemo(() => {
    if (!hasGPS || corridor.nearestTrailName === null) return null;
    return trails.find((t) => t.name === corridor.nearestTrailName) ?? null;
  }, [hasGPS, corridor.nearestTrailName, trails]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <MapView
          key={mode}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}>

          {/* D: Sensor gradient at user location */}
          <SensorGradientLayer
            userLat={userLat}
            userLng={userLng}
            snapshot={snapshot}
          />

          {/* C: Yard corridor radius */}
          <YardCorridorRadius
            yard={yard}
            proximity={corridor.proximity}
            isFireworkWindow={yardEval.isFireworkWindow}
          />

          {/* B: Trail proximity ring (nearest trail) */}
          <TrailProximityRing
            nearestTrail={nearestTrail}
            distanceMeters={corridor.nearestTrailDistanceMeters}
            tone={corridor.tone}
            hasGPS={hasGPS}
          />

          {/* Existing: 74 trail markers */}
          <CorridorLayer trails={trails} mode={mode} />

          {/* Existing: yard marker */}
          <YardStripLayer yard={yard} mode={mode} sensorSummary={sensorSummary} />

          {/* Existing: firework window ring (LOVE mode + active window only) */}
          {mode === 'love' && yardEval.isFireworkWindow && (
            <FireworkWindowOverlay yard={yard} />
          )}
        </MapView>

        {/* A + E: Corridor tone + mode tint (View overlay, above map) */}
        <CorridorShading />

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
    zIndex: 10,
  },
});
