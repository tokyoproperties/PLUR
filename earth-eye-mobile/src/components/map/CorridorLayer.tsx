/**
 * CorridorLayer.tsx
 * Renders the real 74-trail dataset as markers. PLUR mode (Lite
 * Mode's lens): full brightness, pulsing — the "out in the world"
 * posture. LOVE mode (Yard Mode's lens): dimmed — attention pulled
 * home, not dispersed across the county.
 */

import { Marker } from 'react-native-maps';

import type { TrailMarker } from '@/hooks/useCorridors';
import type { SymbolicMode } from '@/contexts/mode-context';
import { MODE_META } from '@/contexts/mode-context';

export function CorridorLayer({ trails, mode }: { trails: TrailMarker[]; mode: SymbolicMode }) {
  const meta = MODE_META.plur; // corridors are always the PLUR-colored layer
  const dimmed = mode === 'love';

  return (
    <>
      {trails.map((trail) => (
        <Marker
          key={trail.id}
          coordinate={{ latitude: trail.lat, longitude: trail.lng }}
          title={trail.name}
          description={[trail.difficulty, trail.jurisdiction].filter(Boolean).join(' · ')}
          opacity={dimmed ? 0.35 : 1}
          pinColor={meta.color}
        />
      ))}
    </>
  );
}
