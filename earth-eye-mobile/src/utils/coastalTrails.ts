/**
 * utils/coastalTrails.ts
 *
 * Mission 8 (Species Architecture v2, July 7 2026): canonical
 * "is this trail name coastal?" keyword matcher. Found TWO
 * independent copies of this exact logic — fieldMoment.ts's
 * determineCardType() and useSpeciesArrival.ts's nearCoastal — already
 * silently diverged (useSpeciesArrival's list included 'crystal cove',
 * 'laguna', and 'aliso creek beach'; fieldMoment's did not). Same bug
 * shape as every prior mission's duplicated-magic-number findings,
 * just keyword lists instead of numeric thresholds. This is now the
 * one copy; both call sites import it.
 */

const COASTAL_KEYWORDS = [
  'beach',
  'cove',
  'coast',
  'bluff',
  'harbor',
  'pier',
  'dana point',
  'crystal cove',
  'laguna',
  'aliso creek beach',
];

export function isCoastalTrailName(trailName: string | null | undefined): boolean {
  if (!trailName) return false;
  const lower = trailName.toLowerCase();
  return COASTAL_KEYWORDS.some((keyword) => lower.includes(keyword));
}
