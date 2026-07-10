/**
 * useSeasonalFieldWindow.ts — Mission 17
 *
 * Produces the "best time to be outside today" intelligence.
 * Purely clock + season derived — no weather API, no GPS required.
 * Used by Home season card and Field module.
 */
import { useMemo } from 'react';
import { useSeason, type SolarWindow } from '@/hooks/useSeason';

export type FieldWindowQuality = 'prime' | 'good' | 'marginal' | 'avoid';

export type FieldWindow = {
  quality:     FieldWindowQuality;
  label:       string;    // "Golden dawn — prime field window"
  suggestion:  string;    // Short field-guide prose
  nextBest:    string;    // "Next good window: 5:30–7:00 AM"
};

const SOLAR_QUALITY: Record<SolarWindow, (season: string) => FieldWindowQuality> = {
  'golden-dawn': () => 'prime',
  morning:       (s) => s === 'winter' ? 'good' : 'prime',
  midday:        (s) => s === 'summer' ? 'avoid' : 'good',
  afternoon:     (s) => s === 'summer' ? 'marginal' : 'good',
  'golden-dusk': () => 'prime',
  night:         () => 'marginal',
};

const SUGGESTIONS: Record<FieldWindowQuality, Record<string, string>> = {
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
  return useMemo(() => {
    const quality    = SOLAR_QUALITY[solarWindow](season);
    const suggestion = SUGGESTIONS[quality][season];
    const qualLabel  = quality === 'prime' ? 'Prime field window'
      : quality === 'good'     ? 'Good field conditions'
      : quality === 'marginal' ? 'Marginal conditions'
      : 'Avoid exposed areas';
    const solarLabel = solarWindow.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      quality,
      label:      `${solarLabel} — ${qualLabel}`,
      suggestion,
      nextBest:   NEXT_BEST[solarWindow],
    };
  }, [season, solarWindow]);
}
