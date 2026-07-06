/**
 * EcosystemRing.tsx
 *
 * Micro-ecosystem density ring — a Circle overlay on the map
 * showing the radius of invited species around the user's
 * current position. The ring radius scales with the number of
 * invited species; the stroke color shifts with the season.
 *
 * Only renders when GPS is available and at least one species
 * is invited. Degrades gracefully — no ring when data is empty.
 */

import { Circle } from 'react-native-maps';

import { useEcosystem } from '@/ecosystem/useEcosystem';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';

interface EcosystemRingProps {
  userLat: number | null;
  userLng: number | null;
  hasGPS: boolean;
}

// Season → ring stroke color (EarthEye accent palette)
const SEASON_COLORS: Record<string, string> = {
  'early-spring':  'rgba(122, 184, 122, 0.50)', // sage
  'high-summer':   'rgba(196, 151, 74, 0.50)',  // amber
  'late-autumn':   'rgba(196, 122, 122, 0.50)',  // dusty rose
  'winter-night':  'rgba(122, 154, 184, 0.50)',  // muted blue
  'transitional':  'rgba(154, 122, 184, 0.50)',  // lavender
};

export function EcosystemRing({ userLat, userLng, hasGPS }: EcosystemRingProps) {
  const ecosystem = useEcosystem();
  const seasonal = useSeasonalProfile();

  if (!hasGPS || userLat === null || userLng === null) return null;

  const invitedCount = ecosystem.invitedSpecies.length;
  if (invitedCount === 0) return null;

  // Ring radius: 200m base + 80m per invited species, max 1000m
  const radius = Math.min(200 + invitedCount * 80, 1000);

  const strokeColor = SEASON_COLORS[seasonal.phase] ?? 'rgba(122, 184, 122, 0.50)';

  return (
    <Circle
      center={{ latitude: userLat, longitude: userLng }}
      radius={radius}
      strokeColor={strokeColor}
      strokeWidth={1.5}
      fillColor="transparent"
    />
  );
}
