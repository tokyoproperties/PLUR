/**
 * useSeasonalFieldWindow.ts — Arc 18-B
 *
 * Field Window now reads from Field Memory + Field Soul in addition
 * to clock + season. The more moments the field accumulates, the
 * richer and more specific the guidance becomes.
 *
 * Three tiers of intelligence:
 *   forming  — <5 moments, pure clock/season guidance
 *   aware    — 5-19 moments, memory-colored guidance
 *   deep     — 20+ moments, fully personalized field voice
 */
import { useMemo } from 'react';
import { useSeason, type SolarWindow } from '@/hooks/useSeason';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { useSymbolicMode } from '@/contexts/mode-context';

export type FieldWindowQuality = 'prime' | 'good' | 'marginal' | 'avoid';

export type FieldWindow = {
  quality:      FieldWindowQuality;
  label:        string;
  suggestion:   string;
  nextBest:     string;
  memoryDepth:  'forming' | 'aware' | 'deep';
};

const SOLAR_QUALITY: Record<SolarWindow, (season: string) => FieldWindowQuality> = {
  'golden-dawn': () => 'prime',
  morning:       (s) => s === 'winter' ? 'good' : 'prime',
  midday:        (s) => s === 'summer' ? 'avoid' : 'good',
  afternoon:     (s) => s === 'summer' ? 'marginal' : 'good',
  'golden-dusk': () => 'prime',
  night:         () => 'marginal',
};

// Base suggestions — clock + season only (forming tier)
const BASE_SUGGESTIONS: Record<FieldWindowQuality, Record<string, string>> = {
  prime: {
    spring:  'Peak dawn chorus. Shorebirds active along coastal edges.',
    summer:  'Best hours before heat builds. Coastal fog still present.',
    fall:    'Raptor migration active. Long-distance visibility.',
    winter:  'Waterfowl most active. Calm light on open water.',
  },
  good: {
    spring:  'Wildflowers opening. Riparian corridors productive.',
    summer:  'Manageable temperatures with shade access.',
    fall:    'Oak woodland at peak. Foliage color building.',
    winter:  'Clear air, low sun angle. Good for coastal surveys.',
  },
  marginal: {
    spring:  'Midday lull. Most birds quieter.',
    summer:  'Heat building. Shade corridors only.',
    fall:    'Quiet midday. Evening activity picks up.',
    winter:  'Night temperatures low. Dress for cold.',
  },
  avoid: {
    spring:  'Full midday. Slower wildlife activity.',
    summer:  'Peak heat. Exposed trails dangerous. Wait for evening.',
    fall:    'Quiet period. Return at golden dusk.',
    winter:  'Cold peak. Best to wait for morning sun.',
  },
};

const NEXT_BEST: Record<SolarWindow, string> = {
  'golden-dawn': 'Now is prime — you are in it.',
  morning:       'Now is prime — you are in it.',
  midday:        'Next prime window: golden dusk (~5:30–7:30 PM)',
  afternoon:     'Next prime window: golden dusk (~5:30–7:30 PM)',
  'golden-dusk': 'Now is prime — you are in it.',
  night:         'Next prime window: golden dawn (~5:30–7:00 AM)',
};

export function useSeasonalFieldWindow(): FieldWindow {
  const { season, solarWindow } = useSeason();
  const memory = useFieldMemory();
  const soul   = useFieldSoul();
  const { mode } = useSymbolicMode();

  return useMemo(() => {
    const quality = SOLAR_QUALITY[solarWindow](season);
    const base    = BASE_SUGGESTIONS[quality][season];

    // Memory depth tier
    const memoryDepth: FieldWindow['memoryDepth'] =
      memory.totalMoments >= 20 ? 'deep'
      : memory.totalMoments >= 5 ? 'aware'
      : 'forming';

    // Build suggestion — enriched by memory depth + mode
    let suggestion = base;

    if (memoryDepth === 'aware' && memory.currentChapter) {
      const ch = memory.currentChapter;
      if (ch.speciesSeen.length > 0) {
        suggestion = `${base} ${ch.speciesSeen[0]} active in this season.`;
      }
    }

    if (memoryDepth === 'deep' && soul.isEstablished) {
      // Use soul line as the field's own voice
      suggestion = soul.soulLine
        ? `${soul.soulLine.charAt(0).toUpperCase()}${soul.soulLine.slice(1)}. ${base}`
        : base;
    }

    // Mode overlay
    if (mode === 'love' && quality === 'avoid') {
      suggestion = 'Rest period. The field is resting too — good time to reflect on what you've seen.';
    }
    if (mode === 'love' && quality === 'prime') {
      suggestion = 'Quiet attention now. Even prime windows are for stillness in LOVE mode.';
    }

    const qualLabel =
      quality === 'prime'    ? 'Prime field window'
      : quality === 'good'   ? 'Good field conditions'
      : quality === 'marginal' ? 'Marginal conditions'
      : 'Avoid exposed areas';

    const solarLabel = solarWindow
      .replace('-', ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      quality,
      label:       `${solarLabel} — ${qualLabel}`,
      suggestion,
      nextBest:    NEXT_BEST[solarWindow],
      memoryDepth,
    };
  }, [season, solarWindow, memory, soul, mode]);
}
