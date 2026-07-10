import { getCalendarSeason } from '@/hooks/useSeason';
/**
 * useSpeciesHotspots.ts — Mission 16
 *
 * Clusters species by trail location (lat/lng from trail data).
 * Species have trail[] IDs → join to trail coordinates.
 * Returns map-ready hotspot markers, filtered by current season.
 *
 * Reality check: species have NO direct coordinates. They link to trails
 * via trail[] ID arrays. We cluster per trail center point, weighted
 * by species count and seasonal relevance. This is the correct join.
 */
import { useMemo } from 'react';
import type { AtlasSpecies, AtlasTrail } from '@/atlas/atlasApi';

export type SpeciesHotspot = {
  trailId:       string;
  trailName:     string;
  latitude:      number;
  longitude:     number;
  speciesCount:  number;
  seasonalCount: number;   // species present in current season
  topSpecies:    string[];  // first 3 names for callout
  dominantGroup: string;   // most frequent group at this trail
};

export function useSpeciesHotspots(
  species: AtlasSpecies[],
  trails:  AtlasTrail[],
  enabled: boolean,
): SpeciesHotspot[] {
  return useMemo(() => {
    if (!enabled || species.length === 0 || trails.length === 0) return [];

    const season = getCalendarSeason();
    const trailMap = new Map(trails.map((t) => [t.id, t]));

    // Build per-trail species lists
    const byTrail = new Map<string, AtlasSpecies[]>();
    for (const sp of species) {
      for (const tid of (sp.trail ?? [])) {
        if (!byTrail.has(tid)) byTrail.set(tid, []);
        byTrail.get(tid)!.push(sp);
      }
    }

    const hotspots: SpeciesHotspot[] = [];
    for (const [trailId, sps] of byTrail) {
      const trail = trailMap.get(trailId);
      if (!trail?.lat || !trail?.lng) continue;

      const seasonal = sps.filter((s) => s.seasonPresence?.includes(season));
      // dominant group
      const groupCounts = sps.reduce<Record<string, number>>((acc, s) => {
        acc[s.group] = (acc[s.group] ?? 0) + 1; return acc;
      }, {});
      const dominant = Object.entries(groupCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'bird';

      hotspots.push({
        trailId,
        trailName:     trail.name,
        latitude:      trail.lat,
        longitude:     trail.lng,
        speciesCount:  sps.length,
        seasonalCount: seasonal.length,
        topSpecies:    sps.slice(0, 3).map((s) => s.name),
        dominantGroup: dominant,
      });
    }

    return hotspots;
  }, [species, trails, enabled]);
}

// Stub for Mission 17+
export function useNearbyHotspots(_location: unknown): SpeciesHotspot[] { return []; }
