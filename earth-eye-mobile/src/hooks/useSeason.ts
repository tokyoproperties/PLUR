/**
 * useSeason.ts — Mission 17
 *
 * Single canonical source of seasonal truth for all atlas consumers.
 * Replaces the 3+ independent getCurrentSeason() copies scattered
 * across useTrailList, useSpeciesHotspots, etc.
 *
 * Returns the current calendar season, solar window (golden hour),
 * and a temperature band inferred from season + time of day.
 * No weather API — this is purely clock-derived field intelligence.
 */
import { useMemo } from 'react';

export type CalendarSeason = 'spring' | 'summer' | 'fall' | 'winter';
export type SolarWindow     = 'golden-dawn' | 'morning' | 'midday' | 'afternoon' | 'golden-dusk' | 'night';
export type TempBand        = 'cold' | 'cool' | 'warm' | 'hot';

export type SeasonIntel = {
  season:       CalendarSeason;
  solarWindow:  SolarWindow;
  tempBand:     TempBand;
  /** Short field-guide label e.g. "Summer · Golden Dusk" */
  label:        string;
  /** Which season abbreviations are active: SPR SUM FAL WIN */
  activeKeys:   string[];
};

export function getCalendarSeason(month?: number): CalendarSeason {
  const m = month ?? new Date().getMonth(); // 0-indexed
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

function getSolarWindow(hour?: number): SolarWindow {
  const h = hour ?? new Date().getHours();
  if (h >= 5  && h < 7)  return 'golden-dawn';
  if (h >= 7  && h < 11) return 'morning';
  if (h >= 11 && h < 14) return 'midday';
  if (h >= 14 && h < 17) return 'afternoon';
  if (h >= 17 && h < 20) return 'golden-dusk';
  return 'night';
}

function getTempBand(season: CalendarSeason, solar: SolarWindow): TempBand {
  if (season === 'winter') return solar === 'midday' ? 'cool' : 'cold';
  if (season === 'spring') return solar === 'midday' ? 'warm' : 'cool';
  if (season === 'fall')   return solar === 'midday' ? 'warm' : 'cool';
  // summer
  if (solar === 'golden-dawn' || solar === 'night') return 'warm';
  return 'hot';
}

const SEASON_KEYS: Record<CalendarSeason, string> = {
  spring: 'SPR', summer: 'SUM', fall: 'FAL', winter: 'WIN',
};

const SOLAR_LABELS: Record<SolarWindow, string> = {
  'golden-dawn': 'Golden Dawn', morning: 'Morning', midday: 'Midday',
  afternoon: 'Afternoon', 'golden-dusk': 'Golden Dusk', night: 'Night',
};

export function computeSeasonIntel(now?: Date): SeasonIntel {
  const d      = now ?? new Date();
  const season = getCalendarSeason(d.getMonth());
  const solar  = getSolarWindow(d.getHours());
  const temp   = getTempBand(season, solar);
  const cap    = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return {
    season,
    solarWindow:  solar,
    tempBand:     temp,
    label:        `${cap(season)} · ${SOLAR_LABELS[solar]}`,
    activeKeys:   [SEASON_KEYS[season]],
  };
}

/** React hook — re-evaluates once on mount (season doesn't change mid-session). */
export function useSeason(): SeasonIntel {
  return useMemo(() => computeSeasonIntel(), []);
}
