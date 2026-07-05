/**
 * ecosystem-engine.ts
 *
 * The ecosystem engine answers: "Given my yard, my corridor, my
 * sensors, and my suit, which species are 'invited' here?"
 *
 * This is not a simulation — it's an honest read of real conditions
 * against the ecological preferences of the 10 canon species. When
 * Suit devices are mock/offline, the engine falls back to phone
 * sensor data and corridor proximity to make reasonable guesses.
 *
 * Pure logic — no React, no hooks. All inputs passed in.
 */

import type { CorridorState } from '@/corridor/corridor-engine';
import type { HybridState } from '@/hybrid/hybrid-engine';
import type { SensorSnapshot } from '@/hooks/useSensors';
import type { YardModeResult } from '@/modes/yard';

import {
  ECOSYSTEM_CANON,
  type CanonSpecies,
} from '@/ecosystem/species';
import type { SuitState } from '@/suit/types';

export type ConditionsScore = 'good' | 'fair' | 'poor';

export interface InvitedSpecies {
  species: CanonSpecies;
  /** Why this species is invited — one-line ecological reason */
  reason: string;
}

export type SuggestedAction =
  | 'add-native-grass'
  | 'reduce-night-noise'
  | 'leave-dead-wood'
  | 'add-water-source'
  | 'plant-lemonade-berry'
  | 'reduce-light-pollution'
  | 'preserve-snags';

export interface EcosystemState {
  /** Species whose conditions are currently met */
  invitedSpecies: InvitedSpecies[];
  /** Total canon size (always 10) */
  canonSize: number;
  /** Overall conditions rating */
  conditionsScore: ConditionsScore;
  /** Actions the user could take to invite more species */
  suggestedActions: SuggestedAction[];
  /** Human-readable summary */
  summary: string;
}

// ─── Helpers ──────────────────────────────────────────────

function getCurrentSeason(date: Date): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = date.getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

function isLowLight(hybrid: HybridState, snapshot: SensorSnapshot): boolean {
  if (hybrid.fieldState === 'dim' || hybrid.fieldState === 'still') return true;
  if (snapshot.lux !== null && snapshot.lux < 50) return true;
  return false;
}

function isBrightLight(hybrid: HybridState, snapshot: SensorSnapshot): boolean {
  if (hybrid.fieldState === 'bright') return true;
  if (snapshot.lux !== null && snapshot.lux > 400) return true;
  return false;
}

// ─── Main evaluation ─────────────────────────────────────

export function evaluateEcosystem(args: {
  hybrid: HybridState;
  corridor: CorridorState;
  snapshot: SensorSnapshot;
  yard: YardModeResult;
  suit: SuitState;
  now?: Date;
}): EcosystemState {
  const { hybrid, corridor, snapshot, yard, suit, now = new Date() } = args;
  const season = getCurrentSeason(now);

  // Gather sensor data from suit if online, fall back to phone sensors
  const soilMoisture = suit.soilBand?.status === 'online' ? suit.soilBand.moisture : null;
  const soilTemp = suit.soilBand?.status === 'online' ? suit.soilBand.tempC : null;
  const shadeIndex = suit.lightBand?.status === 'online' ? suit.lightBand.shadeIndex : null;
  const quietBandNoise = suit.quietBand?.status === 'online' ? suit.quietBand.noiseDb : null;

  // Use quietBand noise if available, else phone sound, else null
  const effectiveNoise = quietBandNoise ?? snapshot.soundRelativeDb;

  // Use soilBand moisture if available, else infer from yard mode
  const effectiveMoisture = soilMoisture ?? (yard.isFireworkWindow ? 0.5 : null);

  const lowLight = isLowLight(hybrid, snapshot);
  const brightLight = isBrightLight(hybrid, snapshot);

  const inYard = corridor.proximity === 'in-yard' || corridor.proximity === 'near-yard';
  const nearTrail = corridor.proximity === 'near-trail';
  const isCoastal = corridor.nearestTrailName?.toLowerCase().includes('beach') ||
                    corridor.nearestTrailName?.toLowerCase().includes('coast') ||
                    corridor.nearestTrailName?.toLowerCase().includes('cove') ||
                    corridor.nearestTrailName?.toLowerCase().includes('bluff') ||
                    corridor.nearestTrailName?.toLowerCase().includes('harbor') ||
                    corridor.nearestTrailName?.toLowerCase().includes('pier') ||
                    corridor.nearestTrailName?.toLowerCase().includes('dana point') ||
                    false;

  // ─── Check each species ────────────────────────────────

  const invited: InvitedSpecies[] = [];

  for (const species of ECOSYSTEM_CANON) {
    const conds = species.invitationConditions;
    let isInvited = false;
    let reason = '';

    // Always-invited species (native plants that belong in OC)
    if (conds.alwaysInvited) {
      isInvited = true;
      reason = 'Native to this region — belongs here in any season.';
    }

    // Yard-favorable species
    if (!isInvited && conds.yardFavorable && inYard) {
      // Check noise constraint
      if (conds.maxNoiseDb !== undefined && effectiveNoise !== null && effectiveNoise > conds.maxNoiseDb) {
        continue; // too noisy for this species
      }
      // Check moisture requirement
      if (conds.minMoisture !== undefined && effectiveMoisture !== null && effectiveMoisture < conds.minMoisture) {
        continue; // too dry
      }
      // Check light requirement
      if (conds.requiresLowLight && !lowLight) continue;
      if (conds.requiresBrightLight && !brightLight) continue;

      isInvited = true;
      reason = inYard ? `Yard corridor active — ${species.name.toLowerCase()} finds habitat here.` : '';
    }

    // Trail-favorable species
    if (!isInvited && conds.trailFavorable && nearTrail) {
      if (conds.maxNoiseDb !== undefined && effectiveNoise !== null && effectiveNoise > conds.maxNoiseDb) {
        continue;
      }
      if (conds.requiresBrightLight && !brightLight) continue;

      isInvited = true;
      reason = `Near trail corridor — ${corridor.nearestTrailName} supports this species.`;
    }

    // Coastal-favorable species
    if (!isInvited && conds.coastalFavorable && isCoastal) {
      if (conds.maxNoiseDb !== undefined && effectiveNoise !== null && effectiveNoise > conds.maxNoiseDb) {
        continue;
      }

      isInvited = true;
      reason = `Coastal proximity detected — ${corridor.nearestTrailName} is in range.`;
    }

    // Low-light species (nocturnal) — invited regardless of proximity if conditions are right
    if (!isInvited && conds.requiresLowLight && lowLight) {
      if (conds.yardFavorable || conds.alwaysInvited) {
        if (conds.maxNoiseDb !== undefined && effectiveNoise !== null && effectiveNoise > conds.maxNoiseDb) {
          continue;
        }
        isInvited = true;
        reason = `Low light conditions — ${species.name.toLowerCase()} may be active.`;
      }
    }

    if (isInvited) {
      // Check season — if not in peak season, still invited but note it
      const inPeakSeason = species.peakSeasons.includes(season);
      if (!inPeakSeason && !conds.alwaysInvited) {
        // Still invite but adjust reason
        reason += ` (off-peak season — less active)`;
      }
      invited.push({ species, reason: reason || `${species.name} conditions met.` });
    }
  }

  // ─── Conditions score ──────────────────────────────────

  const invitedCount = invited.length;
  let conditionsScore: ConditionsScore;
  if (invitedCount >= 5) conditionsScore = 'good';
  else if (invitedCount >= 2) conditionsScore = 'fair';
  else conditionsScore = 'poor';

  // ─── Suggested actions ─────────────────────────────────

  const suggestedActions: SuggestedAction[] = [];
  const hasFrog = invited.some((i) => i.species.id === 'pacific-chorus-frog');
  const hasNeedlegrass = invited.some((i) => i.species.id === 'purple-needlegrass');
  const hasLemonade = invited.some((i) => i.species.id === 'lemonade-berry');
  const hasTurkeyTail = invited.some((i) => i.species.id === 'turkey-tail');
  const hasBat = invited.some((i) => i.species.id === 'big-brown-bat');

  if (!hasNeedlegrass) suggestedActions.push('add-native-grass');
  if (!hasLemonade) suggestedActions.push('plant-lemonade-berry');
  if (!hasFrog && effectiveMoisture !== null && effectiveMoisture < 0.4) suggestedActions.push('add-water-source');
  if (!hasTurkeyTail) suggestedActions.push('leave-dead-wood');
  if (!hasBat && !lowLight) suggestedActions.push('reduce-light-pollution');

  // ─── Summary ───────────────────────────────────────────

  const parts: string[] = [];
  parts.push(`${invitedCount}/${ECOSYSTEM_CANON.length} species invited`);
  parts.push(`conditions: ${conditionsScore}`);
  if (suggestedActions.length > 0) {
    parts.push(`${suggestedActions.length} suggestion${suggestedActions.length > 1 ? 's' : ''}`);
  }

  return {
    invitedSpecies: invited,
    canonSize: ECOSYSTEM_CANON.length,
    conditionsScore,
    suggestedActions,
    summary: parts.join(' · '),
  };
}
