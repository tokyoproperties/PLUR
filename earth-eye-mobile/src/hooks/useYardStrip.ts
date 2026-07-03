/**
 * useYardStrip.ts
 * The home yard — Bakersfield, 9x20ft east-facing strip + patio +
 * rear perimeter (the syntropic garden Stryder has been building).
 *
 * HONEST LIMITATION: no real surveyed GPS point exists for this yard
 * yet. The coordinates below are a rough Bakersfield city-center
 * placeholder, not the actual property. A 9x20ft plot is also below
 * normal map-visible scale — it renders as a point/marker, never a
 * meaningful polygon, unless viewed at building-level zoom.
 *
 * TODO(Stryder): drop a pin at the real yard location (phone GPS
 * standing in the yard) and swap these two numbers. Everything else
 * downstream (marker, firework overlay) will just work once this is
 * real.
 */

export interface YardStripPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isPlaceholder: boolean;
}

const PLACEHOLDER_YARD: YardStripPoint = {
  id: 'home-yard-strip',
  name: 'Home Yard — East Strip + Patio + Rear Perimeter',
  lat: 35.3733,
  lng: -119.0187,
  isPlaceholder: true,
};

export function useYardStrip(): YardStripPoint {
  return PLACEHOLDER_YARD;
}
