/**
 * ecosystem/species.ts
 *
 * The 10-species starter canon for EarthEye's micro-ecosystem module.
 * These are real Orange County species that anchor the local ecology
 * across yard, trail, riparian, canopy, and nocturnal corridors.
 *
 * Each species has:
 * - Ecology profile (role in the ecosystem)
 * - Corridor affinity (where it lives)
 * - Suit relevance (which devices could detect it)
 * - Seasonality (when it's most active)
 * - Symbolic note (PLUR/LOVE resonance — the poetic register)
 */

export type EcologicalRole =
  | 'keystone'
  | 'indicator'
  | 'decomposer'
  | 'pollinator'
  | 'seed-disperser'
  | 'insectivore'
  | 'native-plant'
  | 'apex-predator';

export type CorridorAffinity =
  | 'yard'
  | 'trail'
  | 'riparian'
  | 'canopy'
  | 'nocturnal'
  | 'coastal'
  | 'grassland';

export type SuitDevice = 'QuietBand' | 'SoilBand' | 'LightBand' | 'FieldTags';

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface CanonSpecies {
  id: string;
  name: string;
  scientificName: string;
  role: EcologicalRole;
  corridorAffinity: CorridorAffinity[];
  suitRelevance: SuitDevice[];
  peakSeasons: Season[];
  symbolicNote: string;
  /** Conditions that invite this species — checked by the ecosystem engine */
  invitationConditions: {
    /** Minimum moisture (0-1) if SoilBand is relevant, null = no requirement */
    minMoisture?: number;
    /** Maximum noise level (dB) — species avoids loud areas, null = no limit */
    maxNoiseDb?: number;
    /** Requires low light (nocturnal/crepuscular) */
    requiresLowLight?: boolean;
    /** Requires bright light (diurnal sun-loving) */
    requiresBrightLight?: boolean;
    /** Invited when in yard corridor */
    yardFavorable?: boolean;
    /** Invited when near trail */
    trailFavorable?: boolean;
    /** Invited when near coastal */
    coastalFavorable?: boolean;
    /** Always invited in OC context (native plants that belong anywhere) */
    alwaysInvited?: boolean;
  };
}

export const ECOSYSTEM_CANON: CanonSpecies[] = [
  {
    id: 'acorn-woodpecker',
    name: 'Acorn Woodpecker',
    scientificName: 'Melanerpes formicivorus',
    role: 'keystone',
    corridorAffinity: ['canopy', 'yard'],
    suitRelevance: ['QuietBand', 'LightBand'],
    peakSeasons: ['fall', 'winter'],
    symbolicNote: 'Communal, watchful, stores the future in bark.',
    invitationConditions: {
      yardFavorable: true,
      maxNoiseDb: 50,
    },
  },
  {
    id: 'pacific-chorus-frog',
    name: 'Pacific Chorus Frog',
    scientificName: 'Pseudacris regilla',
    role: 'indicator',
    corridorAffinity: ['riparian', 'yard'],
    suitRelevance: ['SoilBand', 'QuietBand'],
    peakSeasons: ['spring', 'winter'],
    symbolicNote: 'Small voice, big signal — listens for rain.',
    invitationConditions: {
      minMoisture: 0.4,
      yardFavorable: true,
      maxNoiseDb: 35,
    },
  },
  {
    id: 'turkey-tail',
    name: 'Turkey Tail',
    scientificName: 'Trametes versicolor',
    role: 'decomposer',
    corridorAffinity: ['yard', 'trail'],
    suitRelevance: ['SoilBand'],
    peakSeasons: ['fall', 'winter', 'spring'],
    symbolicNote: 'Patience made visible — turns death into soil.',
    invitationConditions: {
      minMoisture: 0.3,
      yardFavorable: true,
    },
  },
  {
    id: 'brown-pelican',
    name: 'Brown Pelican',
    scientificName: 'Pelecanus occidentalis',
    role: 'indicator',
    corridorAffinity: ['coastal'],
    suitRelevance: ['QuietBand', 'FieldTags'],
    peakSeasons: ['summer', 'fall'],
    symbolicNote: 'Ancient patience on salt air — glides between worlds.',
    invitationConditions: {
      coastalFavorable: true,
    },
  },
  {
    id: 'fence-lizard',
    name: 'Western Fence Lizard',
    scientificName: 'Sceloporus occidentalis',
    role: 'indicator',
    corridorAffinity: ['yard', 'trail', 'grassland'],
    suitRelevance: ['LightBand', 'QuietBand'],
    peakSeasons: ['spring', 'summer'],
    symbolicNote: 'Sun-basking sentinel — quick, bright, essential.',
    invitationConditions: {
      requiresBrightLight: true,
      yardFavorable: true,
      trailFavorable: true,
    },
  },
  {
    id: 'ground-squirrel',
    name: 'California Ground Squirrel',
    scientificName: 'Otospermophilus beecheyi',
    role: 'keystone',
    corridorAffinity: ['grassland', 'trail', 'yard'],
    suitRelevance: ['QuietBand', 'LightBand'],
    peakSeasons: ['spring', 'summer', 'fall'],
    symbolicNote: 'Architect of the underground — burrows host others.',
    invitationConditions: {
      yardFavorable: true,
      trailFavorable: true,
      requiresBrightLight: true,
    },
  },
  {
    id: 'big-brown-bat',
    name: 'Big Brown Bat',
    scientificName: 'Eptesicus fuscus',
    role: 'insectivore',
    corridorAffinity: ['nocturnal', 'canopy', 'yard'],
    suitRelevance: ['QuietBand', 'LightBand'],
    peakSeasons: ['summer', 'fall'],
    symbolicNote: 'Night gardener — eats what bites you, asks nothing.',
    invitationConditions: {
      requiresLowLight: true,
      yardFavorable: true,
      maxNoiseDb: 45,
    },
  },
  {
    id: 'lemonade-berry',
    name: 'Lemonade Berry',
    scientificName: 'Rhus integrifolia',
    role: 'native-plant',
    corridorAffinity: ['yard', 'trail', 'coastal'],
    suitRelevance: ['SoilBand', 'LightBand'],
    peakSeasons: ['spring', 'winter'],
    symbolicNote: 'Holds the hillside — deep roots, sour fruit, quiet generosity.',
    invitationConditions: {
      alwaysInvited: true,
      yardFavorable: true,
    },
  },
  {
    id: 'purple-needlegrass',
    name: 'Purple Needlegrass',
    scientificName: 'Stipa pulchra',
    role: 'native-plant',
    corridorAffinity: ['grassland', 'yard'],
    suitRelevance: ['SoilBand', 'LightBand'],
    peakSeasons: ['spring', 'summer'],
    symbolicNote: 'State grass of California — unassuming, enduring, foundational.',
    invitationConditions: {
      yardFavorable: true,
      minMoisture: 0.15,
    },
  },
  {
    id: 'belted-kingfisher',
    name: 'Belted Kingfisher',
    scientificName: 'Megaceryle alcyon',
    role: 'indicator',
    corridorAffinity: ['riparian', 'coastal'],
    suitRelevance: ['QuietBand', 'FieldTags'],
    peakSeasons: ['fall', 'winter', 'spring'],
    symbolicNote: 'Rattling flash along the water — fierce, precise, wild.',
    invitationConditions: {
      coastalFavorable: true,
      maxNoiseDb: 40,
    },
  },
];

/** Quick lookup by id */
export function getCanonSpecies(id: string): CanonSpecies | undefined {
  return ECOSYSTEM_CANON.find((s) => s.id === id);
}
