// CorridorMap.jsx
// Plain-English: A conceptual map of wildlife corridors — simplified and Vite-safe.

import { useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import { listTrails, listSpecies, listObservations } from "@/api/entities";

export default function CorridorMap() {
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
        console.error("Error loading corridor map:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const corridors = [
    {
      name: "Coastal → Inland",
      desc:
        "Movement from coastal sage scrub into inland foothill habitats. " +
        "Used by coyotes, bobcats, roadrunners, and migrating songbirds.",
    },
    {
      name: "Riparian Spine",
      desc:
        "Corridors following creeks and seasonal waterways. " +
        "High biodiversity, amphibian movement, and bird migration.",
    },
    {
      name: "Chaparral Ridge Line",
      desc:
        "Ridge-to-ridge movement across chaparral slopes. " +
        "Used by deer, mountain lions, and raptors.",
    },
    {
      name: "Urban Fragment Connectors",
      desc:
        "Small but critical pathways between fragmented green spaces. " +
        "Used by opossums, raccoons, and urban-adapted species.",
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading corridors…
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Corridor Map
      </h1>

      <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
        Wildlife corridors are the invisible highways of the land. They allow
        species to move, migrate, feed, breed, and survive across fragmented
        habitats. This page summarizes the major corridor types in the region.
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
        <h2>Corridor Types</h2>
        {corridors.map((c) => (
          <div
            key={c.name}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ marginBottom: "0.5rem" }}>{c.name}</h3>
            <p style={{ lineHeight: "1.5" }}>{c.desc}</p>
          </div>
        ))}
      </section>

    </div>
  );
}
