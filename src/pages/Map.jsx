// Map.jsx
// Plain-English: A conceptual overview map of the region — simplified and Vite-safe.

import { useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import { listTrails, listSpecies, listObservations } from "@/api/entities";

export default function Map() {
  const [trails, setTrails] = useState([]);
  const [species, setSpecies] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [t, s, o] = await Promise.all([
          listTrails(),
          listSpecies(),
          listObservations(),
        ]);

        setTrails(t || []);
        setSpecies(s || []);
        setObservations(o || []);
      } catch (err) {
        console.error("Error loading map data:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading map…
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Map
      </h1>

      <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
        This is a conceptual map of the region — a high-level view of trails,
        species presence, and observation density. It is not a geographic map,
        but a structural overview of how the land is organized.
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Dataset Summary</h2>
        <ul>
          <li>Trails: {trails.length}</li>
          <li>Species: {species.length}</li>
          <li>Observations: {observations.length}</li>
        </ul>
      </section>

      <section>
        <h2>Regions</h2>
        {Object.entries(
          trails.reduce((acc, t) => {
            const region = t.region || "Unknown Region";
            acc[region] = acc[region] || [];
            acc[region].push(t);
            return acc;
          }, {})
        ).map(([region, regionTrails]) => (
          <div
            key={region}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ marginBottom: "0.5rem" }}>{region}</h3>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Trails: {regionTrails.length}
            </p>

            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
              {regionTrails.map((t) => (
                <li key={t.id} style={{ marginBottom: "0.25rem" }}>
                  {t.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

    </div>
  );
}
