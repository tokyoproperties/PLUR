/**
 * YardStripLayer.tsx
 * The home yard marker. Highlighted in LOVE mode (home/family/safety
 * lens), dimmed in PLUR mode (attention is outward, on the trails).
 * Callout doubles as the "sensor marker" — the phone's own live
 * light/motion/sound reading, since the sensors are the yard's
 * sensors, not a separate scattered layer.
 */

import { Marker } from 'react-native-maps';

import type { YardStripPoint } from '@/hooks/useYardStrip';
import type { SymbolicMode } from '@/contexts/mode-context';
import { MODE_META } from '@/contexts/mode-context';

export function YardStripLayer({
  yard,
  mode,
  sensorSummary,
}: {
  yard: YardStripPoint;
  mode: SymbolicMode;
  sensorSummary: string;
}) {
  const meta = MODE_META.love; // the yard is always the LOVE-colored layer
  const dimmed = mode === 'plur';

  return (
    <Marker
      coordinate={{ latitude: yard.lat, longitude: yard.lng }}
      title={yard.isPlaceholder ? `${yard.name} (placeholder location)` : yard.name}
      description={sensorSummary}
      opacity={dimmed ? 0.4 : 1}
      pinColor={meta.color}
    />
  );
}
