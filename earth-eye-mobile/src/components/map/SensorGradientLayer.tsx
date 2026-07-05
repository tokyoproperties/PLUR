/**
 * SensorGradientLayer.tsx
 *
 * Shows how the environment "feels" at the user's location as a
 * soft radial gradient on the map. Phase V scaffolding — starts
 * with a single Circle around the user's position, colored by
 * the dominant sensor channel:
 *
 *   light-dominant  → amber gradient (brightness field)
 *   sound-dominant  → rose gradient (noise field)
 *   motion-dominant → lavender gradient (movement field)
 *   balanced/quiet  → sage gradient (calm field)
 *
 * Later phases can expand to multi-point interpolation as location
 * history accumulates. For now, one circle at current position.
 *
 * This is a react-native-maps Circle child — renders inside MapView.
 * Degrades to null when GPS is unavailable.
 */

import { Circle } from 'react-native-maps';

import { Accents } from '@/constants/theme';
import type { SensorSnapshot } from '@/hooks/useSensors';

type DominantChannel = 'light' | 'sound' | 'motion' | 'calm';

const CHANNEL_COLORS: Record<DominantChannel, string> = {
  light:  Accents.amber,
  sound:  Accents.rose,
  motion: Accents.lavender,
  calm:   Accents.sage,
};

function classifyDominant(snapshot: SensorSnapshot): DominantChannel {
  const { lux, soundRelativeDb, motionMagnitude } = snapshot;

  // Normalize each channel to 0-1 range for comparison
  const lightNorm = lux !== null ? Math.min(lux / 1000, 1) : 0;
  const soundNorm = soundRelativeDb !== null ? Math.min(soundRelativeDb / 80, 1) : 0;
  const motionNorm = Math.min(motionMagnitude / 0.3, 1);

  // If all channels are low, it's calm
  if (lightNorm < 0.1 && soundNorm < 0.1 && motionNorm < 0.1) return 'calm';

  // Pick the dominant channel
  if (lightNorm >= soundNorm && lightNorm >= motionNorm) return 'light';
  if (soundNorm >= lightNorm && soundNorm >= motionNorm) return 'sound';
  return 'motion';
}

export function SensorGradientLayer({
  userLat,
  userLng,
  snapshot,
}: {
  userLat: number | null;
  userLng: number | null;
  snapshot: SensorSnapshot;
}) {
  if (userLat === null || userLng === null) return null;

  const dominant = classifyDominant(snapshot);
  const color = CHANNEL_COLORS[dominant];

  // Radius scales with sensor intensity — bigger circle = more intense field
  const { lux, soundRelativeDb, motionMagnitude } = snapshot;
  const maxIntensity = Math.max(
    lux !== null ? lux / 1000 : 0,
    soundRelativeDb !== null ? soundRelativeDb / 80 : 0,
    motionMagnitude / 0.3
  );

  const radius = 80 + maxIntensity * 200; // 80m (calm) to 280m (intense)
  const fillAlpha = dominant === 'calm' ? '0A' : `${Math.round(maxIntensity * 30).toString(16).padStart(2, '0')}`;

  return (
    <Circle
      center={{ latitude: userLat, longitude: userLng }}
      radius={radius}
      strokeColor={`${color}22`}
      fillColor={`${color}${fillAlpha}`}
      strokeWidth={1}
    />
  );
}
