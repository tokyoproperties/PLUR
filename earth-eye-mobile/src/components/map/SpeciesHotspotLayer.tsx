/**
 * SpeciesHotspotLayer.tsx — Mission 16
 *
 * Renders species density circles at each trail center point.
 * Circle radius scales with species count. Seasonal opacity boost.
 * Tapping a circle navigates to /trails/[id] (the species are filtered
 * per-trail in the trail detail screen).
 *
 * No per-species coordinates exist in the data — this is the correct
 * spatial representation: density at the trail anchor.
 */
import { Circle } from 'react-native-maps';
import { StyleSheet } from 'react-native';

import type { SpeciesHotspot } from '@/hooks/useSpeciesHotspots';

const BASE_RADIUS = 300;  // meters
const MAX_RADIUS  = 1200;

function radiusFor(count: number): number {
  return Math.min(BASE_RADIUS + count * 12, MAX_RADIUS);
}

type Props = {
  hotspots: SpeciesHotspot[];
  visible:  boolean;
};

export function SpeciesHotspotLayer({ hotspots, visible }: Props) {
  if (!visible || hotspots.length === 0) return null;

  return (
    <>
      {hotspots.map((h) => (
        <React.Fragment key={h.trailId}>
          <Circle
            center={{ latitude: h.latitude, longitude: h.longitude }}
            radius={radiusFor(h.speciesCount)}
            fillColor={`rgba(122,184,122,${Math.min(0.06 + h.seasonalCount * 0.003, 0.18)})`}
            strokeColor={`rgba(122,184,122,${Math.min(0.15 + h.seasonalCount * 0.005, 0.35)})`}
            strokeWidth={1}
          />

        </React.Fragment>
      ))}
    </>
  );
}

// React must be in scope for React.Fragment
import React from 'react';

const cs = StyleSheet.create({
  callout: {
    width: 180,
    padding: 10,
    backgroundColor: '#1A1A17',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(122,184,122,0.20)',
  },
  count:    { fontSize: 14, fontFamily: 'Georgia', color: 'rgba(255,255,255,0.90)', marginBottom: 2 },
  seasonal: { fontSize: 11, color: '#7AB87A', marginBottom: 4 },
  name:     { fontSize: 11, color: 'rgba(255,255,255,0.50)', marginBottom: 1 },
  action:   { fontSize: 11, fontWeight: '700', color: '#7AB87A', marginTop: 6 },
});
