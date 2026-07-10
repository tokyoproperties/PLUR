/**
 * useSpeciesList.ts
 *
 * Loads the full 542-species atlas from CDN, then applies
 * client-side search, group filter, and sort — all in a
 * single memoized pass so the FlatList never re-renders
 * on unrelated state changes.
 */

import { useEffect, useMemo, useState } from 'react';

import { loadSpecies, type AtlasSpecies } from '@/atlas/atlasApi';

export type SpeciesFilter = {
  search:   string;
  group:    string | null;  // null = all groups
  sort:     'alpha' | 'seasonal';
};

export type UseSpeciesListResult = {
  species:   AtlasSpecies[];
  loading:   boolean;
  error:     string | null;
  totalCount: number;
};

// Groups that appear in the data — canonical lowercase values from the entity schema
export const SPECIES_GROUPS = [
  'bird', 'mammal', 'reptile', 'amphibian', 'fish',
  'insect', 'arachnid', 'crustacean', 'mollusk', 'invertebrate',
  'plant', 'fungi', 'lichen', 'algae', 'human impact',
] as const;

// Human-readable labels for filter chips
export const GROUP_LABELS: Record<string, string> = {
  bird:           'Birds',
  mammal:         'Mammals',
  reptile:        'Reptiles',
  amphibian:      'Amphibians',
  fish:           'Fish',
  insect:         'Insects',
  arachnid:       'Arachnids',
  crustacean:     'Crustaceans',
  mollusk:        'Mollusks',
  invertebrate:   'Invertebrates',
  plant:          'Plants',
  fungi:          'Fungi',
  lichen:         'Lichen',
  algae:          'Algae',
  'human impact': 'Human Impact',
};

// Current season — used for seasonal sort
function getCurrentSeason(): string {
  const m = new Date().getMonth(); // 0-based
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

export function useSpeciesList(filter: SpeciesFilter): UseSpeciesListResult {
  const [allSpecies, setAllSpecies]   = useState<AtlasSpecies[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadSpecies()
      .then((data) => {
        if (!cancelled) {
          setAllSpecies(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message ?? 'Atlas unavailable');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const species = useMemo(() => {
    let result = allSpecies;

    // Group filter
    if (filter.group) {
      result = result.filter((s) => s.group === filter.group);
    }

    // Search filter — matches name or scientific name
    if (filter.search.trim().length > 0) {
      const q = filter.search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.scientificName?.toLowerCase().includes(q) ?? false)
      );
    }

    // Sort
    if (filter.sort === 'seasonal') {
      const season = getCurrentSeason();
      result = [...result].sort((a, b) => {
        const aIn = a.seasonPresence?.includes(season) ? 0 : 1;
        const bIn = b.seasonPresence?.includes(season) ? 0 : 1;
        if (aIn !== bIn) return aIn - bIn;
        return a.name.localeCompare(b.name);
      });
    } else {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [allSpecies, filter.search, filter.group, filter.sort]);

  return { species, loading, error, totalCount: allSpecies.length };
}
