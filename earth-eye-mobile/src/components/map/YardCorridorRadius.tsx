/**
 * YardCorridorRadius.tsx
 *
 * Visualizes the Bakersfield yard as a real spatial zone on the map.
 * A Circle overlay centered on the yard GPS coordinates with radius
 * and fill intensity driven by corridor proximity:
 *
 *   in-yard  → solid but soft (you're home)
 *   near-yard → lighter ring (approaching)
 *   field     → barely visible (far away)
 *
 * Color shifts during firework window to a muted gold — signaling
 * the sensitivity zone without alarming the user.
 *
 * This is a react-native-maps Circle child — renders inside MapView.
 */

import { Circle } from 'react-native-maps';

import type { YardStripPoint } from '@/hooks/useYardStrip';
import { Accents } from '@/constants/theme';

const YARD_RADIUS_M = 50;
const NEAR_YARD_RADIUS_M = 200;

type Proximity = 'in-yard' | 'near-yard' | 'near-trail' | 'field' | 'unknown';

export function YardCorridorRadius({
  yard,
  proximity,
  isFireworkWindow,
}: {
  yard: YardStripPoint;
  proximity: Proximity;
  isFireworkWindow: boolean;
}) {
  // Radius: in-yard shows the tight 50m zone, near-yard shows the 200m zone
  const radius = proximity === 'in-yard' ? YARD_RADIUS_M : NEAR_YARD_RADIUS_M;

  // Fill intensity by proximity
  const fillAlpha = (() => {
    if (isFireworkWindow) return '22'; // muted gold, low visibility
    if (proximity === 'in-yard') return '33'; // most visible
    if (proximity === 'near-yard') return '1A'; // lighter
    return '0D'; // barely visible from the field
  })();

  // Stroke (ring outline)
  const strokeAlpha = (() => {
    if (isFireworkWindow) return '44';
    if (proximity === 'in-yard') return '55';
    if (proximity === 'near-yard') return '33';
    return '1A';
  })();

  // Color: amber normally, gold during firework window
  const baseColor = isFireworkWindow ? '#C4974A' : Accents.amber;

  return (
    <Circle
      center={{ latitude: yard.lat, longitude: yard.lng }}
      radius={radius}
      strokeColor={`${baseColor}${strokeAlpha}`}
      fillColor={`${baseColor}${fillAlpha}`}
      strokeWidth={proximity === 'in-yard' ? 2 : 1}
    />
  );
}
