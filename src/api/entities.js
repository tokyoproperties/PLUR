// src/api/entities.js
// EarthEye OC — entity fetch functions connected to live backend

import { getJSON, postJSON, putJSON, deleteJSON } from "./restClient";

// ── Species ──────────────────────────────────────────────────────────────────
export async function listSpecies(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return getJSON(params ? `Species?${params}` : "Species");
}

export async function getSpecies(id) {
  return getJSON(`Species/${id}`);
}

export async function createSpecies(data) {
  return postJSON("Species", data);
}

export async function updateSpecies(id, data) {
  return putJSON(`Species/${id}`, data);
}

export async function deleteSpecies(id) {
  return deleteJSON(`Species/${id}`);
}

// ── Trail ─────────────────────────────────────────────────────────────────────
export async function listTrails(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return getJSON(params ? `Trail?${params}` : "Trail");
}

export async function getTrail(id) {
  return getJSON(`Trail/${id}`);
}

export async function createTrail(data) {
  return postJSON("Trail", data);
}

export async function updateTrail(id, data) {
  return putJSON(`Trail/${id}`, data);
}

export async function deleteTrail(id) {
  return deleteJSON(`Trail/${id}`);
}

// ── Observation ───────────────────────────────────────────────────────────────
export async function listObservations(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return getJSON(params ? `Observation?${params}` : "Observation");
}

export async function getObservation(id) {
  return getJSON(`Observation/${id}`);
}

export async function createObservation(data) {
  return postJSON("Observation", data);
}

export async function updateObservation(id, data) {
  return putJSON(`Observation/${id}`, data);
}

export async function deleteObservation(id) {
  return deleteJSON(`Observation/${id}`);
}
