// src/api/entities.js
// Plain-English: Central API functions for species, trails, and observations.

// Example placeholder data fetchers.
// Replace these with real API calls when ready.

export async function listSpecies() {
  return [
    // { id: 1, name: "Red-tailed Hawk" },
    // { id: 2, name: "Western Fence Lizard" },
  ];
}

export async function listTrails() {
  return [
    // { id: 1, name: "Canyon Loop" },
    // { id: 2, name: "River Path" },
  ];
}

// Added because Field.jsx imports it
export async function listObservations() {
  return [
    // { id: 1, name: "Hawk spotted near ridge" },
  ];
}
