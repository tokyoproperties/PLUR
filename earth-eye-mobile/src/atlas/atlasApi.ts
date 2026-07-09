/**
 * atlasApi.ts — Mission 13C: Static JSON bridge for earth-eye-mobile
 *
 * Fetches Species + Trail atlas data from pre-exported static JSON files
 * hosted on a public CDN. Read-only, zero auth, zero personal data.
 *
 * Constitutional rule (locked 2026-07-07):
 *   - Only Species and Trail records flow from web → mobile
 *   - Observation entity is intentionally excluded
 *   - No personal data ever leaves the device
 *   - No user identity, no analytics, no write-back paths
 *
 * Usage:
 *   const species = await loadSpecies();
 *   const trails  = await loadTrails();
 *
 * Offline fallback: if the network request fails, returns the last
 * successfully cached version from AsyncStorage. If nothing is cached,
 * throws so the caller can degrade gracefully.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ──────────────────────────────────────────────────────────────────
// CDN URLs — update these once you push the JSON files to your host.
// Host: media.base44.com (permanent CDN, same host as all atlas imagery)
// ──────────────────────────────────────────────────────────────────
export const ATLAS_URLS = {
  species: 'https://media.base44.com/files/public/69dffe15eb268f56342f8e58/f2725f3b3_eartheye_species.json',
  trails:  'https://media.base44.com/files/public/69dffe15eb268f56342f8e58/34af6d78d_eartheye_trails.json',
} as const;

const CACHE_KEYS = {
  species: 'earthEye.atlas.species.v1',
  trails:  'earthEye.atlas.trails.v1',
} as const;

// How long to trust a cached copy before trying to refresh (ms)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_TS_KEYS = {
  species: 'earthEye.atlas.species.ts.v1',
  trails:  'earthEye.atlas.trails.ts.v1',
} as const;

// ──────────────────────────────────────────────────────────────────
// Core species fields the mobile engine uses
// (exact field names from the exported JSON)
// ──────────────────────────────────────────────────────────────────
export type AtlasSpecies = {
  id:                 string;
  name:               string;
  scientificName?:    string;
  group:              string;   // bird | mammal | reptile | plant | ...
  imageUrl?:          string;
  imageUrl2?:         string;
  habitat?:           string;
  behavior?:          string;
  seasonPresence?:    string[]; // ['spring', 'summer', ...]
  frequency?:         string;   // common | uncommon | rare
  nativeStatus?:      string;
  endemicStatus?:     string;
  conservationStatus?:string;
  riskCategory?:      string;
  ecologicalRole?:    string[];
  lookalikes?:        string[];
  fieldCue?:          string;
  funFact?:           string;
  facts?:             string[];
  trail?:             string[]; // array of Trail IDs
  created_date?:      string;
};

export type AtlasTrail = {
  id:                   string;
  name:                 string;
  jurisdiction?:        string;
  habitatTypes?:        string[];
  distanceMiles?:       number;
  elevationGain?:       number;
  difficulty?:          string;
  dogFriendly?:         string;   // 'yes' | 'no'
  hasWater?:            string;
  restrooms?:           string;
  heatRisk?:            string;
  speciesIds?:          string[];
  ecologicalNotes?:     string;
  speciesHotspots?:     string;
  soundscape?:          string;
  sarCues?:             string;
  seasonalConditions?:  string;
  lat?:                 number;
  lng?:                 number;
  heroImage?:           string;
  archived?:            boolean; // should always be false in the export
  created_date?:        string;
};

export type AtlasPayload<T> = {
  schema_version: string;
  generated_utc:  string;
  source:         string;
  entity:         string;
  count:          number;
  records:        T[];
};

// ──────────────────────────────────────────────────────────────────
// Internal: cache read/write with TTL
// ──────────────────────────────────────────────────────────────────
async function readCache<T>(key: string, tsKey: string): Promise<T[] | null> {
  try {
    const [raw, tsRaw] = await Promise.all([
      AsyncStorage.getItem(key),
      AsyncStorage.getItem(tsKey),
    ]);
    if (!raw) return null;

    const ts = tsRaw ? parseInt(tsRaw, 10) : 0;
    if (Date.now() - ts > CACHE_TTL_MS) return null; // stale, refresh

    return JSON.parse(raw) as T[];
  } catch {
    return null;
  }
}

async function writeCache<T>(key: string, tsKey: string, data: T[]): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [key,   JSON.stringify(data)],
      [tsKey, String(Date.now())],
    ]);
  } catch {
    // Non-fatal — cache write failure just means next launch fetches again
  }
}

// ──────────────────────────────────────────────────────────────────
// Internal: fetch → parse → cache, with stale-cache fallback
// ──────────────────────────────────────────────────────────────────
async function fetchAtlasEntity<T>(
  url:    string,
  cacheKey:  string,
  tsCacheKey: string,
  forceRefresh = false,
): Promise<T[]> {
  // Return fresh cache if TTL is valid and not forced
  if (!forceRefresh) {
    const cached = await readCache<T>(cacheKey, tsCacheKey);
    if (cached) return cached;
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Accept':        'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);

    const payload = (await res.json()) as AtlasPayload<T>;
    const records = payload.records ?? [];

    await writeCache<T>(cacheKey, tsCacheKey, records);
    return records;
  } catch (networkErr) {
    // Network failed — try stale cache as fallback (ignore TTL)
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (raw) return JSON.parse(raw) as T[];
    } catch {
      // nothing
    }
    throw networkErr; // no cache and no network → let caller handle
  }
}

// ──────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────

/** Load all 542 species from the atlas. Returns cached copy when offline. */
export async function loadSpecies(forceRefresh = false): Promise<AtlasSpecies[]> {
  return fetchAtlasEntity<AtlasSpecies>(
    ATLAS_URLS.species,
    CACHE_KEYS.species,
    CACHE_TS_KEYS.species,
    forceRefresh,
  );
}

/** Load all active (~74) trails from the atlas. Returns cached copy when offline. */
export async function loadTrails(forceRefresh = false): Promise<AtlasTrail[]> {
  return fetchAtlasEntity<AtlasTrail>(
    ATLAS_URLS.trails,
    CACHE_KEYS.trails,
    CACHE_TS_KEYS.trails,
    forceRefresh,
  );
}

/** Lookup a single species by ID (from the cached/fetched dataset). */
export async function getSpeciesById(id: string): Promise<AtlasSpecies | undefined> {
  const all = await loadSpecies();
  return all.find((s) => s.id === id);
}

/** Lookup a single trail by ID (from the cached/fetched dataset). */
export async function getTrailById(id: string): Promise<AtlasTrail | undefined> {
  const all = await loadTrails();
  return all.find((t) => t.id === id);
}

/** Filter species by group (e.g. 'bird', 'mammal', 'plant'). */
export async function getSpeciesByGroup(group: string): Promise<AtlasSpecies[]> {
  const all = await loadSpecies();
  return all.filter((s) => s.group?.toLowerCase() === group.toLowerCase());
}

/** Filter species available on a given trail ID. */
export async function getSpeciesForTrail(trailId: string): Promise<AtlasSpecies[]> {
  const all = await loadSpecies();
  return all.filter((s) => s.trail?.includes(trailId));
}

/** Clear cached atlas data (forces fresh fetch on next load). */
export async function clearAtlasCache(): Promise<void> {
  await AsyncStorage.multiRemove([
    CACHE_KEYS.species, CACHE_TS_KEYS.species,
    CACHE_KEYS.trails,  CACHE_TS_KEYS.trails,
  ]);
}
