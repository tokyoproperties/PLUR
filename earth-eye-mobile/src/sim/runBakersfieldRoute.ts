/**
 * sim/runBakersfieldRoute.ts
 *
 * Mission 10 — the four Bakersfield River Walk -> Panorama Bluffs
 * scenarios, run through the real pipeline via runSimulation().
 * Entry point: `npm run sim` (see scripts/run-sim.js).
 */
import { runSimulation } from '@/sim/simulateField';
import { brightFlat } from '@/sim/scenarios/brightFlat';
import { mixedWind } from '@/sim/scenarios/mixedWind';
import { dimCorridor } from '@/sim/scenarios/dimCorridor';
import { seasonalShift } from '@/sim/scenarios/seasonalShift';

const scenarios = [
  brightFlat(0),
  brightFlat(4),
  mixedWind(9),
  mixedWind(13),
  dimCorridor(18),
  dimCorridor(22),
  seasonalShift(27),
];

// Explicit Pacific-time start (9:00 AM PDT, mid-July) -- NOT new Date().
// Default startTime uses the harness process's own local timezone for
// determineCardType()'s hour check; this sandbox runs in UTC, so an
// actual 3pm-Pacific reading was landing on getHours()=22, which is a
// real, correct 'night' card per the production logic -- just fed the
// wrong wall-clock hour by the environment, not a bug in the engine.
const startTime = new Date('2026-07-13T09:00:00-07:00');
const result = runSimulation(scenarios, startTime);

console.log('═══ Mission 10 — Bakersfield Route Simulation ═══\n');

result.moments.forEach((m, i) => {
  console.log(`[${i}] ${scenarios[i].label}`);
  console.log(`    fieldState=${m.fieldState}  corridorTone=${m.corridorTone}  cardType=${m.cardType}`);
  console.log(`    hybridConf=${m.hybridConfidence}  seasonalConf=${m.seasonalConfidence}  locConf=${m.locationConfidence}`);
  console.log(`    invitedSpecies=[${m.invitedSpecies.join(', ')}]  seasonalImminent=[${m.seasonalImminentSpecies.join(', ')}]`);
  console.log(`    cardText: "${m.cardText}"`);
  console.log('');
});

console.log('─── Session Summary ───');
console.log(JSON.stringify(result.sessionSummary, (k, v) => (k === 'moments' ? `[${v.length} moments]` : v), 2));

console.log('\n─── VOICE (6 lines) ───');
console.log('field:          ', result.narrative.fieldLine);
console.log('corridor:       ', result.narrative.corridorLine);
console.log('species:        ', result.narrative.speciesLine);
console.log('season:         ', result.narrative.seasonLine);
console.log('seasonalSpecies:', result.narrative.seasonalSpeciesLine);
console.log('session:        ', result.narrative.sessionLine);
