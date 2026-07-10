import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CorridorShading } from '@/components/map/CorridorShading';
import { CorridorLayer } from '@/components/map/CorridorLayer';
import { LayerControls, type MapLayers } from '@/components/map/LayerControls';
import { SpeciesHotspotLayer } from '@/components/map/SpeciesHotspotLayer';
import { TrailMarkerLayer } from '@/components/map/TrailMarkerLayer';
import { useSpeciesHotspots } from '@/hooks/useSpeciesHotspots';
import { loadSpecies, type AtlasSpecies, type AtlasTrail } from '@/atlas/atlasApi';
import { EcosystemRing } from '@/components/map/EcosystemRing';
import { FireworkWindowOverlay } from '@/components/map/FireworkWindowOverlay';
import { IdentityStrip } from '@/components/map/IdentityStrip';
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
 * Map screen — full overlay stack with identity + ecosystem + toggle.
 *
 * Normal mode layer order (bottom to top):
 *   1. SensorGradientLayer  — radial gradient at user position
 *   2. YardCorridorRadius   — yard zone circle
 *   3. TrailProximityRing   — nearest trail ring
 *   4. EcosystemRing        — micro-ecosystem species density ring
 *   5. CorridorLayer        — 74 trail markers
 *   6. YardStripLayer       — yard marker
 *   7. FireworkWindowOverlay — July 4th ring (LOVE + firework window only)
 *   8. CorridorShading      — tone + mode tint (View overlay)
 *
 * Overlay toggle: tap the eye glyph to hide all analytical overlays
 * for a clean map view. Trail markers + yard marker always visible.
 *
 * Identity strip: bottom overlay showing soul line + season phase.
 *
 * Fallback mode (emergency):
 *   - Only tone shading + yard radius + trail markers
 *   - No sensor gradient, no proximity rings, no ecosystem ring
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

  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [mapLayers, setMapLayers] = useState<MapLayers>({
    trails: true, hotspots: false, overlays: true,
  });
  const [allSpecies, setAllSpecies] = useState<AtlasSpecies[]>([]);
  const allTrails   = trails as unknown as AtlasTrail[];

  // Load species for hotspot layer (lazy — only when hotspots toggled on)
  useEffect(() => {
    if (!mapLayers.hotspots || allSpecies.length > 0) return;
    loadSpecies().then(setAllSpecies).catch(() => {});
  }, [mapLayers.hotspots, allSpecies.length]);

  const hotspots = useSpeciesHotspots(allSpecies, allTrails, mapLayers.hotspots);

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
  const showAnalyticalOverlays = overlaysVisible && !inFallback;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <MapView
          
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}>

          {/* D: Sensor gradient — skipped in fallback or when toggled off */}
          {showAnalyticalOverlays && (
            <SensorGradientLayer
              userLat={userLat}
              userLng={userLng}
              snapshot={snapshot}
            />
          )}

          {/* C: Yard corridor radius — always shown */}
          <YardCorridorRadius
            yard={yard}
            proximity={corridor.proximity}
            isFireworkWindow={yardEval.isFireworkWindow}
          />

          {/* B: Trail proximity ring — skipped in fallback or when toggled off */}
          {showAnalyticalOverlays && (
            <TrailProximityRing
              nearestTrail={nearestTrail}
              distanceMeters={corridor.nearestTrailDistanceMeters}
              tone={corridor.tone}
              hasGPS={hasGPS}
            />
          )}

          {/* Ecosystem ring — species density around user */}
          {showAnalyticalOverlays && (
            <EcosystemRing
              userLat={userLat}
              userLng={userLng}
              hasGPS={hasGPS}
            />
          )}

          {/* Trail markers — tappable, navigate to trail detail */}
          <TrailMarkerLayer trails={allTrails} visible={mapLayers.trails} />

          {/* Legacy CorridorLayer hidden when new layer is active */}
          {!mapLayers.trails && <CorridorLayer trails={trails} mode={mode} />}

          {/* Species hotspot circles — density per trail anchor */}
          <SpeciesHotspotLayer hotspots={hotspots} visible={mapLayers.hotspots} />

          {/* Yard marker — always shown */}
          <YardStripLayer yard={yard} mode={mode} sensorSummary={sensorSummary} />

          {/* Firework ring — LOVE mode + active window only, not in fallback */}
          {mode === 'love' && yardEval.isFireworkWindow && !inFallback && (
            <FireworkWindowOverlay yard={yard} />
          )}
        </MapView>

        {/* A + E: Corridor tone + mode tint — shown unless toggled off */}
        {overlaysVisible && <CorridorShading />}

        {/* Mode badge — top right */}
        <ThemedView style={styles.badgeCorner} type="background">
          <ModeBadge mode={mode} compact pulse={false} />
        </ThemedView>

        {/* Overlay toggle — top left, below badge */}
        <Pressable
          onPress={() => setOverlaysVisible((v) => !v)}
          style={styles.toggleButton}
        >
          <ThemedText style={styles.toggleLabel}>
            {overlaysVisible ? '◐' : '○'}
          </ThemedText>
        </Pressable>

        {/* Layer controls — below toggle button */}
        <LayerControls layers={mapLayers} onChange={setMapLayers} />

        {/* Identity strip — bottom of map */}
        <IdentityStrip />
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
  toggleButton: {
    position: 'absolute',
    top: Spacing.four,
    left: Spacing.four,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(26, 26, 23, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
  },
});
