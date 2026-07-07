/**
 * atlas/fieldMemory.ts
 *
 * Field Memory Deepening — EarthEye stops being a recent memory
 * and becomes a long memory. The system forms seasonal chapters
 * from accumulated Field Moments, tracks corridor patterns across
 * weeks, and remembers species arrival frequency.
 *
 * Pure logic — no React, no hooks.
 */

import type { FieldMoment } from '@/atlas/fieldMoment';
import { getSeasonalPhase, type SeasonalPhase } from '@/atlas/seasonalProfile';

// ─── Types ────────────────────────────────────────────────

export interface SeasonalChapter {
  phase: SeasonalPhase;
  label: string;
  momentCount: number;
  dominantTone: string;
  dominantToneLabel: string;
  speciesSeen: string[];
  habitatNotes: string[];
  driftPattern: string;
  resilienceEvents: number;
  /** Whether this chapter has enough data to be meaningful */
  isFormed: boolean;
  /** Short poetic summary */
  summary: string;
}

export interface SpeciesFrequency {
  name: string;
  count: number;
  frequency: 'frequent' | 'occasional' | 'rare' | 'absent';
  frequencyLabel: string;
  lastSeenTimestamp: number | null;
}

export interface FieldMemory {
  /** Seasonal chapters derived from accumulated moments */
  chapters: SeasonalChapter[];
  /** The current active chapter */
  currentChapter: SeasonalChapter | null;
  /** Species frequency across all moments */
  speciesHistory: SpeciesFrequency[];
  /** Corridor tone history — dominant tones per chapter */
  corridorHistory: { phase: SeasonalPhase; dominantTone: string }[];
  /** Total moments in memory */
  totalMoments: number;
  /** Whether long memory is established (enough data) */
  isEstablished: boolean;
  /** Poetic line for the Atlas panel */
  memoryLine: string;
}

// ─── Helpers ──────────────────────────────────────────────

// Mission 6 (July 7 2026): this used to be a second, independent copy
// of the exact date-range logic in seasonalProfile.ts::getSeasonalPhase
// -- same literals, drifting in silent lockstep with zero shared name.
// Mission 5 already fixed a real year-wraparound bug in that function;
// this file would have kept the bug at least in some forms even after
// that fix, since it never imported the corrected version. Now it does.
function getPhaseFromDate(timestamp: number): SeasonalPhase {
  return getSeasonalPhase(new Date(timestamp));
}

const PHASE_LABELS: Record<SeasonalPhase, string> = {
  'early-spring': 'Early Spring',
  'high-summer': 'High Summer',
  'late-autumn': 'Late Autumn',
  'winter-night': 'Winter Night',
  'transitional': 'Transitional',
};

const PHASE_ORDER: SeasonalPhase[] = [
  'early-spring', 'transitional', 'high-summer', 'late-autumn', 'winter-night',
];

function dominantTone(moments: FieldMoment[]): { tone: string; label: string } {
  if (moments.length === 0) return { tone: 'unknown', label: 'unknown' };
  const counts: Record<string, number> = {};
  for (const m of moments) {
    counts[m.corridorTone] = (counts[m.corridorTone] ?? 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return { tone: sorted[0][0], label: sorted[0][0] };
}

function driftPatternForMoments(moments: FieldMoment[]): string {
  if (moments.length < 3) return 'insufficient data';
  const tones = moments.map((m) => m.corridorTone);
  const unique = new Set(tones);
  if (unique.size <= 2) return 'stable';
  if (unique.size >= 4) return 'variable';
  return 'shifting';
}

// ─── Evaluator ────────────────────────────────────────────

export function evaluateFieldMemory(
  moments: FieldMoment[],
  currentPhase: SeasonalPhase
): FieldMemory {
  if (moments.length < 5) {
    return {
      chapters: [],
      currentChapter: null,
      speciesHistory: [],
      corridorHistory: [],
      totalMoments: moments.length,
      isEstablished: false,
      memoryLine: 'The field is still gathering its first memories.',
    };
  }

  // ─── Group moments into seasonal chapters ───────────────

  const phaseGroups: Record<string, FieldMoment[]> = {};
  for (const m of moments) {
    const phase = getPhaseFromDate(m.timestamp);
    if (!phaseGroups[phase]) phaseGroups[phase] = [];
    phaseGroups[phase].push(m);
  }

  const chapters: SeasonalChapter[] = PHASE_ORDER
    .filter((phase) => phaseGroups[phase] && phaseGroups[phase].length >= 3)
    .map((phase) => {
      const phaseMoments = phaseGroups[phase];
      const tone = dominantTone(phaseMoments);
      const species = new Set<string>();
      const habitats = new Set<string>();
      let fallbackCount = 0;

      for (const m of phaseMoments) {
        m.invitedSpecies.forEach((s) => species.add(s));
        if (m.cardType === 'yard') habitats.add('yard anchor');
        if (m.cardType === 'trail') habitats.add('trail corridor');
        if (m.cardType === 'coastal') habitats.add('coastal edge');
        if (m.cardType === 'night') habitats.add('stillness lane');
        if (m.inFallback) fallbackCount++;
      }

      const drift = driftPatternForMoments(phaseMoments);
      const isFormed = phaseMoments.length >= 5;

      // Build summary
      const speciesList = Array.from(species).slice(0, 3);
      let summary = `${PHASE_LABELS[phase]} chapter — ${tone.label} dominant`;
      if (speciesList.length > 0) {
        summary += `, ${speciesList.join(', ')}`;
      }
      if (drift !== 'insufficient data') {
        summary += `, drift ${drift}`;
      }
      if (fallbackCount > 0) {
        summary += `, ${fallbackCount} stress event${fallbackCount > 1 ? 's' : ''}`;
      }
      summary += '.';

      return {
        phase,
        label: PHASE_LABELS[phase],
        momentCount: phaseMoments.length,
        dominantTone: tone.tone,
        dominantToneLabel: tone.label,
        speciesSeen: Array.from(species),
        habitatNotes: Array.from(habitats),
        driftPattern: drift,
        resilienceEvents: fallbackCount,
        isFormed,
        summary,
      };
    });

  // ─── Current chapter ────────────────────────────────────

  const currentChapter = chapters.find((c) => c.phase === currentPhase) ?? null;

  // ─── Species frequency history ──────────────────────────

  const speciesCounts: Record<string, { count: number; lastSeen: number }> = {};
  for (const m of moments) {
    for (const s of m.invitedSpecies) {
      if (!speciesCounts[s]) speciesCounts[s] = { count: 0, lastSeen: 0 };
      speciesCounts[s].count++;
      if (m.timestamp > speciesCounts[s].lastSeen) {
        speciesCounts[s].lastSeen = m.timestamp;
      }
    }
  }

  const totalMoments = moments.length;
  const speciesHistory: SpeciesFrequency[] = Object.entries(speciesCounts)
    .map(([name, data]) => {
      const ratio = data.count / totalMoments;
      let frequency: 'frequent' | 'occasional' | 'rare' | 'absent';
      let frequencyLabel: string;
      if (ratio >= 0.25) { frequency = 'frequent'; frequencyLabel = 'frequent this season'; }
      else if (ratio >= 0.10) { frequency = 'occasional'; frequencyLabel = 'occasional this season'; }
      else if (ratio >= 0.03) { frequency = 'rare'; frequencyLabel = 'rare this season'; }
      else { frequency = 'rare'; frequencyLabel = 'seen once'; }
      return {
        name,
        count: data.count,
        frequency,
        frequencyLabel,
        lastSeenTimestamp: data.lastSeen || null,
      };
    })
    .sort((a, b) => b.count - a.count);

  // ─── Corridor history ───────────────────────────────────

  const corridorHistory = chapters.map((c) => ({
    phase: c.phase,
    dominantTone: c.dominantTone,
  }));

  // ─── Memory line for Atlas ──────────────────────────────

  let memoryLine = '';
  if (currentChapter && currentChapter.isFormed) {
    const parts: string[] = [];
    parts.push(`${currentChapter.label} chapter forming`);

    // Add dominant pattern
    if (currentChapter.dominantTone === 'bright') {
      const hasLizard = currentChapter.speciesSeen.some(s => s.toLowerCase().includes('lizard'));
      parts.push(hasLizard ? 'bright ridge strengthening, lizard afternoons frequent' : 'bright afternoons dominant');
    } else if (currentChapter.dominantTone === 'calm' || currentChapter.dominantTone === 'still') {
      const hasBat = currentChapter.speciesSeen.some(s => s.toLowerCase().includes('bat'));
      parts.push(hasBat ? 'stillness stable, bat nights frequent' : 'calm corridors stable');
    } else if (currentChapter.dominantTone === 'noisy') {
      parts.push('noisy edges active');
    } else {
      parts.push(`${currentChapter.dominantToneLabel} corridors`);
    }

    // Add resilience note if relevant
    if (currentChapter.resilienceEvents > 0) {
      parts.push(`${currentChapter.resilienceEvents} stress event${currentChapter.resilienceEvents > 1 ? 's' : ''} recorded`);
    }

    memoryLine = parts.join(' — ') + '.';
  } else if (chapters.length > 0) {
    // No current chapter but other chapters exist
    memoryLine = `${chapters.length} chapter${chapters.length > 1 ? 's' : ''} in memory; current season still gathering.`;
  } else {
    memoryLine = 'The field is still gathering its first memories.';
  }

  // ─── Is established ─────────────────────────────────────

  const isEstablished = chapters.length >= 1 && moments.length >= 10;

  return {
    chapters,
    currentChapter,
    speciesHistory,
    corridorHistory,
    totalMoments: moments.length,
    isEstablished,
    memoryLine,
  };
}
