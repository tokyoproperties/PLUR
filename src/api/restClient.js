// restClient.js
// EarthEye OC — REST data layer for PLUR build
// Connects to live Base44 backend. No SDK dependency.

const API_BASE = "https://special-agent-44-342f8e58.base44.app/functions/getAtlasData";

function makeHeaders() {
  return { "Content-Type": "application/json" };
}

export async function getJSON(path) {
  const [rawPath, queryString] = path.split("?");
  const parts = rawPath.split("/").filter(Boolean);
  const entity = parts[0];
  const id = parts[1];
  const params = new URLSearchParams();
  params.set("entity", entity);
  if (id) params.set("id", id);
  if (queryString) {
    new URLSearchParams(queryString).forEach((v, k) => params.set(k, v));
  }
  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    method: "GET", headers: makeHeaders(),
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function postJSON(path, body) {
  const entity = path.split("/").filter(Boolean)[0];
  const params = new URLSearchParams();
  params.set("entity", entity);
  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    method: "POST", headers: makeHeaders(), body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function putJSON(path, body) {
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams();
  params.set("entity", parts[0]);
  if (parts[1]) params.set("id", parts[1]);
  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    method: "PUT", headers: makeHeaders(), body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}

export async function deleteJSON(path) {
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams();
  params.set("entity", parts[0]);
  if (parts[1]) params.set("id", parts[1]);
  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    method: "DELETE", headers: makeHeaders(),
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json();
}
