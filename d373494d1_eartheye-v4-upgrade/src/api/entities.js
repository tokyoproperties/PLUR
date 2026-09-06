// src/api/entities.js
// EarthEye OC — live atlas data layer (v4, Sep 5 2026)
// Reads the full atlas through getAtlasData — the same Mission 13C source
// the mobile app reads. Flat records, module-cached after first load.
// Observation records are never fetched (doctrine: sighting locations
// are private; the public endpoint answers []).

import { getJSON } from "./restClient";

let _species = null;
let _trails = null;

export async function listSpecies() {
  if (!_species) _species = (await getJSON("Species")) || [];
  return _species;
}

export async function getSpecies(id) {
  const all = await listSpecies();
  return all.find((r) => String(r.id) === String(id)) || null;
}

export async function listTrails() {
  if (!_trails) _trails = (await getJSON("Trail")) || [];
  return _trails;
}

export async function getTrail(id) {
  const all = await listTrails();
  return all.find((r) => String(r.id) === String(id)) || null;
}

export async function listObservations() {
  return [];
}
