/**
 * sim/simulateField.ts
 *
 * Mission 10 — Field Simulation Layer. A desktop harness that feeds
 * synthetic-but-real-shaped field conditions through the ACTUAL
 * production engines (captureFieldMoment, deriveSessions,
 * summarizeSession, buildNarrative, evaluateEcosystem, and the
 * seasonal/drift/arrival evaluators captureFieldMoment calls
 * internally) — same discipline as the Mission 8 regression harness.
 *
 * Honesty note on what's "real" here vs authored, since claiming more
 * fidelity than exists would repeat the exact mistake this project
 * keeps catching in mission briefs:
 * - SensorSnapshot and YardModeResult: fed to the REAL evaluateYardMode().
 * - EcosystemState: computed by the REAL evaluateEcosystem() engine.
 * - HybridState and CorridorState: hand-authored presets per scenario,
 *   NOT run through evaluateHybrid()/evaluateCorridor() — those need a
 *   trail marker list, yard geofence point, and Lite-mode result this
 *   harness doesn't stand up. Each scenario file says so explicitly.
 * - FieldMoment, FieldSession, FieldSessionSummary, NarrativeLines: all
 *   produced by the REAL captureFieldMoment / deriveSessions /
 *   summarizeSession / buildNarrative — zero reimplementation.
 *
 * Pure logic — runs under Node (see scripts/run-sim.js), no RN/React.
 */

import type { HybridState } from '@/hybrid/hybrid-engine';
import type { CorridorState } from '@/corridor/corridor-engine';
import type { SensorSnapshot } from '@/hooks/useSensors';
import type { SuitState } from '@/suit/types';
import type { EmergencyState } from '@/emergency/state';
import type { LocationConfidence } from '@/utils/thresholds';
import type { YardModeResult } from '@/modes/yard';
import { evaluateYardMode } from '@/modes/yard';
import { evaluateEcosystem } from '@/ecosystem/ecosystem-engine';
import {
  captureFieldMoment,
  type FieldMoment,
} from '@/atlas/fieldMoment';
import { deriveSessions, summarizeSession } from '@/atlas/fieldSession';
import { buildNarrative } from '@/atlas/narrative';
import { evaluateSeasonalProfile } from '@/atlas/seasonalProfile';
import { evaluateCorridorDrift } from '@/corridor/drift';
import { evaluateSpeciesArrival } from '@/ecosystem/speciesArrival';
import { isCoastalTrailName } from '@/utils/coastalTrails';

/** Everything a scenario needs to hand-author for one simulated reading. */
export interface FieldScenario {
  label: string;
  /** Minutes after the simulation's start time this reading occurs at. */
  minutesFromStart: number;
  hybrid: HybridState;
  corridor: CorridorState;
  snapshot: SensorSnapshot;
  location: { latitude: number; longitude: number } | null;
  locationConfidence: LocationConfidence;
  suit: SuitState;
  emergency: EmergencyState;
  fireworkWindow: boolean;
}

export interface SimulationResult {
  moments: FieldMoment[];
  sessionSummary: ReturnType<typeof summarizeSession> | null;
  narrative: ReturnType<typeof buildNarrative>;
}

const OFFLINE_SUIT: SuitState = {
  quietBand: null,
  soilBand: null,
  lightBand: null,
  fieldTags: [],
  onlineCount: 0,
  totalConfigured: 0,
  summary: 'Suit offline — running on phone sensors.',
};

const NO_EMERGENCY: EmergencyState = {
  fallbackMode: false,
  reason: null,
  triggers: {
    networkOffline: false,
    networkPoor: false,
    batteryLow: false,
    batteryCritical: false,
  },
  hasRealData: true,
  updateIntervalMs: 5000,
  disableAnimations: false,
  maxHybridIntensity: 1,
}

export { OFFLINE_SUIT, NO_EMERGENCY };

/** Runs an ordered list of scenarios through the real capture -> session -> narrative pipeline. */
export function runSimulation(scenarios: FieldScenario[], startTime: Date = new Date()): SimulationResult {
  const moments: FieldMoment[] = [];

  for (const s of scenarios) {
    const now = new Date(startTime.getTime() + s.minutesFromStart * 60_000);

    // Real engine: EcosystemState computed from the scenario's hybrid/
    // corridor/snapshot, not hand-authored.
    const yardInputs = {
      lux: s.snapshot.lux,
      motionMagnitude: s.snapshot.motionMagnitude,
      soundRelativeDb: s.snapshot.soundRelativeDb,
      now,
    };
    const yard: YardModeResult = evaluateYardMode(yardInputs);
    const ecosystem = evaluateEcosystem({
      hybrid: s.hybrid,
      corridor: s.corridor,
      snapshot: s.snapshot,
      yard,
      suit: s.suit,
      now,
    });

    const moment = captureFieldMoment({
      hybrid: s.hybrid,
      corridor: s.corridor,
      ecosystem,
      emergency: s.emergency,
      suit: s.suit,
      snapshot: s.snapshot,
      location: s.location,
      locationConfidence: s.locationConfidence,
      priorMoments: moments,
      fireworkWindow: s.fireworkWindow,
      now,
    });

    moments.push(moment);
  }

  const sessions = deriveSessions(moments);
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const sessionSummary = lastSession ? summarizeSession(lastSession) : null;

  // Rebuild the final narrative inputs the same way captureFieldMoment
  // did internally for the last moment, so buildNarrative() sees
  // consistent seasonal/arrival state (real evaluators, not reused
  // stale values).
  const last = scenarios[scenarios.length - 1];
  const lastNow = new Date(startTime.getTime() + last.minutesFromStart * 60_000);
  const priorToLast = moments.slice(0, -1);
  const seasonalProfile = evaluateSeasonalProfile(priorToLast, lastNow);
  const drift = evaluateCorridorDrift(priorToLast, seasonalProfile.phase, lastNow);
  const nearCoastal = isCoastalTrailName(last.corridor.nearestTrailName);
  const arrivals = evaluateSpeciesArrival({
    season: seasonalProfile.phase,
    drift,
    snapshot: last.snapshot,
    nearCoastal,
    now: lastNow,
  });

  const yardInputsLast = {
    lux: last.snapshot.lux,
    motionMagnitude: last.snapshot.motionMagnitude,
    soundRelativeDb: last.snapshot.soundRelativeDb,
    now: lastNow,
  };
  const yardLast = evaluateYardMode(yardInputsLast);
  const ecosystemLast = evaluateEcosystem({
    hybrid: last.hybrid,
    corridor: last.corridor,
    snapshot: last.snapshot,
    yard: yardLast,
    suit: last.suit,
    now: lastNow,
  });

  const narrative = buildNarrative({
    hybrid: last.hybrid,
    corridor: last.corridor,
    ecosystem: ecosystemLast,
    seasonal: seasonalProfile,
    arrivals,
    session: sessionSummary,
  });

  return { moments, sessionSummary, narrative };
}
