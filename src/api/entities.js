// src/api/entities.js
// EarthEye OC — simplified local loader using existing dummyPoints.json

import data from "@/data/dummyPoints.json";

// Species = all features where properties.type === "Species"
export async function listSpecies() {
  return data.features.filter(f => f.properties?.type === "Species");
}

export async function getSpecies(id) {
  return data.features.find(
    f => f.id == id && f.properties?.type === "Species"
  );
}

// Trails = all features where properties.type === "Trail"
export async function listTrails() {
  return data.features.filter(f => f.properties?.type === "Trail");
}

export async function getTrail(id) {
  return data.features.find(
    f => f.id == id && f.properties?.type === "Trail"
  );
}

// Observations (optional)
export async function listObservations() {
  return [];
}
