/**
 * FireworkWindowOverlay.tsx
 * Semi-transparent gold ring around the yard during the July 4th
 * firework sensitivity window. Only rendered in LOVE mode, and only
 * while Yard Mode's isFireworkWindow is true — reuses the existing
 * threshold logic in @/modes/yard, no new date math here.
 */

import { Circle } from 'react-native-maps';

import type { YardStripPoint } from '@/hooks/useYardStrip';
import { MODE_META } from '@/contexts/mode-context';

const RADIUS_METERS = 150; // illustrative — not a surveyed blast/noise radius

export function FireworkWindowOverlay({ yard }: { yard: YardStripPoint }) {
  const color = MODE_META.love.color;

  return (
    <Circle
      center={{ latitude: yard.lat, longitude: yard.lng }}
      radius={RADIUS_METERS}
      strokeColor={color}
      fillColor={`${color}33`}
      strokeWidth={2}
    />
  );
}
