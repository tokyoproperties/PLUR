/**
 * useYardStrip.ts
 * The home yard — Bakersfield, 9x20ft east-facing strip + patio +
 * rear perimeter (the syntropic garden Stryder has been building).
 *
 * REAL COORDINATES — captured from device GPS standing in the yard,
 * 2026-07-02: 35°23'32.1"N 119°05'58.7"W (35.392238, -119.099642).
 *
 * NOTE: still a single point, not a surveyed polygon. A 9x20ft plot
 * is below normal map-visible scale anyway — it renders as a marker,
 * never a meaningful polygon, unless viewed at building-level zoom.
 */

export interface YardStripPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isPlaceholder: boolean;
}

const HOME_YARD: YardStripPoint = {
  id: 'home-yard-strip',
  name: 'Home Yard — East Strip + Patio + Rear Perimeter',
  lat: 35.392238,
  lng: -119.099642,
  isPlaceholder: false,
};

export function useYardStrip(): YardStripPoint {
  return HOME_YARD;
}
