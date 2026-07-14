/**
 * SeasonalFieldCard.tsx -- Arc 27
 *
 * Three-register color system (unchanged):
 *   Window label   <- constellation archetype tint (weeks)
 *   Suggestion     <- reweight dominant tint (days)
 *   Chapter label  <- drift direction tint (weeks, directional)
 *
 * Arc 27 addition: "Field mood: X" appended to the chapter footer.
 * One word. No new color. No new row. The slow layers now speak
 * with one voice at the bottom of the card.
 *
 * Visibility gate: harmony.isReadable (at least one sibling active).
 */
import { StyleSheet, View } from 'react-native';
import { useRef } from 'react';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useSeason } from '@/hooks/useSeason';
import { useSeasonalFieldWindow } from '@/hooks/useSeasonalFieldWindow';
import { useFieldAlignment } from '@/hooks/useFieldAlignment';
import { useFieldPresence } from '@/hooks/useFieldPresence';
import { useFieldInitiative } from '@/hooks/useFieldInitiative';
import { useFieldBranch } from '@/hooks/useFieldBranch';
import { useFieldReweight } from '@/hooks/useFieldReweight';
import { useFieldConstellation } from '@/hooks/useFieldConstellation';
import { useFieldDrift } from '@/hooks/useFieldDrift';
import { useFieldHarmony } from '@/hooks/useFieldHarmony';
import { FieldSummaryStrip } from '@/components/FieldSummaryStrip';
import { useFieldForesight } from '@/hooks/useFieldForesight';
import { useAtlas } from '@/atlas/useAtlas';

const QUALITY_ACCENT: Record<string, string> = {
  prime:    Accents.sage,
  good:     Accents.sage,
  marginal: '#C4974A',
  avoid:    '#C47A7A',
};

const ALIGNMENT_COLOR: Record<string, string> = {
  aligned:    '#7AB87A',
  neutral:    'rgba(255,255,255,0.35)',
  misaligned: '#C47A7A',
};

const PRESENCE_COLOR: Record<string, string> = {
  present:  '#7AB87A',
  drifting: '#C4974A',
  absent:   'rgba(255,255,255,0.25)',
};

const INITIATIVE_COLOR: Record<string, string> = {
  observe:  '#7A9AB8',
  move:     '#7AB87A',
  rest:     '#9A7AB8',
  explore:  '#C4974A',
  return:   '#C47A7A',
};

const BRANCH_COLOR: Record<string, string> = {
  stillness:   '#9A7AB8',
  movement:    '#7AB87A',
  observation: '#7A9AB8',
  return:      '#C47A7A',
  exploration: '#C4974A',
};

const CONSTELLATION_TINT: Record<string, string> = {
  wanderer:  '#7AB87A',
  observer:  '#7A9AB8',
  steady:    'rgba(255,255,255,0.85)',
  returner:  '#9A7AB8',
  seeker:    '#C4974A',
};

const REWEIGHT_TINT: Record<string, string> = {
  alignment:  '#7AB87A',
  presence:   '#9A7AB8',
  initiative: '#C4974A',
  branch:     '#7A9AB8',
  soul:       '#9A7AB8',
  season:     'rgba(255,255,255,0.72)',
};

const DRIFT_TINT: Record<string, string> = {
  settling:    'rgba(255,255,255,0.28)',
  brightening: 'rgba(196,151,74,0.55)',
  wandering:   'rgba(122,154,184,0.55)',
  returning:   'rgba(154,122,184,0.55)',
  seeking:     'rgba(196,151,74,0.65)',
};

export function SeasonalFieldCard() {
  const { label }      = useSeason();
  const fieldWindow    = useSeasonalFieldWindow();
  const alignment      = useFieldAlignment();
  const presence       = useFieldPresence();
  const initiative     = useFieldInitiative();
  const branch         = useFieldBranch();
  const reweight       = useFieldReweight();
  const constellation  = useFieldConstellation();
  const drift          = useFieldDrift();
  const harmony        = useFieldHarmony();
  const foresight      = useFieldForesight();
  const atlas          = useAtlas();
  const totalMoments   = atlas.totalMoments;
  const latestMoment   = atlas.latest;
  const allMoments     = atlas.moments;

  // Arc 32: delta -- compare current slow signals to previous render
  const prevArchetypeRef = useRef<string | null>(null);
  const prevDriftRef     = useRef<string | null>(null);
  const prevForecastRef  = useRef<string | null>(null);

  // Arc 50: echo -- card's own self-history for narrative continuity
  const echoEssenceRef     = useRef<string | null>(null);
  const echoOriVecRef      = useRef<string | null>(null);
  const echoToneRef        = useRef<string | null>(null);
  const echoClarityRef     = useRef<number>(0.70);
  const echoThresholdRef   = useRef<number>(0.55);
  const echoVisibleSetRef  = useRef<string>('');

  const archChanged  = prevArchetypeRef.current !== null && prevArchetypeRef.current !== constellation.archetype;
  const driftChanged = prevDriftRef.current     !== null && prevDriftRef.current     !== drift.direction;
  const foreChanged  = prevForecastRef.current  !== null && prevForecastRef.current  !== foresight.forecast;
  const anyChanged   = archChanged || driftChanged || foreChanged;

  // Compute delta phrase (before updating refs)
  const deltaPhrase: string | null = (() => {
    const stripActive = constellation.isFormed && drift.isMeasurable && foresight.isActive;
    if (!stripActive || !anyChanged) return null;
    // Behavior shift gets a direction-aware label
    if (driftChanged) {
      const driftLabels: Record<string, string> = {
        settling:    'Field settling.',
        brightening: 'Field brightening.',
        seeking:     'Field turning.',
        returning:   'Field cooling.',
        wandering:   'Behavior shifted.',
      };
      return driftLabels[drift.direction] ?? 'Behavior shifted.';
    }
    if (archChanged)  return 'Character shifted.';
    if (foreChanged)  return 'Trajectory shifted.';
    return null;
  })();

  // Update refs AFTER computing delta (so we compare against previous values)
  if (constellation.isFormed)   prevArchetypeRef.current = constellation.archetype;
  if (drift.isMeasurable)       prevDriftRef.current     = drift.direction;
  if (foresight.isActive)       prevForecastRef.current  = foresight.forecast;

  // Arc 34: stable identity name (earned at 30 moments)
  const identityReady =
    totalMoments >= 30 &&
    constellation.isFormed &&
    harmony.isReadable &&
    drift.isMeasurable &&
    foresight.isActive;

  const fieldIdentity: string | null = (() => {
    if (!identityReady) return null;
    // Noun from archetype
    const NOUN: Record<string, string> = {
      wanderer: 'Corridor',
      observer: 'Reach',
      steady:   'Ground',
      returner: 'Bend',
      seeker:   'Ridge',
    };
    // Adjective from harmony mood
    const ADJ: Record<string, string> = {
      settled:     'Settled',
      restless:    'Restless',
      turning:     'Turning',
      brightening: 'Bright',
      cooling:     'Quiet',
    };
    // Drift modifier: certain moods shift the adjective
    const DRIFT_OVERRIDE: Record<string, Partial<Record<string, string>>> = {
      settling:    { restless: 'Settling' },
      brightening: { cooling: 'Brightening' },
      seeking:     { settled: 'Wandering' },
      returning:   { restless: 'Returning', turning: 'Returning' },
      wandering:   { steady: 'Drifting' },
    };
    const adj = DRIFT_OVERRIDE[drift.direction]?.[harmony.mood]
      ?? ADJ[harmony.mood]
      ?? 'Still';
    const noun = NOUN[constellation.archetype] ?? 'Field';
    return `${adj} ${noun}`;
  })();

  // Arc 35: field history -- recent pattern from last 12-20 moments
  const HISTORY_WINDOW = 20;
  const HISTORY_MIN    = 12;
  const historyPhrase: string | null = (() => {
    const noteActive =
      constellation.isFormed && drift.isMeasurable &&
      harmony.isReadable && foresight.isActive;
    if (!noteActive || allMoments.length < HISTORY_MIN) return null;

    const slice = allMoments.slice(-HISTORY_WINDOW);
    const n     = slice.length;

    // Tone frequency
    const toneCounts: Record<string, number> = {};
    for (const m of slice) {
      if (m.corridorTone) toneCounts[m.corridorTone] = (toneCounts[m.corridorTone] ?? 0) + 1;
    }
    const topTone    = Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0];
    const toneMajority = topTone && topTone[1] / n >= 0.5 ? topTone[0] : null;

    // Drift direction frequency
    const driftCounts: Record<string, number> = {};
    for (const m of slice) {
      // drift.direction is a slow-layer value, not per-moment;
      // use corridorTone as proxy for recent field behavior
    }
    const recentDrift = drift.direction; // slow-layer value, already computed

    // Species presence: any moment with species?
    const speciesMoments = slice.filter(m => m.invitedCount > 0).length;
    const speciesRatio   = speciesMoments / n;

    // Conditions score trend: average
    const avgConds = slice.reduce((s, m) => s + (m.conditionsScore ?? 0.5), 0) / n;

    // Symbolic majority
    const plurCount = slice.filter(m => m.symbolic === 'plur').length;
    const symMajority = plurCount / n >= 0.6 ? 'plur' : 'love';

    // Build phrase from strongest signal
    const TONE_HIST: Record<string, string> = {
      bright:  'mostly bright corridor moments',
      calm:    'calm corridor moments',
      still:   'quiet pockets',
      mixed:   'mixed corridor tones',
      noisy:   'busier edge moments',
    };
    const DRIFT_HIST: Record<string, string> = {
      settling:    'with settling behavior',
      brightening: 'with brightening behavior',
      wandering:   'with widening range',
      returning:   'with returning pattern',
      seeking:     'with expanding territory',
    };

    let core = '';
    if (toneMajority && TONE_HIST[toneMajority]) {
      core = TONE_HIST[toneMajority];
      if (speciesRatio >= 0.5) core += ', frequent species presence';
      else if (DRIFT_HIST[recentDrift]) core += `, ${DRIFT_HIST[recentDrift]}`;
    } else if (speciesRatio >= 0.6) {
      core = 'frequent species pockets';
      if (DRIFT_HIST[recentDrift]) core += `, ${DRIFT_HIST[recentDrift]}`;
    } else if (avgConds >= 0.7) {
      core = 'consistently good conditions';
    } else if (avgConds < 0.35) {
      core = 'mixed or difficult conditions';
    } else {
      core = `${recentDrift ?? 'variable'} pattern`;
    }

    return `Recent pattern: ${core}.`;
  })();

  // Arc 38: field signature -- distilled long-scale repeating pattern
  // Uses full ring (not a window). Pure ring read, no evaluator, no hook.
  const SIGNATURE_MIN = 60;
  const signaturePhrase: string | null = (() => {
    const sigActive =
      identityReady &&                        // identity gate (>= 30) already implies ring depth
      structurePhrase !== null &&             // structure gate (>= 40) already cleared
      allMoments.length >= SIGNATURE_MIN &&
      harmony.isReadable &&
      harmony.agreement >= 0.6;
    if (!sigActive) return null;

    const ring = allMoments;
    const N    = ring.length;

    // -- Long-scale tone distribution ----------------------------------
    const sigTones: Record<string, number> = {};
    for (const m of ring) {
      if (m.corridorTone) sigTones[m.corridorTone] = (sigTones[m.corridorTone] ?? 0) + 1;
    }
    const topToneEntry = Object.entries(sigTones).sort((a, b) => b[1] - a[1])[0];
    const sigTone      = topToneEntry && topToneEntry[1] / N >= 0.40 ? topToneEntry[0] : null;

    // -- Long-scale species presence -----------------------------------
    const speciesMoments = ring.filter(m => m.invitedCount > 0).length;
    const speciesRatio   = speciesMoments / N;
    const speciesHeavy   = speciesRatio >= 0.55;

    // -- Long-scale symbolic mode --------------------------------------
    const plurMoments  = ring.filter(m => m.symbolic === 'plur').length;
    const symDominant  = plurMoments / N >= 0.60 ? 'plur' : 'love';

    // -- Long-scale reweight dominant frequency ------------------------
    // reweight.dominant is already the long-scale aggregate from useFieldReweight
    const sigReweight = reweight.isMature ? reweight.dominant : null;

    // -- Long-scale drift direction frequency --------------------------
    // drift.direction is already the long-scale slow-layer value
    const sigDrift = drift.isMeasurable ? drift.direction : null;

    // -- Long-scale harmony mood ---------------------------------------
    const sigMood = harmony.isReadable ? harmony.mood : null;

    // -- Compose signature phrase from strongest signals ---------------
    // Noun: what kind of field is this at its core?
    const SIG_NOUN: Record<string, string> = {
      bright: 'bright corridor',
      calm:   'calm trail',
      still:  'quiet pocket',
      mixed:  'mixed corridor',
      noisy:  'active edge',
    };

    // Verb phrase: what does it characteristically DO?
    const REWEIGHT_VERB: Record<string, string> = {
      alignment:  'steady movement',
      presence:   'frequent species returns',
      initiative: 'brightening initiative',
      branch:     'widening territory',
      soul:       'open-ground returns',
      season:     'seasonal deepening',
    };

    const DRIFT_VERB: Record<string, string> = {
      settling:    'settling drift',
      brightening: 'brightening drift',
      wandering:   'wandering range',
      returning:   'returning pattern',
      seeking:     'expanding reach',
    };

    const MOOD_VERB: Record<string, string> = {
      settled:     'settled behavior',
      restless:    'restless returns',
      turning:     'turning behavior',
      brightening: 'brightening tendency',
      cooling:     'cooling tendency',
    };

    // Noun from dominant tone; fallback to species or symbolic signal
    let noun = sigTone ? (SIG_NOUN[sigTone] ?? 'field') : null;
    if (!noun) {
      noun = speciesHeavy ? 'species-rich ground'
           : symDominant === 'love' ? 'quiet interior'
           : 'open field';
    }

    // Verb from reweight (strongest behavioural signal); fallback drift; fallback mood
    let verb = sigReweight ? (REWEIGHT_VERB[sigReweight] ?? null) : null;
    if (!verb) verb = sigDrift ? (DRIFT_VERB[sigDrift] ?? null) : null;
    if (!verb) verb = sigMood  ? (MOOD_VERB[sigMood]   ?? null) : null;
    if (!verb) verb = speciesHeavy ? 'frequent species presence' : null;

    if (!verb) return null;

    return `Signature: ${noun} with ${verb}.`;
  })();

  // Arc 39: field resilience -- structural stability coefficient
  // Pure ring read. No evaluator, no hook. Reads full ring only.
  const RESILIENCE_MIN = 80;
  const resiliencePhrase: string | null = (() => {
    const resActive =
      signaturePhrase !== null &&         // sig gate (>= 60) already cleared
      allMoments.length >= RESILIENCE_MIN &&
      harmony.isReadable &&
      harmony.agreement >= 0.6;
    if (!resActive) return null;

    const ring = allMoments;
    const N    = ring.length;

    // Helper: variance of a numeric array (population variance)
    function variance(arr: number[]): number {
      if (arr.length < 2) return 0;
      const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
      return arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
    }

    // Helper: how often does the dominant value change across
    // non-overlapping buckets of size `bucketSize`?
    function volatility(values: string[], bucketSize: number): number {
      const buckets: string[] = [];
      for (let i = 0; i + bucketSize <= values.length; i += bucketSize) {
        const slice = values.slice(i, i + bucketSize);
        const cnt: Record<string, number> = {};
        for (const v of slice) cnt[v] = (cnt[v] ?? 0) + 1;
        buckets.push(Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0]);
      }
      // Fraction of adjacent bucket-pairs where dominant value changes
      if (buckets.length < 2) return 0;
      let changes = 0;
      for (let i = 1; i < buckets.length; i++) {
        if (buckets[i] !== buckets[i - 1]) changes++;
      }
      return changes / (buckets.length - 1);
    }

    // -- Tone variance (0 = perfectly stable, higher = more variable) --
    const tones = ring.map(m => m.corridorTone ?? 'mixed');
    const toneVol = volatility(tones, Math.max(5, Math.floor(N / 12)));

    // -- Season entropy variance across sliding windows ----------------
    const WIN = Math.max(10, Math.floor(N / 8));
    const seasonEntropies: number[] = [];
    for (let i = WIN; i <= N; i += Math.floor(WIN / 2)) {
      const wSlice = ring.slice(i - WIN, i);
      const cnt: Record<string, number> = {};
      for (const m of wSlice) if (m.season) cnt[m.season] = (cnt[m.season] ?? 0) + 1;
      const LOG4 = Math.log(4);
      let H = 0;
      for (const v of Object.values(cnt)) {
        const p = v / WIN; if (p > 0) H -= p * Math.log(p);
      }
      seasonEntropies.push(H / LOG4);
    }
    const seasonEntropyVar = variance(seasonEntropies);

    // -- Species presence variance (invitedCount) ----------------------
    const speciesCounts = ring.map(m => m.invitedCount ?? 0);
    const speciesVar = variance(speciesCounts) /
      Math.max(1, Math.max(...speciesCounts) ** 2);  // normalize to [0,1]

    // -- Reweight dominant volatility (bucket size 8) ------------------
    const reweightVol = reweight.isMature
      ? volatility(ring.map(m => m.symbolic ?? 'plur'), Math.max(5, Math.floor(N / 10)))
      : 0.5;

    // -- Drift direction volatility (bucket size 10) -------------------
    const driftVol = drift.isMeasurable
      ? volatility(ring.map(m => m.corridorTone ?? 'mixed'), Math.max(5, Math.floor(N / 8)))
      : 0.5;

    // -- Harmony variance (use conditionsScore as numeric proxy) -------
    const condScores = ring.map(m => m.conditionsScore ?? 0.5);
    const harmVar = variance(condScores);

    // -- Weighted resilience coefficient (higher = more resilient) -----
    // Low volatility/variance = high resilience
    const rawScore =
      (1 - toneVol)          * 0.25 +
      (1 - seasonEntropyVar) * 0.20 +
      (1 - speciesVar)       * 0.15 +
      (1 - reweightVol)      * 0.15 +
      (1 - driftVol)         * 0.15 +
      (1 - Math.min(harmVar * 4, 1)) * 0.10;
    // Clamp to [0, 1]
    const coeff = Math.max(0, Math.min(1, rawScore));

    const RESILIENCE_PHRASE: Array<[number, string]> = [
      [0.85, 'Resilience: strongly stable.'],
      [0.65, 'Resilience: moderately stable.'],
      [0.45, 'Resilience: lightly stable.'],
      [0.25, 'Resilience: variable.'],
      [0.00, 'Resilience: fragile.'],
    ];

    for (const [threshold, phrase] of RESILIENCE_PHRASE) {
      if (coeff >= threshold) return phrase;
    }
    return 'Resilience: fragile.';
  })();

  // Arc 40: field lineage -- earliest 40-moment origin pattern
  // Pure earliest-slice read. No evaluator, no hook.
  const LINEAGE_MIN   = 100;
  const LINEAGE_SLICE = 40;
  const lineagePhrase: string | null = (() => {
    const linActive =
      resiliencePhrase !== null &&        // resilience gate (>= 80) already cleared
      allMoments.length >= LINEAGE_MIN &&
      harmony.isReadable &&
      harmony.agreement >= 0.6;
    if (!linActive) return null;

    // Read earliest LINEAGE_SLICE moments only
    const early = allMoments.slice(0, LINEAGE_SLICE);
    const eN    = early.length;  // always LINEAGE_SLICE when linActive

    // -- Earliest stable tone (>= 40% threshold, same as signature) ---
    const eTones: Record<string, number> = {};
    for (const m of early) {
      if (m.corridorTone) eTones[m.corridorTone] = (eTones[m.corridorTone] ?? 0) + 1;
    }
    const eTopTone  = Object.entries(eTones).sort((a, b) => b[1] - a[1])[0];
    const earlyTone = eTopTone && eTopTone[1] / eN >= 0.40 ? eTopTone[0] : null;

    // -- Earliest stable season (>= 40%) ------------------------------
    const eSeasons: Record<string, number> = {};
    for (const m of early) {
      if (m.season) eSeasons[m.season] = (eSeasons[m.season] ?? 0) + 1;
    }
    const eTopSeason  = Object.entries(eSeasons).sort((a, b) => b[1] - a[1])[0];
    const earlySeason = eTopSeason && eTopSeason[1] / eN >= 0.40 ? eTopSeason[0] : null;

    // -- Earliest species presence ------------------------------------
    const eSpeciesMoments = early.filter(m => m.invitedCount > 0).length;
    const earlySpeciesHeavy = eSpeciesMoments / eN >= 0.50;

    // -- Earliest symbolic mode ---------------------------------------
    const ePlusMoments = early.filter(m => m.symbolic === 'plur').length;
    const earlySym     = ePlusMoments / eN >= 0.55 ? 'plur' : 'love';

    // -- Earliest cardType (behavioral origin) ------------------------
    const eCardTypes: Record<string, number> = {};
    for (const m of early) {
      if (m.cardType) eCardTypes[m.cardType] = (eCardTypes[m.cardType] ?? 0) + 1;
    }
    const eTopCard  = Object.entries(eCardTypes).sort((a, b) => b[1] - a[1])[0];
    const earlyCard = eTopCard?.[0] ?? null;

    // -- Phrase composition -------------------------------------------
    // Verb: what was the field doing at its origin?
    const CARD_VERB: Record<string, string> = {
      trail:    'trail moments',
      coastal:  'coastal openings',
      yard:     'yard pockets',
      night:    'night moments',
      field:    'field moments',
      fallback: 'field moments',
    };

    const TONE_ADJ: Record<string, string> = {
      bright: 'bright',
      calm:   'calm',
      still:  'quiet',
      mixed:  'mixed',
      noisy:  'active',
    };

    const SEASON_PHRASE: Record<string, string> = {
      spring: 'early spring',
      summer: 'warm summer',
      fall:   'turning fall',
      winter: 'quiet winter',
    };

    // Noun: what defined the earliest moments?
    // Priority: tone > species-heavy > cardType > season > symbolic
    let origin: string;
    const toneAdj  = earlyTone ? (TONE_ADJ[earlyTone] ?? null) : null;
    const cardVerb = earlyCard ? (CARD_VERB[earlyCard] ?? 'field moments') : 'field moments';

    if (toneAdj && earlySpeciesHeavy) {
      origin = `${toneAdj} corridor with early species presence`;
    } else if (toneAdj) {
      origin = `${toneAdj} ${cardVerb}`;
    } else if (earlySpeciesHeavy) {
      origin = `species-rich ${cardVerb}`;
    } else if (earlySeason) {
      origin = `${SEASON_PHRASE[earlySeason]} ${cardVerb}`;
    } else {
      origin = earlySym === 'love' ? 'quiet interior beginnings' : 'open field beginnings';
    }

    // Verb prefix: how did it originate?
    const eTopToneRatio = eTopTone ? eTopTone[1] / eN : 0;
    const verb = eTopToneRatio >= 0.65 ? 'born from'
               : earlySeason           ? 'rooted in'
               : earlySpeciesHeavy     ? 'seeded by'
               : 'shaped by';

    return `Lineage: ${verb} ${origin}.`;
  })();

  // Arc 41: field rhythm -- long-scale temporal cadence
  // Pure ring read. No evaluator, no hook.
  const RHYTHM_MIN = 120;
  const rhythmPhrase: string | null = (() => {
    const rActive =
      lineagePhrase !== null &&           // lineage gate (>= 100) already cleared
      allMoments.length >= RHYTHM_MIN &&
      harmony.isReadable &&
      harmony.agreement >= 0.6;
    if (!rActive) return null;

    const ring = allMoments;
    const N    = ring.length;

    // -- Moment spacing: median gap between consecutive timestamps -----
    const gaps: number[] = [];
    for (let i = 1; i < N; i++) {
      const gap = ring[i].timestamp - ring[i - 1].timestamp;
      if (gap > 0 && gap < 30 * 24 * 3600 * 1000) gaps.push(gap); // ignore >30d gaps
    }
    gaps.sort((a, b) => a - b);
    const medianGapMs = gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : 0;
    const medianGapDays = medianGapMs / (24 * 3600 * 1000);

    // Spacing class
    const spacing: 'dense' | 'steady' | 'slow' | 'sparse' =
      medianGapDays < 0.5  ? 'dense'  :
      medianGapDays < 3    ? 'steady' :
      medianGapDays < 10   ? 'slow'   : 'sparse';

    // -- Tone oscillation: how often does dominant tone alternate ------
    // Bucket into N/10 windows; count dominant-tone changes
    const BUCKET = Math.max(5, Math.floor(N / 10));
    const toneBuckets: string[] = [];
    for (let i = 0; i + BUCKET <= N; i += BUCKET) {
      const sl = ring.slice(i, i + BUCKET);
      const cnt: Record<string, number> = {};
      for (const m of sl) if (m.corridorTone) cnt[m.corridorTone] = (cnt[m.corridorTone] ?? 0) + 1;
      const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
      if (top) toneBuckets.push(top[0]);
    }
    let toneChanges = 0;
    for (let i = 1; i < toneBuckets.length; i++) {
      if (toneBuckets[i] !== toneBuckets[i - 1]) toneChanges++;
    }
    const toneOscRate = toneBuckets.length > 1
      ? toneChanges / (toneBuckets.length - 1) : 0;

    // -- Symbolic alternation: plur/love switch rate (same bucket) -----
    const symBuckets: string[] = [];
    for (let i = 0; i + BUCKET <= N; i += BUCKET) {
      const sl = ring.slice(i, i + BUCKET);
      const plur = sl.filter(m => m.symbolic === 'plur').length;
      symBuckets.push(plur / sl.length >= 0.5 ? 'plur' : 'love');
    }
    let symChanges = 0;
    for (let i = 1; i < symBuckets.length; i++) {
      if (symBuckets[i] !== symBuckets[i - 1]) symChanges++;
    }
    const symOscRate = symBuckets.length > 1
      ? symChanges / (symBuckets.length - 1) : 0;

    // -- Season cycle: how many full season transitions occurred -------
    let seasonTransitions = 0;
    for (let i = 1; i < N; i++) {
      if (ring[i].season !== ring[i - 1].season) seasonTransitions++;
    }
    // Normalize: a field with 120+ moments could have seen 0-10+ transitions
    const seasonCycleRate = Math.min(1, seasonTransitions / (N / 20));

    // -- Species periodicity: alternating dense/sparse windows --------
    const speciesBuckets: boolean[] = [];
    for (let i = 0; i + BUCKET <= N; i += BUCKET) {
      const sl = ring.slice(i, i + BUCKET);
      speciesBuckets.push(sl.filter(m => m.invitedCount > 0).length / sl.length >= 0.5);
    }
    let speciesChanges = 0;
    for (let i = 1; i < speciesBuckets.length; i++) {
      if (speciesBuckets[i] !== speciesBuckets[i - 1]) speciesChanges++;
    }
    const speciesOscRate = speciesBuckets.length > 1
      ? speciesChanges / (speciesBuckets.length - 1) : 0;

    // -- Composite oscillation score ----------------------------------
    const oscScore =
      toneOscRate    * 0.35 +
      symOscRate     * 0.25 +
      seasonCycleRate* 0.25 +
      speciesOscRate * 0.15;

    // Oscillation class
    const osc: 'flat' | 'gentle' | 'moderate' | 'active' =
      oscScore < 0.15 ? 'flat'     :
      oscScore < 0.35 ? 'gentle'   :
      oscScore < 0.60 ? 'moderate' : 'active';

    // -- Primary tone pair (for named oscillation phrases) ------------
    const sortedTones = Object.entries(
      (() => {
        const c: Record<string, number> = {};
        for (const m of ring) if (m.corridorTone) c[m.corridorTone] = (c[m.corridorTone] ?? 0) + 1;
        return c;
      })()
    ).sort((a, b) => b[1] - a[1]);
    const tone1 = sortedTones[0]?.[0] ?? null;
    const tone2 = sortedTones[1]?.[0] ?? null;

    // -- Phrase composition -------------------------------------------
    // Tone pair label for oscillation phrases
    const TONE_PAIR: Record<string, Record<string, string>> = {
      bright: { calm: 'bright-calm', still: 'bright-quiet', mixed: 'bright-mixed', noisy: 'bright-noisy', bright: 'bright' },
      calm:   { bright: 'calm-bright', still: 'calm-quiet', mixed: 'calm-mixed', noisy: 'calm-noisy', calm: 'calm' },
      still:  { bright: 'quiet-bright', calm: 'quiet-calm', mixed: 'quiet-mixed', noisy: 'quiet-active', still: 'quiet' },
      mixed:  { bright: 'mixed-bright', calm: 'mixed-calm', still: 'mixed-quiet', noisy: 'mixed-active', mixed: 'mixed' },
      noisy:  { bright: 'active-bright', calm: 'active-calm', still: 'active-quiet', mixed: 'active-mixed', noisy: 'active' },
    };
    const tonePair = tone1 && tone2
      ? (TONE_PAIR[tone1]?.[tone2] ?? `${tone1}`) : (tone1 ?? 'mixed');

    // Spacing label
    const SPACING_LABEL: Record<string, string> = {
      dense:  'fast',
      steady: 'steady',
      slow:   'slow',
      sparse: 'sparse',
    };

    // Final phrase: cadence type from oscillation + spacing context
    if (osc === 'flat') {
      return `Rhythm: ${SPACING_LABEL[spacing]}-steady cadence.`;
    } else if (osc === 'gentle') {
      return `Rhythm: ${tonePair} drift, ${SPACING_LABEL[spacing]} tempo.`;
    } else if (osc === 'moderate') {
      return `Rhythm: ${tonePair} oscillation, ${SPACING_LABEL[spacing]} tempo.`;
    } else {
      // active oscillation -- seasonal and species cycling is prominent
      return seasonCycleRate > 0.5
        ? `Rhythm: mixed seasonal pulse, ${SPACING_LABEL[spacing]} tempo.`
        : `Rhythm: ${tonePair} alternation, ${SPACING_LABEL[spacing]} tempo.`;
    }
  })();

  // Arc 42: field orientation -- long-scale directional lean
  // Pure ring read. No evaluator, no hook.
  const ORIENTATION_MIN = 140;
  const orientationPhrase: string | null = (() => {
    const oActive =
      rhythmPhrase !== null &&            // rhythm gate (>= 120) already cleared
      allMoments.length >= ORIENTATION_MIN &&
      harmony.isReadable &&
      harmony.agreement >= 0.6;
    if (!oActive) return null;

    const ring = allMoments;
    const N    = ring.length;

    // Orientation vectors: 8 named directions matching spec + foresight vocabulary
    type OrientVec =
      'opening' | 'deepening' | 'turning' | 'brightening' |
      'cooling'  | 'settling'  | 'widening' | 'returning';

    const tally: Record<OrientVec, number> = {
      opening:    0, deepening: 0, turning:    0, brightening: 0,
      cooling:    0, settling:  0, widening:   0, returning:   0,
    };

    // -- Tone directional bias (per moment, weight 0.20 total) --------
    const TONE_VEC: Record<string, OrientVec> = {
      bright: 'opening', calm: 'deepening', noisy: 'widening',
      still:  'cooling', mixed: 'turning',
    };
    const toneW = 0.20 / N;
    for (const m of ring) {
      const v = m.corridorTone ? TONE_VEC[m.corridorTone] : null;
      if (v) tally[v] += toneW;
    }

    // -- Symbolic directional bias (plur -> widening, love -> deepening) --
    const symW = 0.15 / N;
    for (const m of ring) {
      tally[m.symbolic === 'plur' ? 'widening' : 'deepening'] += symW;
    }

    // -- Species directional bias (presence -> opening, absence -> cooling) --
    const specW = 0.10 / N;
    for (const m of ring) {
      tally[(m.invitedCount ?? 0) > 0 ? 'opening' : 'cooling'] += specW;
    }

    // -- conditionsScore directional trend (linear regression slope) --
    // slope > 0 -> brightening, slope < 0 -> cooling
    const scoreW = 0.15;
    const scores = ring.map(m => m.conditionsScore ?? 0.5);
    const xs = scores.map((_, i) => i);
    const xMean = (N - 1) / 2;
    const yMean = scores.reduce((s, v) => s + v, 0) / N;
    const num   = xs.reduce((s, x, i) => s + (x - xMean) * (scores[i] - yMean), 0);
    const den   = xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
    const slope = den > 0 ? num / den : 0;
    // slope is tiny (change per moment); amplify to [0,1] range
    const normSlope = Math.max(-1, Math.min(1, slope * N * 2));
    if (normSlope > 0.05) tally['brightening'] += scoreW * normSlope;
    else if (normSlope < -0.05) tally['cooling'] += scoreW * (-normSlope);
    else tally['settling'] += scoreW * 0.5;

    // -- Season transition direction (spring->summer->fall->winter = forward) --
    const SEASON_ORDER: Record<string, number> = {
      spring: 0, summer: 1, fall: 2, winter: 3,
    };
    const seasonW = 0.15 / Math.max(1, N - 1);
    for (let i = 1; i < N; i++) {
      const prev = SEASON_ORDER[ring[i - 1].season] ?? -1;
      const curr = SEASON_ORDER[ring[i].season]     ?? -1;
      if (prev < 0 || curr < 0 || prev === curr) continue;
      const delta = curr - prev;
      // Forward cycle (spring->summer, summer->fall, fall->winter, winter->spring = -3)
      const forward = delta > 0 || delta === -3;
      tally[forward ? 'turning' : 'returning'] += seasonW;
    }

    // -- Reweight directional bias (mature only, weight 0.15) ---------
    const REWEIGHT_VEC: Record<string, OrientVec> = {
      alignment:  'settling',  presence: 'opening',
      initiative: 'brightening', branch: 'widening',
      soul:       'returning',  season:  'turning',
    };
    if (reweight.isMature) {
      const rv = REWEIGHT_VEC[reweight.dominant];
      if (rv) tally[rv] += 0.15;
    }

    // -- Drift directional bias (measurable only, weight 0.10) --------
    const DRIFT_VEC: Record<string, OrientVec> = {
      settling:    'settling',    brightening: 'brightening',
      wandering:   'widening',    returning:   'returning',
      seeking:     'opening',
    };
    if (drift.isMeasurable) {
      const dv = DRIFT_VEC[drift.direction];
      if (dv) tally[dv] += 0.10;
    }

    // -- Resolve: winning vector with its weight ----------------------
    const sorted = (Object.entries(tally) as [OrientVec, number][])
      .sort((a, b) => b[1] - a[1]);
    const winner     = sorted[0][0];
    const winnerVal  = sorted[0][1];
    const runnerVal  = sorted[1]?.[1] ?? 0;
    // If top two are very close (within 10% of winner), call it 'turning'
    const dominant = (winnerVal - runnerVal) / Math.max(winnerVal, 0.001) >= 0.10
      ? winner : 'turning';

    return `Orientation: leaning ${dominant}.`;
  })();

  // Arc 43: field coherence -- cross-layer agreement score
  // Reads already-computed hook values + a single lightweight ring scan.
  // No new evaluator, no new hook.
  const COHERENCE_MIN = 160;
  const coherencePhrase: string | null = (() => {
    const cActive =
      orientationPhrase !== null &&       // orientation gate (>= 140) already cleared
      allMoments.length >= COHERENCE_MIN &&
      harmony.isReadable &&
      harmony.agreement >= 0.6;
    if (!cActive) return null;

    const ring = allMoments;
    const N    = ring.length;

    // -- Layer agreement scores (all normalized to [0, 1]) ------------

    // 1. Harmony agreement (0.20 weight) -- direct scalar from hook
    const harmScore = harmony.agreement;                           // [0,1]

    // 2. Drift consistency (0.15) -- isMeasurable = has stable signal
    const driftScore = drift.isMeasurable ? 0.80 : 0.40;

    // 3. Reweight consistency (0.15) -- isMature = dominant is stable
    const reweightScore = reweight.isMature ? 0.80 : 0.40;

    // 4. Constellation coherence (0.10) -- isFormed = archetype stable
    const constellScore = constellation.isFormed ? 0.80 : 0.35;

    // 5. Tone stability (0.15) -- gini concentration of corridorTone
    //    High concentration = one tone dominates = high stability
    const toneCnt: Record<string, number> = {};
    for (const m of ring) if (m.corridorTone) {
      toneCnt[m.corridorTone] = (toneCnt[m.corridorTone] ?? 0) + 1;
    }
    const toneSorted = Object.values(toneCnt).sort((a, b) => b - a);
    const toneGini = toneSorted.length > 0 ? toneSorted[0] / N : 0;
    const toneScore = Math.min(1, toneGini * 2);  // [0,1], top tone > 50% -> max

    // 6. Symbolic stability (0.10) -- majority strength of plur/love
    const plurCount = ring.filter(m => m.symbolic === 'plur').length;
    const symMaj    = Math.abs(plurCount / N - 0.5) * 2;  // 0 = split, 1 = unanimous
    const symScore  = symMaj;

    // 7. Species stability (0.10) -- concentration of presence/absence pattern
    const specPresent  = ring.filter(m => (m.invitedCount ?? 0) > 0).length;
    const specMaj      = Math.abs(specPresent / N - 0.5) * 2;
    const specScore    = specMaj;

    // 8. Season entropy stability (0.05) -- low entropy = one season dominates
    const seasonCnt: Record<string, number> = {};
    for (const m of ring) if (m.season) {
      seasonCnt[m.season] = (seasonCnt[m.season] ?? 0) + 1;
    }
    const LOG4 = Math.log(4);
    let H = 0;
    for (const v of Object.values(seasonCnt)) {
      const p = v / N; if (p > 0) H -= p * Math.log(p);
    }
    const seasonScore = 1 - (H / LOG4);  // 0 = fragmented, 1 = one season

    // -- Weighted mean ------------------------------------------------
    const coherenceCoeff =
      harmScore     * 0.20 +
      driftScore    * 0.15 +
      reweightScore * 0.15 +
      constellScore * 0.10 +
      toneScore     * 0.15 +
      symScore      * 0.10 +
      specScore     * 0.10 +
      seasonScore   * 0.05;

    // Clamp (weights already sum to 1.0)
    const c = Math.max(0, Math.min(1, coherenceCoeff));

    const COHERENCE_PHRASE: Array<[number, string]> = [
      [0.80, 'Coherence: strongly aligned.'],
      [0.65, 'Coherence: moderately aligned.'],
      [0.50, 'Coherence: lightly aligned.'],
      [0.35, 'Coherence: mixed.'],
      [0.00, 'Coherence: divergent.'],
    ];

    for (const [threshold, phrase] of COHERENCE_PHRASE) {
      if (c >= threshold) return phrase;
    }
    return 'Coherence: divergent.';
  })();

  // Arc 44: field alignment -- structural-directional agreement
  // Composition layer: reads already-computed values + one ring scan.
  // No new evaluator, no new hook.
  const ALIGNMENT_MIN = 180;
  const alignmentPhrase: string | null = (() => {
    const aActive =
      coherencePhrase !== null &&         // coherence gate (>= 160) already cleared
      allMoments.length >= ALIGNMENT_MIN &&
      harmony.isReadable &&
      harmony.agreement >= 0.6;
    if (!aActive) return null;

    const ring = allMoments;
    const N    = ring.length;

    // -- Orientation vector (extracted from orientationPhrase) ---------
    // orientationPhrase = 'Orientation: leaning {vector}.' or null
    // We need the vector string to compare against structure signals.
    // Parse it directly -- safer than re-deriving.
    const oriVec = orientationPhrase
      ? orientationPhrase.replace('Orientation: leaning ', '').replace('.', '').trim()
      : null;

    // Structural backbone signals -- what does each structural layer say
    // the field IS, and does that match the orientation?

    // 1. Tone-to-orientation match (0.20)
    //    dominant tone maps to a natural orientation; compare to oriVec
    const TONE_NAT_ORI: Record<string, string> = {
      bright: 'opening', calm: 'deepening', noisy: 'widening',
      still:  'cooling', mixed: 'turning',
    };
    const toneCnt: Record<string, number> = {};
    for (const m of ring) if (m.corridorTone) {
      toneCnt[m.corridorTone] = (toneCnt[m.corridorTone] ?? 0) + 1;
    }
    const topTone = Object.entries(toneCnt).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const toneNatOri = topTone ? TONE_NAT_ORI[topTone] : null;
    const toneMatch = oriVec && toneNatOri
      ? (oriVec === toneNatOri ? 1.0 : 0.3) : 0.5;

    // 2. Drift-to-orientation match (0.18)
    const DRIFT_NAT_ORI: Record<string, string> = {
      settling:    'settling',    brightening: 'brightening',
      wandering:   'widening',    returning:   'returning',
      seeking:     'opening',
    };
    const driftNatOri = drift.isMeasurable ? DRIFT_NAT_ORI[drift.direction] : null;
    const driftMatch = oriVec && driftNatOri
      ? (oriVec === driftNatOri ? 1.0 : 0.35) : 0.5;

    // 3. Reweight-to-orientation match (0.18)
    const REWEIGHT_NAT_ORI: Record<string, string> = {
      alignment:  'settling',    presence:    'opening',
      initiative: 'brightening', branch:      'widening',
      soul:       'returning',   season:      'turning',
    };
    const rwNatOri = reweight.isMature ? REWEIGHT_NAT_ORI[reweight.dominant] : null;
    const rwMatch = oriVec && rwNatOri
      ? (oriVec === rwNatOri ? 1.0 : 0.35) : 0.5;

    // 4. Constellation-to-orientation match (0.14)
    const ARCHETYPE_NAT_ORI: Record<string, string> = {
      wanderer:  'widening',  observer:  'deepening',
      steady:    'settling',  returner:  'returning',
      seeker:    'opening',
    };
    const archNatOri = constellation.isFormed
      ? ARCHETYPE_NAT_ORI[constellation.archetype] : null;
    const archMatch = oriVec && archNatOri
      ? (oriVec === archNatOri ? 1.0 : 0.30) : 0.5;

    // 5. Harmony agreement as structural backing (0.15)
    //    High harmony agreement = structure is internally consistent,
    //    which supports any orientation being "real"
    const harmMatch = harmony.agreement;                          // [0,1]

    // 6. Symbolic-to-orientation match (0.08)
    //    love -> deepening/settling/returning; plur -> widening/opening/brightening
    const plurCount = ring.filter(m => m.symbolic === 'plur').length;
    const plurRatio = plurCount / N;
    const symNatOri = plurRatio >= 0.55 ? 'widening'
                    : plurRatio <= 0.45 ? 'deepening' : null;
    const symMatch = oriVec && symNatOri
      ? (oriVec === symNatOri || oriVec === 'opening' || oriVec === 'brightening'
          ? (plurRatio >= 0.55 ? 1.0 : 0.4)
          : (plurRatio <= 0.45 ? 1.0 : 0.4))
      : 0.5;

    // 7. Species-to-orientation match (0.07)
    const specPresent = ring.filter(m => (m.invitedCount ?? 0) > 0).length;
    const specRatio   = specPresent / N;
    // High species presence aligns with opening/brightening/widening orientations
    const SPECIES_OPEN = ['opening', 'brightening', 'widening'];
    const SPECIES_CLOSE = ['cooling', 'settling', 'deepening'];
    const specMatch = oriVec
      ? specRatio >= 0.55 && SPECIES_OPEN.includes(oriVec)  ? 1.0
      : specRatio <= 0.45 && SPECIES_CLOSE.includes(oriVec) ? 1.0
      : 0.45
      : 0.5;

    // -- Weighted mean -------------------------------------------------
    const alignCoeff =
      toneMatch  * 0.20 +
      driftMatch * 0.18 +
      rwMatch    * 0.18 +
      archMatch  * 0.14 +
      harmMatch  * 0.15 +
      symMatch   * 0.08 +
      specMatch  * 0.07;

    const a = Math.max(0, Math.min(1, alignCoeff));

    const ALIGN_PHRASE: Array<[number, string]> = [
      [0.82, 'Alignment: strongly aligned.'],
      [0.68, 'Alignment: moderately aligned.'],
      [0.54, 'Alignment: lightly aligned.'],
      [0.40, 'Alignment: partially aligned.'],
      [0.00, 'Alignment: misaligned.'],
    ];

    for (const [threshold, phrase] of ALIGN_PHRASE) {
      if (a >= threshold) return phrase;
    }
    return 'Alignment: misaligned.';
  })();

  // Arc 45: field continuity -- identity-persistence across all temporal scales
  // Composition layer: flip-rate scan over full ring + hook stability proxies.
  // No new evaluator, no new hook.
  const CONTINUITY_MIN = 200;
  const continuityPhrase: string | null = (() => {
    const ctActive =
      alignmentPhrase !== null &&         // alignment gate (>= 180) already cleared
      allMoments.length >= CONTINUITY_MIN &&
      harmony.isReadable &&
      harmony.agreement >= 0.6;
    if (!ctActive) return null;

    const ring = allMoments;
    const N    = ring.length;

    // Helper: fraction of adjacent pairs where value changes (flip rate)
    // Lower flip rate = higher persistence score
    function flipRate(values: (string | number | boolean | null | undefined)[]): number {
      if (values.length < 2) return 0;
      let flips = 0;
      for (let i = 1; i < values.length; i++) {
        if (values[i] !== values[i - 1]) flips++;
      }
      return flips / (values.length - 1);
    }

    // -- Per-axis persistence (1 - flipRate, so higher = more continuous) --

    // 1. corridorTone persistence (0.18)
    const tonePersist = 1 - flipRate(ring.map(m => m.corridorTone ?? null));

    // 2. Season persistence (0.15)
    const seasonPersist = 1 - flipRate(ring.map(m => m.season ?? null));

    // 3. Symbolic persistence (0.12)
    const symPersist = 1 - flipRate(ring.map(m => m.symbolic ?? null));

    // 4. Species presence persistence (0.12)
    //    Binary: present (invitedCount > 0) or absent
    const specPersist = 1 - flipRate(ring.map(m => (m.invitedCount ?? 0) > 0));

    // 5. conditionsScore persistence (0.10)
    //    Binary: above median or below -- measures stability of quality level
    const scores = ring.map(m => m.conditionsScore ?? 0.5);
    const median = [...scores].sort((a, b) => a - b)[Math.floor(N / 2)];
    const scorePersist = 1 - flipRate(scores.map(s => s >= median));

    // 6. Drift direction persistence (0.10)
    //    isMeasurable = signal is stable; use as a continuity weight
    const driftPersist = drift.isMeasurable ? 0.82 : 0.38;

    // 7. Reweight dominant persistence (0.08)
    const rwPersist = reweight.isMature ? 0.82 : 0.38;

    // 8. Constellation archetype persistence (0.08)
    const archPersist = constellation.isFormed ? 0.85 : 0.35;

    // 9. Harmony persistence (0.07)
    //    harmony.agreement is already a long-scale stability signal
    const harmPersist = harmony.agreement;

    // -- Weighted persistence score ------------------------------------
    const persistCoeff =
      tonePersist    * 0.18 +
      seasonPersist  * 0.15 +
      symPersist     * 0.12 +
      specPersist    * 0.12 +
      scorePersist   * 0.10 +
      driftPersist   * 0.10 +
      rwPersist      * 0.08 +
      archPersist    * 0.08 +
      harmPersist    * 0.07;

    const ct = Math.max(0, Math.min(1, persistCoeff));

    const CONTINUITY_PHRASE: Array<[number, string]> = [
      [0.84, 'Continuity: strongly continuous.'],
      [0.70, 'Continuity: moderately continuous.'],
      [0.55, 'Continuity: lightly continuous.'],
      [0.40, 'Continuity: intermittent.'],
      [0.00, 'Continuity: discontinuous.'],
    ];

    for (const [threshold, phrase] of CONTINUITY_PHRASE) {
      if (ct >= threshold) return phrase;
    }
    return 'Continuity: discontinuous.';
  })();

  // Arc 46: field integrity -- cross-layer non-contradiction score
  // Composition layer: reads prior-arc phrase existence + hook values
  // + one lightweight ring scan. No new evaluator, no new hook.
  const INTEGRITY_MIN = 220;
  const integrityPhrase: string | null = (() => {
    const igActive =
      continuityPhrase !== null &&        // continuity gate (>= 200) already cleared
      allMoments.length >= INTEGRITY_MIN &&
      harmony.isReadable &&
      harmony.agreement >= 0.6;
    if (!igActive) return null;

    const ring = allMoments;
    const N    = ring.length;

    // Integrity = absence of contradiction between layers.
    // Each axis measures how internally consistent one dimension is.
    // We already have continuity (flip-rate) and coherence (gini/agreement).
    // Integrity asks: "do the layers agree WITH EACH OTHER?" not just
    // "does each layer agree with itself?"

    // -- Cross-layer contradiction probes ----------------------------

    // 1. Tone vs symbolic non-contradiction (0.18)
    //    plur moments should trend bright/noisy; love moments calm/still.
    //    Contradiction: plur + still/calm on same moment, or love + bright/noisy.
    const PLUR_TONES   = new Set(['bright', 'noisy', 'mixed']);
    const LOVE_TONES   = new Set(['calm', 'still', 'mixed']);
    let toneSymContrad = 0;
    for (const m of ring) {
      if (!m.corridorTone || !m.symbolic) continue;
      const isPlur = m.symbolic === 'plur';
      const inSet  = isPlur ? PLUR_TONES.has(m.corridorTone)
                            : LOVE_TONES.has(m.corridorTone);
      if (!inSet) toneSymContrad++;
    }
    // Contradiction rate; invert for consistency score
    const toneSymScore = 1 - toneSymContrad / N;

    // 2. Species vs conditions non-contradiction (0.15)
    //    High species presence should correlate with good conditions.
    //    Contradiction: invitedCount > 0 AND conditionsScore < 0.35
    let specCondContrad = 0;
    for (const m of ring) {
      if ((m.invitedCount ?? 0) > 0 && (m.conditionsScore ?? 0.5) < 0.35) {
        specCondContrad++;
      }
    }
    const specCondScore = 1 - specCondContrad / N;

    // 3. Season vs tone non-contradiction (0.14)
    //    Summer/spring should lean bright/noisy; winter/fall calm/still.
    const WARM_TONES = new Set(['bright', 'noisy']);
    const COOL_TONES = new Set(['calm', 'still']);
    let seasonToneContrad = 0;
    for (const m of ring) {
      if (!m.season || !m.corridorTone) continue;
      const isWarm = m.season === 'summer' || m.season === 'spring';
      const isCool = m.season === 'fall'   || m.season === 'winter';
      if (isWarm && COOL_TONES.has(m.corridorTone)) seasonToneContrad++;
      if (isCool && WARM_TONES.has(m.corridorTone)) seasonToneContrad++;
    }
    const seasonToneScore = 1 - seasonToneContrad / N;

    // 4. Drift vs orientation non-contradiction (0.13)
    //    Already computed natural-orientation maps in Arc 42 / Arc 44.
    //    Here: drift direction should match oriVec if both are present.
    const DRIFT_ORI: Record<string, string> = {
      settling:    'settling', brightening: 'brightening',
      wandering:   'widening', returning:   'returning', seeking: 'opening',
    };
    const oriVec2 = orientationPhrase
      ? orientationPhrase.replace('Orientation: leaning ','').replace('.','').trim()
      : null;
    const driftOri2 = drift.isMeasurable ? DRIFT_ORI[drift.direction] : null;
    const driftOriScore = oriVec2 && driftOri2
      ? (oriVec2 === driftOri2 ? 1.0 : 0.30) : 0.55;

    // 5. Reweight vs constellation non-contradiction (0.12)
    //    Each reweight dominant has a natural constellation archetype.
    const RW_ARCH: Record<string, string> = {
      alignment:  'steady',   presence:    'seeker',
      initiative: 'seeker',   branch:      'wanderer',
      soul:       'returner', season:      'observer',
    };
    const naturalArch = reweight.isMature ? RW_ARCH[reweight.dominant] : null;
    const rwArchScore = constellation.isFormed && naturalArch
      ? (constellation.archetype === naturalArch ? 1.0 : 0.35) : 0.55;

    // 6. Harmony agreement as meta-consistency (0.15)
    //    Harmony already aggregates cross-layer vote agreement.
    const harmScore2 = harmony.agreement;

    // 7. conditionsScore vs symbolic non-contradiction (0.08)
    //    plur moments should skew toward higher conditions quality.
    //    Contradiction: plur + conditionsScore < 0.40
    let symCondContrad = 0;
    for (const m of ring) {
      if (m.symbolic === 'plur' && (m.conditionsScore ?? 0.5) < 0.40) {
        symCondContrad++;
      }
    }
    const symCondScore = 1 - symCondContrad / N;

    // 8. Lineage origin vs current tone non-contradiction (0.05)
    //    If lineage says 'bright' origin and current dominant is 'bright',
    //    the field is internally consistent with its origin.
    //    Proxy: lineagePhrase contains the dominant earlyTone label.
    const TONE_LABELS = ['bright', 'calm', 'quiet', 'mixed', 'active'];
    const linTone = lineagePhrase
      ? TONE_LABELS.find(t => lineagePhrase.includes(t)) ?? null : null;
    const TONE_NORM: Record<string,string> = {
      bright:'bright', calm:'calm', quiet:'still', mixed:'mixed', active:'noisy'
    };
    const linToneNorm = linTone ? (TONE_NORM[linTone] ?? null) : null;
    const topTone2 = (() => {
      const c: Record<string,number> = {};
      for (const m of ring) if (m.corridorTone) c[m.corridorTone]=(c[m.corridorTone]??0)+1;
      return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? null;
    })();
    const linToneScore = linToneNorm && topTone2
      ? (linToneNorm === topTone2 ? 1.0 : 0.40) : 0.55;

    // -- Weighted integrity coefficient --------------------------------
    const integrityCoeff =
      toneSymScore    * 0.18 +
      specCondScore   * 0.15 +
      seasonToneScore * 0.14 +
      driftOriScore   * 0.13 +
      rwArchScore     * 0.12 +
      harmScore2      * 0.15 +
      symCondScore    * 0.08 +
      linToneScore    * 0.05;

    const ig = Math.max(0, Math.min(1, integrityCoeff));

    const INTEGRITY_PHRASE: Array<[number, string]> = [
      [0.86, 'Integrity: strongly whole.'],
      [0.72, 'Integrity: moderately whole.'],
      [0.58, 'Integrity: lightly whole.'],
      [0.44, 'Integrity: partial.'],
      [0.00, 'Integrity: fractured.'],
    ];

    for (const [threshold, phrase] of INTEGRITY_PHRASE) {
      if (ig >= threshold) return phrase;
    }
    return 'Integrity: fractured.';
  })();

  // Arc 47: field compression -- adaptive relevance selector
  // Scores each top-stack phrase 0-1 and suppresses those below 0.55.
  // Runs after all phrases are computed; reads only phrase existence +
  // already-available hook values. No new evaluator, no new hook.
  //
  // Identity is never suppressed -- it anchors the card.
  // Compression activates only when integrityPhrase is active (>= 220 moments).
  // Below 220 moments the stack renders as-is (no compression needed --
  // fewer layers are active anyway).

  // Arc 51: field anticipation -- narrative trajectory from echo deltas
  // Runs FIRST so reflection and compression can read anticipated outputs.
  // Activation: >= 360 moments AND harmony >= 0.6.
  // Below threshold all anticipated values are neutral (no pre-shaping).
  const ANTICIP_MIN = 360;
  const anticipActive =
    allMoments.length >= ANTICIP_MIN &&
    harmony.isReadable &&
    harmony.agreement >= 0.6;

  // Anticipated outputs (neutral defaults -- used by reflection + compression)
  type NarrTraj = 'steady' | 'tightening' | 'opening' | 'cooling' | 'turning';
  const anticipation: {
    trajectory:            NarrTraj;
    thresholdBias:         number;   // delta applied to rawThreshold: negative=open, positive=close
    clauseLimitBias:       number;   // -1 = fewer clauses, 0 = neutral, +1 = more clauses
    toneBias:              'calm' | 'bright' | 'neutral';
    driftGuardSensitivity: number;   // 0-1: higher = harder to suppress orientation flip
  } = (() => {
    const neutral = {
      trajectory:            'steady'  as NarrTraj,
      thresholdBias:         0,
      clauseLimitBias:       0,
      toneBias:              'neutral' as const,
      driftGuardSensitivity: 0.5,
    };
    if (!anticipActive) return neutral;

    // Read echo deltas -- compare current computed values to prior stored values
    // echoClarityRef / echoThresholdRef / echoOriVecRef hold LAST render values.

    // -- Delta: clarity trend ----------------------------------------
    // Current clarity not yet computed; approximate from tone stability proxy
    const ring = allMoments;
    const N    = ring.length;
    let toneFlips = 0;
    for (let i = 1; i < N; i++) {
      if (ring[i].corridorTone !== ring[i-1].corridorTone) toneFlips++;
    }
    const approxClarity = 1 - toneFlips / Math.max(1, N - 1);
    const deltaClarity  = approxClarity - echoClarityRef.current;

    // -- Delta: threshold trend --------------------------------------
    const priorThreshold = echoThresholdRef.current; // 0.50 / 0.55 / 0.62
    // Current threshold not yet computed; use prior clarity to anticipate
    const anticipatedRaw =
      approxClarity >= 0.75 ? 0.50 :
      approxClarity >= 0.55 ? 0.55 : 0.62;
    const deltaThreshold = anticipatedRaw - priorThreshold;

    // -- Delta: orientation trend ------------------------------------
    const priorOri  = echoOriVecRef.current;
    // Approximate current orientation from dominant reweight + drift signals
    const REWEIGHT_ORI: Record<string, string> = {
      alignment: 'settling', presence: 'opening', initiative: 'brightening',
      branch: 'widening', soul: 'returning', season: 'turning',
    };
    const DRIFT_ORI_A: Record<string, string> = {
      settling: 'settling', brightening: 'brightening',
      wandering: 'widening', returning: 'returning', seeking: 'opening',
    };
    const approxOri =
      (reweight.isMature ? REWEIGHT_ORI[reweight.dominant] : null) ??
      (drift.isMeasurable ? DRIFT_ORI_A[drift.direction]  : null) ??
      priorOri ?? 'settling';
    const oriChanged = priorOri !== null && priorOri !== approxOri;

    // -- Delta: visible layer count trend ----------------------------
    const priorVisible = echoVisibleSetRef.current
      ? echoVisibleSetRef.current.split(',').filter(Boolean).length : 0;
    // Approximate current visible count from existing phrase count
    const existingCount = [
      signaturePhrase, resiliencePhrase, lineagePhrase, rhythmPhrase,
      orientationPhrase, coherencePhrase, alignmentPhrase,
      continuityPhrase, integrityPhrase,
    ].filter(Boolean).length;
    const deltaVisible = existingCount - priorVisible;

    // -- Derive trajectory from deltas -------------------------------
    // Rules (ordered by specificity):
    //   1. orientation flip + clarity dropping      -> turning
    //   2. clarity rising significantly (> 0.10)   -> opening
    //   3. clarity dropping significantly (< -0.10) -> tightening
    //   4. visible layers shrinking + threshold up  -> tightening
    //   5. visible layers growing + threshold down  -> opening
    //   6. orientation stable + clarity stable      -> steady
    //   7. harmony >= 0.75 + stable                -> cooling (deepen)
    let traj: NarrTraj = 'steady';
    if (oriChanged && deltaClarity < -0.05)             traj = 'turning';
    else if (deltaClarity > 0.10)                       traj = 'opening';
    else if (deltaClarity < -0.10)                      traj = 'tightening';
    else if (deltaVisible < -1 && deltaThreshold > 0)   traj = 'tightening';
    else if (deltaVisible >  1 && deltaThreshold < 0)   traj = 'opening';
    else if (!oriChanged && Math.abs(deltaClarity) < 0.05 && harmony.agreement >= 0.75)
                                                        traj = 'cooling';

    // -- Map trajectory to output values -----------------------------
    const TRAJ_MAP: Record<NarrTraj, {
      thresholdBias: number; clauseLimitBias: number;
      toneBias: 'calm'|'bright'|'neutral'; driftGuardSensitivity: number;
    }> = {
      steady:     { thresholdBias:  0.00, clauseLimitBias:  0, toneBias: 'neutral', driftGuardSensitivity: 0.50 },
      tightening: { thresholdBias:  0.04, clauseLimitBias: -1, toneBias: 'calm',    driftGuardSensitivity: 0.70 },
      opening:    { thresholdBias: -0.04, clauseLimitBias: +1, toneBias: 'bright',  driftGuardSensitivity: 0.30 },
      cooling:    { thresholdBias:  0.02, clauseLimitBias:  0, toneBias: 'calm',    driftGuardSensitivity: 0.60 },
      turning:    { thresholdBias:  0.00, clauseLimitBias:  0, toneBias: 'neutral', driftGuardSensitivity: 0.25 },
    };

    return { trajectory: traj, ...TRAJ_MAP[traj] };
  })();

  // Arc 50: echo -- read prior state BEFORE reflection so clarity
  // can dampen its own swing (echoClarityRef holds last render value).
  const ECHO_MIN = 320;
  const echoActive =
    allMoments.length >= ECHO_MIN &&
    harmony.isReadable &&
    harmony.agreement >= 0.6;

  // Arc 49: field reflection -- clarity score computed BEFORE compression
  // so compression can read it to adjust its own threshold.
  // Activation: essencePhrase requires >= 260 moments, but reflection
  // begins at >= 300 so it only modulates a mature card.
  // Below 300 moments reflectionClarity = 0.70 (neutral -- no modulation).
  const REFLECT_MIN = 300;
  const reflectionClarity: number = (() => {
    if (allMoments.length < REFLECT_MIN || !harmony.isReadable) return 0.70;

    const ring = allMoments;
    const N    = ring.length;

    // -- 1. Layer density score (0.25) ---------------------------------
    // Count how many phrases currently exist (not yet compressed).
    const existingPhrases = [
      signaturePhrase, resiliencePhrase, lineagePhrase, rhythmPhrase,
      orientationPhrase, coherencePhrase, alignmentPhrase,
      continuityPhrase, integrityPhrase,
    ].filter(Boolean).length;
    // Ideal density: 3-5 visible layers (too many = dense, too few = sparse).
    // Score peaks at 4, falls off on either side.
    const densityScore = existingPhrases === 0 ? 0
      : existingPhrases <= 2 ? 0.40               // too sparse
      : existingPhrases <= 5 ? 0.85               // ideal range
      : existingPhrases <= 7 ? 0.65               // getting dense
      : 0.45;                                      // too many layers

    // -- 2. Tone stability score (0.20) --------------------------------
    // Low flip rate = stable tone = high clarity.
    let toneFlips = 0;
    for (let i = 1; i < N; i++) {
      if (ring[i].corridorTone !== ring[i-1].corridorTone) toneFlips++;
    }
    const toneStability = 1 - toneFlips / Math.max(1, N - 1);

    // -- 3. Contradiction rate score (0.20) ----------------------------
    // Inverted contradiction rate: fewer contradictions = clearer field.
    const PLUR_T = new Set(['bright', 'noisy', 'mixed']);
    const LOVE_T = new Set(['calm', 'still', 'mixed']);
    let contradCount = 0;
    for (const m of ring) {
      if (!m.symbolic || !m.corridorTone) continue;
      const inSet = m.symbolic === 'plur' ? PLUR_T.has(m.corridorTone)
                                           : LOVE_T.has(m.corridorTone);
      if (!inSet) contradCount++;
    }
    const nonContradRate = 1 - contradCount / N;

    // -- 4. Harmony agreement (0.20) -----------------------------------
    const harmClarity = harmony.agreement;          // already [0,1]

    // -- 5. Symbolic stability (0.15) ----------------------------------
    let symFlips = 0;
    for (let i = 1; i < N; i++) {
      if (ring[i].symbolic !== ring[i-1].symbolic) symFlips++;
    }
    const symStability = 1 - symFlips / Math.max(1, N - 1);

    // -- Weighted clarity coefficient ----------------------------------
    const clarity =
      densityScore    * 0.25 +
      toneStability   * 0.20 +
      nonContradRate  * 0.20 +
      harmClarity     * 0.20 +
      symStability    * 0.15;

    const raw = Math.max(0, Math.min(1, clarity));
    // Echo inertia: blend 70% new + 30% prior to prevent swing
    const prior = echoClarityRef.current;
    return echoActive ? raw * 0.70 + prior * 0.30 : raw;
  })();

  // Compression threshold modulated by reflection clarity:
  //   high clarity (>= 0.75) -> 0.50 (more layers visible)
  //   balanced (0.55-0.75)   -> 0.55 (default)
  //   low clarity (< 0.55)   -> 0.62 (fewer layers visible)
  const rawThreshold =
    reflectionClarity >= 0.75 ? 0.50 :
    reflectionClarity >= 0.55 ? 0.55 : 0.62;
  // Apply anticipation threshold bias (clamped to valid range 0.46-0.65)
  const biasedThreshold = Math.max(0.46, Math.min(0.65,
    rawThreshold + anticipation.thresholdBias
  ));
  // Echo inertia: blend new threshold 80% / prior 20% to prevent oscillation
  const COMPRESS_THRESHOLD = echoActive
    ? biasedThreshold * 0.80 + echoThresholdRef.current * 0.20
    : biasedThreshold;

  type PhraseKey =
    'signature' | 'resilience' | 'lineage' | 'rhythm' |
    'orientation' | 'coherence' | 'alignment' | 'continuity' | 'integrity';

  const compressed: Record<PhraseKey, boolean> = (() => {
    // When integrity is not yet active, show everything that exists
    if (integrityPhrase === null) {
      return {
        signature:   signaturePhrase   !== null,
        resilience:  resiliencePhrase  !== null,
        lineage:     lineagePhrase     !== null,
        rhythm:      rhythmPhrase      !== null,
        orientation: orientationPhrase !== null,
        coherence:   coherencePhrase   !== null,
        alignment:   alignmentPhrase   !== null,
        continuity:  continuityPhrase  !== null,
        integrity:   false,
      };
    }

    // -- Compute relevance score for each phrase ----------------------
    // Each score is a weighted combination of three axes:
    //   A. Temporal relevance  -- does this layer matter RIGHT NOW?
    //   B. Structural contrast -- does this layer differ from the moment?
    //   C. Harmony amplifier   -- high agreement promotes depth

    const harmBoost = Math.max(0, (harmony.agreement - 0.6) / 0.4); // 0-1 above threshold
    const ring = allMoments;
    const N    = ring.length;

    // Recent-window (last 20 moments) for temporal relevance
    const recent   = ring.slice(-20);
    const rN       = recent.length;

    // Recent flip rate helper
    function recentFlip(vals: (string|boolean|number|null|undefined)[]): number {
      if (vals.length < 2) return 0;
      let f = 0;
      for (let i = 1; i < vals.length; i++) if (vals[i] !== vals[i-1]) f++;
      return f / (vals.length - 1);
    }

    const recentToneFlip    = recentFlip(recent.map(m => m.corridorTone ?? null));
    const recentSymFlip     = recentFlip(recent.map(m => m.symbolic     ?? null));
    const recentSeasonFlip  = recentFlip(recent.map(m => m.season       ?? null));
    const recentSpeciesFlip = recentFlip(recent.map(m => (m.invitedCount ?? 0) > 0));

    // Current moment (most recent)
    const cur = ring[N - 1];

    // -- SIGNATURE: show when current moment matches long-scale pattern --
    // Proxy: current corridorTone matches the lineage-origin tone
    const linToneWord = lineagePhrase
      ? (['bright','calm','quiet','mixed','active'].find(t => lineagePhrase.includes(t)) ?? null)
      : null;
    const LIN_NORM: Record<string,string> = {bright:'bright',calm:'calm',quiet:'still',mixed:'mixed',active:'noisy'};
    const linToneNorm2 = linToneWord ? (LIN_NORM[linToneWord] ?? null) : null;
    const sigTemporalRel  = linToneNorm2 && cur?.corridorTone === linToneNorm2 ? 0.80 : 0.40;
    const sigStructRel    = constellation.isFormed ? 0.75 : 0.45;
    const sigScore = sigTemporalRel * 0.50 + sigStructRel * 0.35 + harmBoost * 0.15;

    // -- RESILIENCE: show when moment contradicts stability --
    // Contradiction: conditionsScore is low when resilience said stable
    const curScore        = cur?.conditionsScore ?? 0.5;
    const resTemporalRel  = curScore < 0.40 ? 0.85 : 0.38; // low quality = resilience relevant
    const resStructRel    = recentToneFlip > 0.40 ? 0.80 : 0.35;
    const resScore = resTemporalRel * 0.50 + resStructRel * 0.35 + harmBoost * 0.15;

    // -- LINEAGE: show when field is returning to early patterns --
    const earlyTone       = lineagePhrase && linToneNorm2 ? linToneNorm2 : null;
    const linTemporalRel  = earlyTone && cur?.corridorTone === earlyTone ? 0.82 : 0.35;
    const linStructRel    = recentSeasonFlip < 0.10 ? 0.72 : 0.40; // stable season = origin moment
    const linScore = linTemporalRel * 0.55 + linStructRel * 0.30 + harmBoost * 0.15;

    // -- RHYTHM: show when moment spacing recently changed --
    // Proxy: recent flip rate on tone is noticeably different from full-ring average
    const fullToneFlip = (() => {
      let f = 0;
      for (let i = 1; i < N; i++) if (ring[i].corridorTone !== ring[i-1].corridorTone) f++;
      return N > 1 ? f / (N-1) : 0;
    })();
    const rhythmTemporalRel = Math.abs(recentToneFlip - fullToneFlip) > 0.15 ? 0.82 : 0.38;
    const rhythmStructRel   = recentSpeciesFlip > 0.30 ? 0.70 : 0.38;
    const rhythmScore = rhythmTemporalRel * 0.55 + rhythmStructRel * 0.30 + harmBoost * 0.15;

    // -- ORIENTATION: show when drift recently changed --
    const oriTemporalRel  = drift.isMeasurable ? 0.78 : 0.35;
    const oriStructRel    = recentSymFlip > 0.30 ? 0.72 : 0.38;
    const oriScore = oriTemporalRel * 0.55 + oriStructRel * 0.30 + harmBoost * 0.15;

    // -- COHERENCE: show when current moment contradicts cross-layer agreement --
    // Proxy: current symbolic vs tone contradiction
    const PLUR_T = new Set(['bright','noisy','mixed']);
    const LOVE_T = new Set(['calm','still','mixed']);
    const curContrad = cur?.symbolic && cur?.corridorTone
      ? !(cur.symbolic === 'plur' ? PLUR_T.has(cur.corridorTone) : LOVE_T.has(cur.corridorTone))
      : false;
    const cohTemporalRel = curContrad ? 0.88 : 0.40;
    const cohStructRel   = harmony.agreement >= 0.75 ? 0.75 : 0.42;
    const cohScore = cohTemporalRel * 0.50 + cohStructRel * 0.35 + harmBoost * 0.15;

    // -- ALIGNMENT: show when structure<->direction mismatch is present --
    const oriVecComp = orientationPhrase
      ? orientationPhrase.replace('Orientation: leaning ','').replace('.','').trim()
      : null;
    const DRIFT_ORI_C: Record<string,string> = {
      settling:'settling', brightening:'brightening',
      wandering:'widening', returning:'returning', seeking:'opening',
    };
    const driftNatOri2 = drift.isMeasurable ? DRIFT_ORI_C[drift.direction] : null;
    const alnMismatch  = oriVecComp && driftNatOri2 && oriVecComp !== driftNatOri2;
    const alnTemporalRel = alnMismatch ? 0.88 : 0.35;
    const alnStructRel   = reweight.isMature ? 0.72 : 0.38;
    const alnScore = alnTemporalRel * 0.50 + alnStructRel * 0.35 + harmBoost * 0.15;

    // -- CONTINUITY: show when flip rate recently dropped (field settling) --
    const contTemporalRel = recentToneFlip < 0.10 ? 0.82 : 0.38;
    const contStructRel   = recentSeasonFlip < 0.10 ? 0.75 : 0.38;
    const contScore = contTemporalRel * 0.55 + contStructRel * 0.30 + harmBoost * 0.15;

    // -- INTEGRITY: show when cross-layer contradiction recently spiked --
    let recentContradCount = 0;
    for (const m of recent) {
      if (!m.symbolic || !m.corridorTone) continue;
      const inSet = m.symbolic === 'plur' ? PLUR_T.has(m.corridorTone) : LOVE_T.has(m.corridorTone);
      if (!inSet) recentContradCount++;
    }
    const recentContradRate = rN > 0 ? recentContradCount / rN : 0;
    const intTemporalRel = recentContradRate > 0.30 ? 0.86 : 0.38;
    const intStructRel   = constellation.isFormed && !drift.isMeasurable ? 0.72 : 0.40;
    const intScore = intTemporalRel * 0.55 + intStructRel * 0.30 + harmBoost * 0.15;

    return {
      signature:   signaturePhrase   !== null && sigScore   >= COMPRESS_THRESHOLD,
      resilience:  resiliencePhrase  !== null && resScore   >= COMPRESS_THRESHOLD,
      lineage:     lineagePhrase     !== null && linScore   >= COMPRESS_THRESHOLD,
      rhythm:      rhythmPhrase      !== null && rhythmScore >= COMPRESS_THRESHOLD,
      orientation: orientationPhrase !== null && oriScore   >= COMPRESS_THRESHOLD,
      coherence:   coherencePhrase   !== null && cohScore   >= COMPRESS_THRESHOLD,
      alignment:   alignmentPhrase   !== null && alnScore   >= COMPRESS_THRESHOLD,
      continuity:  continuityPhrase  !== null && contScore  >= COMPRESS_THRESHOLD,
      integrity:   integrityPhrase   !== null && intScore   >= COMPRESS_THRESHOLD,
    };
  })();

  // Arc 48: field essence -- single distilled sentence from visible layers
  // Synthesis of compressed survivors only. No new evaluator, no new hook.
  const ESSENCE_MIN = 260;
  const essencePhrase: string | null = (() => {
    // Count visible compressed layers (identity excluded -- always shown)
    const visibleCount = Object.values(compressed).filter(Boolean).length;
    const eActive =
      integrityPhrase !== null &&         // compression gate (>= 220) already cleared
      allMoments.length >= ESSENCE_MIN &&
      harmony.isReadable &&
      harmony.agreement >= 0.6 &&
      visibleCount >= 3;
    if (!eActive) return null;

    const ring  = allMoments;
    const N     = ring.length;
    const cur   = ring[N - 1];

    // -- A. Structural axis: what the field IS ------------------------
    // Derived from identity + signature (always available at this depth).
    // Read dominant tone and constellation archetype as structural nouns.
    const toneCnt: Record<string, number> = {};
    for (const m of ring) if (m.corridorTone) {
      toneCnt[m.corridorTone] = (toneCnt[m.corridorTone] ?? 0) + 1;
    }
    const domTone = Object.entries(toneCnt).sort((a,b) => b[1]-a[1])[0]?.[0] ?? 'mixed';

    const TONE_ADJ: Record<string, string> = {
      bright: 'bright', calm: 'calm', noisy: 'active',
      still: 'quiet', mixed: 'mixed',
    };
    const ARCH_NOUN: Record<string, string> = {
      wanderer: 'wandering', observer: 'watching', steady: 'rooted',
      returner: 'returning', seeker: 'seeking',
    };
    const toneAdj   = TONE_ADJ[domTone] ?? 'mixed';
    const archNoun  = constellation.isFormed
      ? (ARCH_NOUN[constellation.archetype] ?? 'settled') : 'settled';

    // -- B. Temporal axis: what the field HAS BEEN DOING -------------
    // Prefer rhythm if compressed.rhythm is visible; else use history proxy.
    let temporalClause = '';
    if (compressed.rhythm && rhythmPhrase) {
      // Extract the cadence descriptor from rhythmPhrase
      // e.g. 'Rhythm: bright-calm drift, steady tempo.' -> 'steady tempo'
      const tempoMatch = rhythmPhrase.match(/([a-z-]+ tempo)\./);
      const cadMatch   = rhythmPhrase.match(/Rhythm: ([^,]+),/);
      if (tempoMatch)      temporalClause = `in a ${tempoMatch[1]}`;
      else if (cadMatch)   temporalClause = `with ${cadMatch[1]}`;
    } else {
      // Fall back: recent season + species presence
      const recentSlice = ring.slice(-12);
      const rSeason     = recentSlice[recentSlice.length - 1]?.season ?? cur?.season ?? '';
      const specFrac    = recentSlice.filter(m => (m.invitedCount ?? 0) > 0).length
                          / Math.max(1, recentSlice.length);
      const SEASON_CL: Record<string, string> = {
        spring: 'through spring',  summer: 'through summer',
        fall:   'through fall',    winter: 'through winter',
      };
      const specCl = specFrac >= 0.55 ? 'with species present' : '';
      temporalClause = [SEASON_CL[rSeason] ?? '', specCl].filter(Boolean).join(', ');
    }

    // -- C. Directional axis: where the field is LEANING -------------
    // Prefer orientation if visible; else invitation; else drift.
    let directionalClause = '';
    if (compressed.orientation && orientationPhrase) {
      // 'Orientation: leaning opening.' -> 'leaning opening'
      const match = orientationPhrase.match(/leaning ([a-z]+)\./);
      if (match) {
        const newVec = match[1];
        // Echo drift guard: if orientation changed but underlying ring
        // hasn't shifted significantly, hold the prior vector.
        const priorVec = echoOriVecRef.current;
        const toneFlipProxy = (() => {
          // Quick: compare dominant tone of first half vs second half
          const half = Math.floor(ring.length / 2);
          const cnt = (slice: typeof ring) => {
            const c: Record<string,number> = {};
            for (const m of slice) if (m.corridorTone) c[m.corridorTone]=(c[m.corridorTone]??0)+1;
            return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? '';
          };
          return cnt(ring.slice(0,half)) !== cnt(ring.slice(half));
        })();
        // Suppress orientation flip if echo is active, prior exists,
        // the vector changed, but the dominant tone didn't shift.
        // driftGuardSensitivity: 0 = easy to flip, 1 = hard to flip
        // At sensitivity 0.25 (turning traj) guard is relaxed -- let flips through.
        // At sensitivity 0.70 (tightening) guard is strict -- suppress unless real.
        const suppressThreshold = anticipation.driftGuardSensitivity;
        // toneFlipProxy is boolean; treat no flip as low evidence (0.3), flip as high (1.0)
        const flipEvidence = toneFlipProxy ? 1.0 : 0.3;
        const suppress = echoActive && priorVec !== null
                      && priorVec !== newVec && flipEvidence < suppressThreshold;
        directionalClause = suppress ? `leaning ${priorVec}` : `leaning ${newVec}`;
      }
    } else if (invitationPhrase) {
      // 'Invitation: ...' -- extract key verb phrase
      const inv = invitationPhrase.replace(/^Invitation:\s*/i, '').replace(/\.$/, '');
      directionalClause = inv.length <= 40 ? inv : '';
    } else if (drift.isMeasurable) {
      const DRIFT_CL: Record<string, string> = {
        settling: 'settling', brightening: 'brightening',
        wandering: 'wandering', returning: 'returning', seeking: 'seeking',
      };
      directionalClause = DRIFT_CL[drift.direction] ?? '';
    }

    // -- Compose: clause count modulated by reflection clarity ---------
    // high clarity (>= 0.75): full three-axis (structural + temporal + directional)
    // balanced (0.55-0.75):   two-axis (structural + directional)
    // low clarity (< 0.55):   minimal (toneAdj + first directional word)
    let sentence: string;

    // Anticipation clauseLimitBias shifts effective clarity tier:
    //  +1 -> act one tier more open (tightening->balanced, balanced->full)
    //  -1 -> act one tier more closed (full->balanced, balanced->minimal)
    const effectiveClarity = reflectionClarity + anticipation.clauseLimitBias * 0.12;
    if (effectiveClarity >= 0.75) {
      const parts: string[] = [`A ${toneAdj} ${archNoun} field`];
      if (temporalClause)    parts.push(temporalClause);
      if (directionalClause) parts.push(directionalClause);
      sentence = parts.join(', ');
    } else if (effectiveClarity >= 0.55) {
      sentence = directionalClause
        ? `A ${toneAdj} ${archNoun} field, ${directionalClause}`
        : `A ${toneAdj} ${archNoun} field`;
    } else {
      // Minimal: 'A calm field, settling.' -- first word of directional only
      const shortDir = directionalClause.split(' ')[0] ?? archNoun;
      sentence = `A ${toneAdj} field, ${shortDir}`;
    }

    if (!sentence.endsWith('.')) sentence += '.';
    if (sentence.length > 90) sentence = `A ${toneAdj} field, ${directionalClause || archNoun}.`;

    // Echo continuity: if new sentence differs markedly from last, soften the verb
    const priorEssence = echoEssenceRef.current;
    if (echoActive && priorEssence !== null) {
      // Detect direction reversal by checking if both sentences contain
      // opposite orientation vectors (opening vs settling, brightening vs cooling)
      const opposites: [string, string][] = [
        ['opening','settling'], ['brightening','cooling'],
        ['widening','returning'], ['turning','deepening'],
      ];
      const hasReversal = opposites.some(([a, b]) =>
        (priorEssence.includes(a) && sentence.includes(b)) ||
        (priorEssence.includes(b) && sentence.includes(a))
      );
      if (hasReversal) {
        // Replace directional verb with a continuity bridge
        sentence = sentence
          .replace('leaning opening',     'continuing to open')
          .replace('leaning settling',    'continuing to settle')
          .replace('leaning brightening', 'continuing to brighten')
          .replace('leaning cooling',     'continuing to cool')
          .replace('leaning widening',    'continuing to widen')
          .replace('leaning returning',   'continuing to return')
          .replace('leaning turning',     'continuing to turn')
          .replace('leaning deepening',   'continuing to deepen');
      }
    }

    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  })();

  // Arc 36: field invitation -- one quiet "next moment" line
  const invitationPhrase: string | null = (() => {
    const invitationActive =
      reweight.isMature &&
      foresight.isActive &&
      allMoments.length >= HISTORY_MIN &&
      harmony.isReadable &&
      harmony.agreement >= 0.6;
    if (!invitationActive) return null;

    // Foresight adjective (where the field is heading)
    const FORECAST_ADJ: Record<string, string> = {
      opening:    'opening',
      deepening:  'quiet',
      turning:    'turning',
      brightening:'bright',
      cooling:    'cooling',
    };

    // Reweight moment-type (what kind of experience the field wants)
    const SIGNAL_MOMENT: Record<string, string> = {
      alignment: 'corridor moment',
      presence:  'species pocket',
      initiative:'ridge moment',
      branch:    'different trail',
      soul:      'open ground moment',
      season:    'seasonal trail moment',
    };

    // History tone shades the adjective (override if recent pattern
    // contradicts foresight -- e.g. noisy history + deepening foresight
    // means the field is asking for quiet, not just deepening)
    const HISTORY_SHADE: Record<string, Partial<Record<string, string>>> = {
      noisy:  { deepening: 'quiet', cooling: 'still' },
      mixed:  { opening: 'easy',  brightening: 'gentle' },
      bright: { cooling: 'bright-to-quiet', deepening: 'still' },
      still:  { opening: 'gentle', brightening: 'easy' },
      calm:   {},  // calm history -- no override, trust foresight
    };

    // Recompute tone majority locally -- toneMajority is scoped to the
    // history IIFE and is not accessible here. Invitation is a pure
    // composition layer; it reads the ring directly rather than coupling
    // to the internal shape of the history block (Arc 26 purity rule).
    const invSlice = allMoments.slice(-HISTORY_WINDOW);
    const invN     = invSlice.length;
    const invTones: Record<string, number> = {};
    for (const m of invSlice) {
      if (m.corridorTone) invTones[m.corridorTone] = (invTones[m.corridorTone] ?? 0) + 1;
    }
    const invTopTone    = Object.entries(invTones).sort((a, b) => b[1] - a[1])[0];
    const invToneMajority = invTopTone && invTopTone[1] / invN >= 0.5
      ? invTopTone[0]
      : null;

    const adj     = HISTORY_SHADE[invToneMajority ?? '']?.[foresight.forecast]
                 ?? FORECAST_ADJ[foresight.forecast]
                 ?? 'quiet';
    const moment  = SIGNAL_MOMENT[reweight.dominant] ?? 'field moment';

    return `Next: a ${adj} ${moment}.`;
  })();

  // Arc 37: field structure -- chapter distribution over last 40 moments
  // Uses `season` as the structural backbone (4 values: spring/summer/fall/winter).
  // Entropy-based classification keeps Arc 26 purity: reads ring only.
  const STRUCTURE_WINDOW = 40;
  const structurePhrase: string | null = (() => {
    const structActive =
      identityReady &&            // identity threshold (>= 30 moments) already passed
      allMoments.length >= STRUCTURE_WINDOW &&
      harmony.isReadable &&
      harmony.agreement >= 0.6;
    if (!structActive) return null;

    const slice = allMoments.slice(-STRUCTURE_WINDOW);
    const n     = slice.length;  // always STRUCTURE_WINDOW when structActive

    // Chapter frequencies (season as structural backbone)
    const chCounts: Record<string, number> = {};
    for (const m of slice) {
      if (m.season) chCounts[m.season] = (chCounts[m.season] ?? 0) + 1;
    }
    const chapters = Object.entries(chCounts).sort((a, b) => b[1] - a[1]);
    const numChapters = chapters.length;

    // Shannon entropy (normalized to [0,1] over 4 possible chapters)
    const LOG4 = Math.log(4);
    let entropy = 0;
    for (const [, count] of chapters) {
      const p = count / n;
      if (p > 0) entropy -= p * Math.log(p);
    }
    const normEntropy = entropy / LOG4;  // 0 = one chapter dominates, 1 = fully fragmented

    // Recent chapter transition: did the dominant chapter change in the
    // last 10 moments vs the 10 before that?
    const recentSlice = slice.slice(-10);
    const olderSlice  = slice.slice(-20, -10);
    const recentDom   = mostCommonSeason(recentSlice);
    const olderDom    = mostCommonSeason(olderSlice);
    const shifting    = recentDom !== null && olderDom !== null && recentDom !== olderDom;

    // Classify structure
    let structure: 'stable' | 'mixed' | 'shifting' | 'fragmented';
    if (shifting) {
      structure = 'shifting';
    } else if (normEntropy < 0.25 && numChapters <= 2) {
      structure = 'stable';
    } else if (normEntropy < 0.55) {
      structure = 'mixed';
    } else {
      structure = 'fragmented';
    }

    // Top chapter label for phrase coloring
    const topChapter  = chapters[0]?.[0] ?? null;
    const topRatio    = chapters[0]?.[1] != null ? chapters[0][1] / n : 0;

    const STRUCT_PHRASE: Record<string, string> = {
      stable:     topChapter && topRatio >= 0.7
        ? `Structurally settled -- ${topChapter} pattern.`
        : 'Structurally settled.',
      mixed:      chapters.length >= 2
        ? `Mixed structure -- ${chapters[0][0]} and ${chapters[1][0]} in play.`
        : 'Mixed chapter structure.',
      shifting:   recentDom
        ? `Structure shifting toward ${recentDom}.`
        : 'Structure in transition.',
      fragmented: 'No clear structural pattern.',
    };

    return STRUCT_PHRASE[structure] ?? null;
  })();

  // Helper: most common season in a moment slice
  function mostCommonSeason(ms: typeof allMoments): string | null {
    const c: Record<string, number> = {};
    for (const m of ms) if (m.season) c[m.season] = (c[m.season] ?? 0) + 1;
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : null;
  }

  const windowColor = constellation.isFormed
    ? CONSTELLATION_TINT[constellation.archetype]
    : (QUALITY_ACCENT[fieldWindow.quality] ?? Accents.sage);

  const suggestionColor = reweight.isMature
    ? REWEIGHT_TINT[reweight.dominant]
    : 'rgba(255,255,255,0.72)';

  const chapterColor = drift.isMeasurable
    ? DRIFT_TINT[drift.direction]
    : 'rgba(255,255,255,0.30)';

  const alignColor    = ALIGNMENT_COLOR[alignment.state];
  const presenceColor = PRESENCE_COLOR[presence.state];
  const initColor     = INITIATIVE_COLOR[initiative.action];
  const branchColor   = BRANCH_COLOR[branch.path];

  const showBranch        = branch.isSurfaced;
  const showInitiative    = initiative.isSurfaced;
  const showAlignment     = alignment.isCalibrated;
  const showPresence      = presence.isCalibrated && presence.state !== 'absent';
  const showReweightShift = reweight.isMature;

  // Arc 50: commit echo state after all phrases are computed
  // (refs update silently -- no re-render triggered)
  echoEssenceRef.current    = essencePhrase;
  echoOriVecRef.current     = (() => {
    if (!orientationPhrase) return echoOriVecRef.current;
    const m = orientationPhrase.match(/leaning ([a-z]+)\./);
    return m ? m[1] : echoOriVecRef.current;
  })();
  echoToneRef.current       = (() => {
    const c: Record<string,number> = {};
    for (const m of allMoments) if (m.corridorTone) c[m.corridorTone]=(c[m.corridorTone]??0)+1;
    return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? echoToneRef.current;
  })();
  echoClarityRef.current    = reflectionClarity;
  echoThresholdRef.current  = COMPRESS_THRESHOLD;
  echoVisibleSetRef.current = Object.entries(compressed)
    .filter(([,v]) => v).map(([k]) => k).sort().join(',');
  prevArchetypeRef.current  = constellation.archetype;
  prevDriftRef.current      = drift.direction;
  prevForecastRef.current   = foresight.forecast;

  return (
    <View style={s.card}>
      {/* Arc 34: Field Identity -- stable earned name */}
      {fieldIdentity !== null && (
        <>
          <ThemedText style={s.identityName}>{fieldIdentity}</ThemedText>
          <View style={s.identitySep} />
          {/* Arc 38-46: top-stack phrases, filtered by Arc 47 compression */}
          {compressed.signature   && <ThemedText style={s.signatureText}>{signaturePhrase}</ThemedText>}
          {compressed.resilience  && <ThemedText style={s.resilienceText}>{resiliencePhrase}</ThemedText>}
          {compressed.lineage     && <ThemedText style={s.lineageText}>{lineagePhrase}</ThemedText>}
          {compressed.rhythm      && <ThemedText style={s.rhythmText}>{rhythmPhrase}</ThemedText>}
          {compressed.orientation && <ThemedText style={s.orientationText}>{orientationPhrase}</ThemedText>}
          {compressed.coherence   && <ThemedText style={s.coherenceText}>{coherencePhrase}</ThemedText>}
          {compressed.alignment   && <ThemedText style={s.alignmentText}>{alignmentPhrase}</ThemedText>}
          {compressed.continuity  && <ThemedText style={s.continuityText}>{continuityPhrase}</ThemedText>}
          {compressed.integrity   && <ThemedText style={s.integrityText}>{integrityPhrase}</ThemedText>}
        </>
      )}

      {/* Arc 48: essence -- distilled one-sentence summary above strip */}
      {essencePhrase !== null && (
        <ThemedText style={s.essenceText}>{essencePhrase}</ThemedText>
      )}

      <FieldSummaryStrip />

      {/* Arc 36: Field Invitation -- next moment line */}
      {invitationPhrase !== null && (
        <ThemedText style={s.invitationText}>{invitationPhrase}</ThemedText>
      )}

      <ThemedText style={s.whisper}>Field Window</ThemedText>

      <ThemedText style={[s.windowLabel, { color: windowColor }]}>
        {fieldWindow.label}
      </ThemedText>

      <ThemedText style={[s.suggestion, { color: suggestionColor }]}>
        {fieldWindow.suggestion}
      </ThemedText>

      {showReweightShift && (
        <ThemedText style={[s.toneShift, { color: suggestionColor }]}>
          {reweight.toneShift}
        </ThemedText>
      )}

      {showBranch && (
        <View style={[s.signalRow, s.branchRow]}>
          <View style={[s.dot, { backgroundColor: branchColor }]} />
          <ThemedText style={[s.signalLabel, { color: branchColor }]}>
            {branch.path.toUpperCase()}
            {branch.variant ? '  ' + branch.variant : ''}
          </ThemedText>
          <ThemedText style={s.signalDirective}>
            {branch.overlay}
          </ThemedText>
        </View>
      )}

      {showInitiative && (
        <View style={s.signalRow}>
          <View style={[s.dot, { backgroundColor: initColor }]} />
          <ThemedText style={[s.signalLabel, { color: initColor }]}>
            {initiative.action.toUpperCase()}
          </ThemedText>
          <ThemedText style={s.signalDirective}>
            {initiative.directive}
          </ThemedText>
        </View>
      )}

      {showAlignment && (
        <View style={s.signalRow}>
          <View style={[s.dot, { backgroundColor: alignColor }]} />
          <ThemedText style={[s.signalLabel, { color: alignColor }]}>
            {alignment.label}
          </ThemedText>
          <ThemedText style={s.signalDirective}>
            {alignment.directive}
          </ThemedText>
        </View>
      )}

      {showPresence && (
        <View style={s.signalRow}>
          <View style={[s.dot, { backgroundColor: presenceColor }]} />
          <ThemedText style={[s.signalLabel, { color: presenceColor }]}>
            {presence.label}
          </ThemedText>
          <ThemedText style={s.signalDirective}>
            {presence.line}
          </ThemedText>
        </View>
      )}

      {/* Chapter footer: drift note + harmony mood */}
      <View style={s.chapterFooter}>
        <ThemedText style={[s.seasonLabel, { color: chapterColor }]}>
          {label}
        </ThemedText>
        {drift.isMeasurable && (
          <ThemedText style={[s.chapterNote, { color: chapterColor }]}>
            {drift.chapterNote}
          </ThemedText>
        )}
        {harmony.isReadable && (
          <ThemedText style={s.harmonyMood}>
            {harmony.moodLabel}
          </ThemedText>
        )}
        {foresight.isActive && (
          <ThemedText style={s.foresightLabel}>
            {foresight.label}
          </ThemedText>
        )}
      </View>

      {/* Arc 32: delta -- one-line shift summary above the note */}
      {deltaPhrase !== null && (
        <ThemedText style={s.deltaText}>{deltaPhrase}</ThemedText>
      )}

      {/* Arc 37: Field Structure -- chapter distribution */}
      {structurePhrase !== null && (
        <ThemedText style={s.structureText}>{structurePhrase}</ThemedText>
      )}

      {/* Arc 35: Field History -- recent pattern above the note */}
      {historyPhrase !== null && (
        <ThemedText style={s.historyText}>{historyPhrase}</ThemedText>
      )}

      {/* Arc 31: Field Note -- naturalist sentence below the footer */}
      <FieldNote
        constellation={constellation}
        drift={drift}
        harmony={harmony}
        foresight={foresight}
      />

      {/* Arc 33: Locality -- where this moment occurred in field geography */}
      <FieldLocality
        noteActive={
          constellation.isFormed && drift.isMeasurable &&
          harmony.isReadable && foresight.isActive
        }
        latest={latestMoment}
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A17',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    gap: 6,
    marginBottom: Spacing.three,
    width: '100%',
  },
  identityName: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: 0.15,
    marginBottom: 4,
  },
  identitySep: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 6,
  },
  essenceText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.52)',
    letterSpacing: 0.10,
    marginBottom: 12,
    lineHeight: 20,
  },
  signatureText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.50)',
    letterSpacing: 0.12,
    marginBottom: 4,
  },
  resilienceText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.48)',
    letterSpacing: 0.12,
    marginBottom: 4,
  },
  lineageText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.46)',
    letterSpacing: 0.12,
    marginBottom: 4,
  },
  rhythmText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.44)',
    letterSpacing: 0.12,
    marginBottom: 4,
  },
  orientationText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.42)',
    letterSpacing: 0.12,
    marginBottom: 4,
  },
  coherenceText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.40)',
    letterSpacing: 0.12,
    marginBottom: 4,
  },
  alignmentText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.12,
    marginBottom: 4,
  },
  continuityText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.36)',
    letterSpacing: 0.12,
    marginBottom: 4,
  },
  integrityText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.34)',
    letterSpacing: 0.12,
    marginBottom: 10,
  },
  invitationText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.32)',
    letterSpacing: 0.12,
    marginTop: 6,
    marginBottom: 2,
  },
  whisper: {
    fontSize: 9, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1.1, color: 'rgba(255,255,255,0.35)', marginBottom: 2,
  },
  windowLabel: {
    fontSize: 14, fontWeight: '600', letterSpacing: 0.2,
  },
  suggestion: {
    fontSize: 14, fontFamily: 'Georgia', fontStyle: 'italic',
    lineHeight: 22,
  },
  toneShift: {
    fontSize: 11, fontFamily: 'Georgia', fontStyle: 'italic',
    lineHeight: 18, opacity: 0.6, marginTop: -2,
  },
  branchRow: {
    marginTop: 6,
    marginBottom: 2,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    flexShrink: 0,
  },
  signalLabel: {
    fontSize: 9, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1.1, marginTop: 2, flexShrink: 0,
  },
  signalDirective: {
    fontSize: 12, fontFamily: 'Georgia', fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)', lineHeight: 18, flex: 1,
  },
  chapterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  seasonLabel: {
    fontSize: 11, letterSpacing: 0.3,
  },
  chapterNote: {
    fontSize: 10, fontFamily: 'Georgia', fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  harmonyMood: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.22)',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  foresightLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.18)',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    letterSpacing: 0.25,
  },
  deltaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.22)',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    letterSpacing: 0.15,
    marginTop: 6,
    marginBottom: 2,
  },
  structureText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.27)',
    letterSpacing: 0.12,
    marginTop: 4,
    marginBottom: 2,
  },
  historyText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.26)',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    letterSpacing: 0.12,
    marginTop: 4,
    marginBottom: 4,
  },
  noteRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  noteText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.28)',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  localityRow: {
    marginTop: 6,
  },
  localityText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.24)',
    lineHeight: 17,
    letterSpacing: 0.1,
  },
});

// ---- FieldNote (Arc 31) -- naturalist sentence below footer ---------
// Pure composition: reads no ring, calls no evaluator.
// Strips terminal periods from behavior phrases before mid-clause use.

import type { FieldConstellation } from '@/atlas/fieldConstellation';
import type { FieldDrift } from '@/atlas/fieldDrift';
import type { FieldHarmony } from '@/atlas/fieldHarmony';
import type { FieldForesight } from '@/atlas/fieldForesight';

// Re-use the phrase tables from FieldSummaryStrip by duplicating the
// key lookups here (avoids cross-file export of private tables).
// These are small and stable -- they won't drift independently.
const _CHAR_NOTE: Record<string, Record<string, string>> = {
  wanderer: { settled:'Steady wanderer', restless:'Restless wanderer', turning:'Shifting wanderer', brightening:'Bright wanderer', cooling:'Quiet wanderer' },
  observer: { settled:'Quiet observer',  restless:'Restless observer',  turning:'Turning observer',  brightening:'Open observer',  cooling:'Still observer' },
  steady:   { settled:'Steady field',    restless:'Unsettled field',    turning:'Field in motion',   brightening:'Brightening field', cooling:'Cooling field' },
  returner: { settled:'Quiet returner',  restless:'Restless returner',  turning:'Returner shifting', brightening:'Returner opening', cooling:'Deep returner' },
  seeker:   { settled:'Calm seeker',     restless:'Restless seeker',    turning:'Turning seeker',    brightening:'Bright seeker',  cooling:'Cooling seeker' },
};
const _BEH_NOTE: Record<string, string> = {
  settling:'pattern settling', brightening:'energy rising',
  wandering:'range widening',  returning:'familiar ground returning',
  seeking:'territory expanding',
};
const _TRAJ_NOTE: Record<string, string> = {
  opening:'likely opening', deepening:'likely deepening',
  turning:'likely turning', brightening:'likely brightening',
  cooling:'likely cooling',
};

interface FieldNoteProps {
  constellation: FieldConstellation;
  drift:         FieldDrift;
  harmony:       FieldHarmony;
  foresight:     FieldForesight;
}

function FieldNote({ constellation, drift, harmony, foresight }: FieldNoteProps) {
  const ready =
    constellation.isFormed &&
    drift.isMeasurable &&
    harmony.isReadable &&
    foresight.isActive;

  if (!ready) return null;

  const character  = _CHAR_NOTE[constellation.archetype]?.[harmony.mood] ?? '';
  const behavior   = _BEH_NOTE[drift.direction] ?? '';
  const trajectory = _TRAJ_NOTE[foresight.forecast] ?? '';

  if (!character || !behavior || !trajectory) return null;

  // "Bright wanderer. Range widening, and the field is likely opening."
  const sentence = `${character}. ${capitalizeFirst(behavior)}, and the field is ${trajectory}.`;

  return (
    <View style={s.noteRow}>
      <ThemedText style={s.noteText}>{sentence}</ThemedText>
    </View>
  );
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// ---- FieldLocality (Arc 33) -- where this moment occurred ----------
// Pure composition: reads atlas.latest, maps raw moment fields to
// naturalist-style place phrases. No new evaluator, no new hook.
//
// Priority order (pick strongest single signal):
//   1. nearestTrail + corridorTone  -> trail-anchored phrase
//   2. corridorTone                 -> corridor tone phrase
//   3. invitedSpecies               -> species pocket phrase
//   4. symbolic                     -> mode-flavored phrase
//   5. conditionsScore              -> conditions phrase (fallback)
//
// Activation: noteActive AND at least one moment field is non-null/non-empty

import type { CorridorTone } from '@/corridor/corridor-engine';

const TONE_PHRASE: Record<CorridorTone, string> = {
  calm:   'Along a calm corridor.',
  noisy:  'Near a busy edge.',
  bright: 'On a bright stretch.',
  still:  'In a still pocket.',
  mixed:  'At a shifting margin.',
};

const TONE_TRAIL_PHRASE: Record<CorridorTone, string> = {
  calm:   'Along a calm section of the trail.',
  noisy:  'Near the busier edge of the trail.',
  bright: 'On a bright reach of trail.',
  still:  'In a quiet bend of the trail.',
  mixed:  'At a turning point in the corridor.',
};

const SPECIES_PHRASE = (count: number, first: string): string => {
  if (count === 1) return `In a ${first} pocket.`;
  if (count === 2) return `In a shared pocket.`;
  return `In a species cluster.`;
};

const SYMBOLIC_PHRASE: Record<string, string> = {
  plur: 'On open ground.',
  love: 'In a quiet interior.',
};

interface FieldLocalityProps {
  noteActive: boolean;
  latest: ReturnType<typeof useAtlas>['latest'];
}

function FieldLocality({ noteActive, latest }: FieldLocalityProps) {

  if (!noteActive || !latest) return null;

  const { corridorTone, nearestTrail, invitedSpecies, symbolic, conditionsScore } = latest;

  // Pick strongest signal
  let phrase: string | null = null;

  if (nearestTrail && corridorTone) {
    phrase = TONE_TRAIL_PHRASE[corridorTone] ?? null;
  } else if (corridorTone) {
    phrase = TONE_PHRASE[corridorTone] ?? null;
  } else if (invitedSpecies && invitedSpecies.length > 0) {
    const first = invitedSpecies[0];
    const shortName = first.split(' ').slice(-1)[0]; // last word of species name
    phrase = SPECIES_PHRASE(invitedSpecies.length, shortName);
  } else if (symbolic) {
    phrase = SYMBOLIC_PHRASE[symbolic] ?? null;
  } else if (conditionsScore !== undefined && conditionsScore !== null) {
    phrase = conditionsScore >= 0.7 ? 'In good conditions.' : 'Under mixed conditions.';
  }

  if (!phrase) return null;

  return (
    <View style={s.localityRow}>
      <ThemedText style={s.localityText}>{phrase}</ThemedText>
    </View>
  );
}
