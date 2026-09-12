/**
 * TrailRoutesLayer.tsx — Mission 16
 *
 * Renders real route polylines (OpenStreetMap geometry) on the main MapView.
 * Normal view: every mapped trail drawn in sage, low weight.
 * Focus mode (focusTrailId set from trail detail): the focused trail's route
 * is bright and heavier; all others dim to a faint network.
 *
 * Sage is content, not chrome — route lines are atlas data, so the accent
 * green belongs here per the design language.
 */
import { Polyline } from 'react-native-maps';
import { useTrailRoutes } from '@/hooks/useTrailRoutes';

type Props = {
  visible: boolean;
  focusTrailId?: string | null;
};

export function TrailRoutesLayer({ visible, focusTrailId }: Props) {
  const payload = useTrailRoutes();
  if (!visible || !payload) return null;

  const entries = Object.entries(payload.routes);

  return (
    <>
      {entries.map(([id, route]) =>
        route.polylines.map((segment, i) => (
          <Polyline
            key={`route-${id}-${i}`}
            coordinates={segment.coords.map(([lat, lng]) => ({ latitude: lat, longitude: lng }))}
            strokeColor={
              focusTrailId && id !== focusTrailId
                ? 'rgba(122,184,122,0.18)'
                : 'rgba(122,184,122,0.80)'
            }
            strokeWidth={focusTrailId === id ? 4 : 2}
            zIndex={focusTrailId === id ? 10 : 1}
          />
        ))
      )}
    </>
  );
}
