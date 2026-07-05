/**
 * TrailProximityRing.tsx
 *
 * Shows how close the user is to the nearest trail by drawing a
 * soft ring around the trailhead. Ring radius and opacity scale
 * with distance:
 *
 *   < 50m   → tight ring, high opacity (you're basically on it)
 *   50-200m → medium ring, medium opacity (nearby)
 *   > 200m  → faint ring, low opacity (in the field)
 *   no GPS  → not rendered
 *
 * Color matches corridor tone so the ring feels like part of the
 * environmental reading, not a separate UI element.
 *
 * This is a react-native-maps Circle child — renders inside MapView.
 */

import { Circle } from 'react-native-maps';

import { Accents } from '@/constants/theme';
import type { TrailMarker } from '@/hooks/useCorridors';

type CorridorTone = 'calm' | 'noisy' | 'bright' | 'still' | 'mixed';

const TONE_COLORS: Record<CorridorTone, string> = {
  calm:   Accents.sage,
  bright: Accents.amber,
  still:  Accents.blue,
  noisy:  Accents.rose,
  mixed:  Accents.rose,
};

export function TrailProximityRing({
  nearestTrail,
  distanceMeters,
  tone,
  hasGPS,
}: {
  nearestTrail: TrailMarker | null;
  distanceMeters: number | null;
  tone: CorridorTone;
  hasGPS: boolean;
}) {
  // Don't render if no GPS, no trail data, or trail is more than 1km away
  if (!hasGPS || !nearestTrail || distanceMeters === null || distanceMeters > 1000) {
    return null;
  }

  // Ring radius: always slightly larger than actual distance so the user
  // can see the ring around the trail, not centered on themselves
  const ringRadius = (() => {
    if (distanceMeters < 50) return 80;      // tight ring
    if (distanceMeters < 200) return 200;     // medium ring
    return 400;                                // faint wide ring
  })();

  // Opacity scales with closeness
  const fillAlpha = (() => {
    if (distanceMeters < 50) return '22';
    if (distanceMeters < 200) return '14';
    return '08';
  })();

  const strokeAlpha = (() => {
    if (distanceMeters < 50) return '44';
    if (distanceMeters < 200) return '2A';
    return '14';
  })();

  const color = TONE_COLORS[tone] ?? Accents.sage;

  return (
    <Circle
      center={{ latitude: nearestTrail.lat, longitude: nearestTrail.lng }}
      radius={ringRadius}
      strokeColor={`${color}${strokeAlpha}`}
      fillColor={`${color}${fillAlpha}`}
      strokeWidth={distanceMeters < 50 ? 2 : 1}
    />
  );
}
