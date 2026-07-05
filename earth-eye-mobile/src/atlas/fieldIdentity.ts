/**
 * atlas/fieldIdentity.ts
 *
 * Field Identity is EarthEye's understanding of *your* field — not as
 * data points, but as a character the land takes on over time.
 *
 * It answers: "If this place could describe itself, what would it say?"
 *
 * Built from the accumulated Field Moments (Phase X ring buffer):
 * - Dominant field states → temperament
 * - Card type distribution → affinities
 * - Fallback frequency → resilience
 * - Species patterns → ecology
 *
 * Pure logic — no React, no hooks. Takes Field Moments, returns identity.
 */

import type { FieldMoment } from '@/atlas/fieldMoment';
import type { CorridorState } from '@/corridor/corridor-engine';
import type { AtlasCardType } from '@/atlas/fieldMoment';

// ─── Types ────────────────────────────────────────────────

export type FieldTemperament =
  | 'calm'
  | 'bright'
  | 'variable'
  | 'quiet'
  | 'stressed'
  | 'emerging';

export type FieldAffinity =
  | 'yard'
  | 'trail'
  | 'coastal'
  | 'nocturnal'
  | 'field'
  | 'mixed';

export type FieldResilience =
  | 'stable'
  | 'occasional-stress'
  | 'frequent-stress'
  | 'unknown';

export type FieldEcology =
  | 'native-friendly'
  | 'grassland-leaning'
  | 'riparian-touched'
  | 'nocturnal-corridor'
  | 'coastal-ecology'
  | 'generalist'
  | 'emerging';

export interface FieldIdentity {
  /** Dominant emotional character of the field */
  temperament: FieldTemperament;
  /** Where the field spends most of its time */
  affinity: FieldAffinity;
  /** How often the field needs to conserve */
  resilience: FieldResilience;
  /** What kind of ecology the field supports */
  ecology: FieldEcology;
  /** Whether there's enough data for a real identity */
  isEstablished: boolean;
  /** The reflective sentence — what the place would say about itself */
  reflection: string;
  /** Short tag for UI display */
  temperamentLabel: string;
}

// ─── Helpers ──────────────────────────────────────────────

function countBy(items: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item] = (counts[item] ?? 0) + 1;
  }
  return counts;
}

function dominantKey(counts: Record<string, number>): string | null {
  let max = 0;
  let result: string | null = null;
  for (const [key, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      result = key;
    }
  }
  return result;
}

// ─── Evaluator ────────────────────────────────────────────

export function evaluateFieldIdentity(moments: FieldMoment[]): FieldIdentity {
  // Not enough data — the field is still revealing itself
  if (moments.length < 3) {
    return {
      temperament: 'emerging',
      affinity: 'mixed',
      resilience: 'unknown',
      ecology: 'emerging',
      isEstablished: false,
      reflection: 'The field is still revealing itself. Its character will emerge as more moments are recorded.',
      temperamentLabel: 'Emerging',
    };
  }

  // ─── Temperament ───────────────────────────────────────
  const stateCounts = countBy(moments.map((m) => m.fieldState as string));
  const dominantState = dominantKey(stateCounts);
  const calmCount = (stateCounts['calm'] ?? 0) + (stateCounts['still'] ?? 0);
  const brightCount = stateCounts['bright'] ?? 0;
  const stressCount = (stateCounts['noisy'] ?? 0) + (stateCounts['alert'] ?? 0) + (stateCounts['dim'] ?? 0);
  const total = moments.length;

  let temperament: FieldTemperament;
  let temperamentLabel: string;

  if (calmCount / total > 0.5) {
    temperament = 'calm';
    temperamentLabel = 'Mostly Calm';
  } else if (brightCount / total > 0.4) {
    temperament = 'bright';
    temperamentLabel = 'Bright & Active';
  } else if (stressCount / total > 0.35) {
    temperament = 'stressed';
    temperamentLabel = 'Stressed at Edges';
  } else if (calmCount / total > 0.3 && brightCount / total > 0.25) {
    temperament = 'variable';
    temperamentLabel = 'Variable';
  } else if (stateCounts['still'] ?? 0 > total * 0.3) {
    temperament = 'quiet';
    temperamentLabel = 'Quiet';
  } else {
    temperament = 'variable';
    temperamentLabel = 'Shifting';
  }

  // ─── Affinity ──────────────────────────────────────────
  const cardTypeCounts = countBy(moments.map((m) => m.cardType as string));
  const dominantCard = dominantKey(cardTypeCounts) as AtlasCardType | null;
  const yardCount = (cardTypeCounts['yard'] ?? 0);
  const trailCount = (cardTypeCounts['trail'] ?? 0);
  const coastalCount = (cardTypeCounts['coastal'] ?? 0);
  const nightCount = (cardTypeCounts['night'] ?? 0);

  let affinity: FieldAffinity;
  if (yardCount / total > 0.4) affinity = 'yard';
  else if (trailCount / total > 0.35) affinity = 'trail';
  else if (coastalCount / total > 0.3) affinity = 'coastal';
  else if (nightCount / total > 0.3) affinity = 'nocturnal';
  else if ((cardTypeCounts['field'] ?? 0) / total > 0.4) affinity = 'field';
  else affinity = 'mixed';

  // ─── Resilience ────────────────────────────────────────
  const fallbackCount = moments.filter((m) => m.inFallback).length;
  let resilience: FieldResilience;
  if (fallbackCount === 0) resilience = 'stable';
  else if (fallbackCount / total < 0.15) resilience = 'occasional-stress';
  else resilience = 'frequent-stress';

  // ─── Ecology ───────────────────────────────────────────
  const allSpecies = new Set<string>();
  for (const m of moments) {
    m.invitedSpecies.forEach((s) => allSpecies.add(s.toLowerCase()));
  }

  const hasNative = allSpecies.has('lemonade berry') || allSpecies.has('purple needlegrass');
  const hasGrassland = allSpecies.has('california ground squirrel') || allSpecies.has('western fence lizard');
  const hasRiparian = allSpecies.has('pacific chorus frog') || allSpecies.has('belted kingfisher');
  const hasNocturnal = allSpecies.has('big brown bat');
  const hasCoastal = allSpecies.has('brown pelican') || allSpecies.has('belted kingfisher');

  let ecology: FieldEcology;
  if (hasCoastal && coastalCount / total > 0.25) ecology = 'coastal-ecology';
  else if (hasNocturnal && nightCount / total > 0.25) ecology = 'nocturnal-corridor';
  else if (hasRiparian) ecology = 'riparian-touched';
  else if (hasNative && hasGrassland) ecology = 'grassland-leaning';
  else if (hasNative) ecology = 'native-friendly';
  else if (allSpecies.size >= 3) ecology = 'generalist';
  else ecology = 'emerging';

  // ─── Reflection ────────────────────────────────────────
  // Build the poetic sentence from the derived traits
  const parts: string[] = [];

  // Temperament phrase
  switch (temperament) {
    case 'calm':
      parts.push('This field is mostly calm');
      break;
    case 'bright':
      parts.push('This field is bright and active');
      break;
    case 'variable':
      parts.push('This field shifts between calm and bright');
      break;
    case 'quiet':
      parts.push('This field is quiet');
      break;
    case 'stressed':
      parts.push('This field is calm at its core but stressed at the edges');
      break;
    default:
      parts.push('This field is still finding its character');
  }

  // Affinity clause
  switch (affinity) {
    case 'yard':
      parts.push('with a strong yard corridor');
      break;
    case 'trail':
      parts.push('centered on the trail corridor');
      break;
    case 'coastal':
      parts.push('leaning toward the coast');
      break;
    case 'nocturnal':
      parts.push('shaped by quiet nights');
      break;
    case 'field':
      parts.push('open and field-oriented');
      break;
    case 'mixed':
    default:
      // Don't add a clause for mixed — the temperament phrase stands alone
      break;
  }

  // Add a time-of-day note if there's a secondary pattern
  if (affinity !== 'nocturnal' && nightCount / total > 0.15) {
    parts.push('with nocturnal moments');
  }

  // First clause with period
  const firstClause = parts.join(', ') + '.';

  // Ecology clause
  let ecologyClause = '';
  switch (ecology) {
    case 'native-friendly':
      ecologyClause = 'Native species find a home here.';
      break;
    case 'grassland-leaning':
      ecologyClause = 'Grassland species settle into this ground.';
      break;
    case 'riparian-touched':
      ecologyClause = 'Water-loving species pass through when moisture allows.';
      break;
    case 'nocturnal-corridor':
      ecologyClause = 'A nocturnal corridor runs through this place — bats and quiet movement after dark.';
      break;
    case 'coastal-ecology':
      ecologyClause = 'Salt air shapes the ecology here — pelicans and kingfishers belong to this corridor.';
      break;
    case 'generalist':
      ecologyClause = 'A variety of species find conditions here — the field is generous.';
      break;
    case 'emerging':
      ecologyClause = 'The ecology is still establishing itself.';
      break;
    default:
      ecologyClause = '';
  }

  // Resilience clause
  let resilienceClause = '';
  switch (resilience) {
    case 'stable':
      resilienceClause = 'The field stays stable even when networks strain.';
      break;
    case 'occasional-stress':
      resilienceClause = 'Occasionally the field conserves — fallback is rare but present.';
      break;
    case 'frequent-stress':
      resilienceClause = 'The field often runs in fallback — conservation is part of its rhythm.';
      break;
    default:
      resilienceClause = '';
  }

  // Combine clauses
  const reflection = [firstClause, ecologyClause, resilienceClause]
    .filter((c) => c.length > 0)
    .join(' ');

  return {
    temperament,
    affinity,
    resilience,
    ecology,
    isEstablished: true,
    reflection,
    temperamentLabel,
  };
}
