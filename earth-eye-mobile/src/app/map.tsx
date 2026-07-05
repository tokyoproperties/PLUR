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
import { useEmergency } from '@/emergency/useEmergency';
import { useCorridors } from '@/hooks/useCorridors';
import { useLocation } from '@/hooks/useLocation';
import { useSensors } from '@/hooks/useSensors';
import { useYardStrip } from '@/hooks/useYardStrip';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

/**
 * Map screen — Phase V + IX: full overlay stack with fallback.
 *
 * Normal mode layer order (bottom to top):
 *   1. SensorGradientLayer  (D) — radial gradient at user position
 *   2. YardCorridorRadius   (C) — yard zone circle
 *   3. TrailProximityRing   (B) — nearest trail ring
 *   4. CorridorLayer        — 74 trail markers
 *   5. YardStripLayer       — yard marker
 *   6. FireworkWindowOverlay — July 4th ring (LOVE + firework window only)
 *   7. CorridorShading      (A+E) — tone + mode tint (View overlay)
 *
 * Fallback mode (emergency):
 *   - Only tone shading + yard radius + trail markers
 *   - No sensor gradient, no proximity rings (less computation)
 *   - CorridorShading still runs (cheap, just opacity)
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
  const emergency = useEmergency();
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

  const nearestTrail = useMemo(() => {
    if (!hasGPS || corridor.nearestTrailName === null) return null;
    return trails.find((t) => t.name === corridor.nearestTrailName) ?? null;
  }, [hasGPS, corridor.nearestTrailName, trails]);

  const inFallback = emergency.fallbackMode;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <MapView
          key={mode}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}>

          {/* D: Sensor gradient — skipped in fallback (computationally heavier) */}
          {!inFallback && (
            <SensorGradientLayer
              userLat={userLat}
              userLng={userLng}
              snapshot={snapshot}
            />
          )}

          {/* C: Yard corridor radius — always shown (cheap Circle) */}
          <YardCorridorRadius
            yard={yard}
            proximity={corridor.proximity}
            isFireworkWindow={yardEval.isFireworkWindow}
          />

          {/* B: Trail proximity ring — skipped in fallback */}
          {!inFallback && (
            <TrailProximityRing
              nearestTrail={nearestTrail}
              distanceMeters={corridor.nearestTrailDistanceMeters}
              tone={corridor.tone}
              hasGPS={hasGPS}
            />
          )}

          {/* 74 trail markers — always shown */}
          <CorridorLayer trails={trails} mode={mode} />

          {/* Yard marker — always shown */}
          <YardStripLayer yard={yard} mode={mode} sensorSummary={sensorSummary} />

          {/* Firework ring — LOVE mode + active window only, not in fallback */}
          {mode === 'love' && yardEval.isFireworkWindow && !inFallback && (
            <FireworkWindowOverlay yard={yard} />
          )}
        </MapView>

        {/* A + E: Corridor tone + mode tint — always shown (cheap opacity overlay) */}
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
