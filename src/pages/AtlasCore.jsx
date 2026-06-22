// AtlasCore.jsx
// Plain-English: The conceptual export of the atlas — the engines that make the organism work.

import { useState, useEffect, useMemo } from "react";
import BottomNav from "./BottomNav";
import { listSpecies, listTrails, listObservations } from "@/api/entities";

export default function AtlasCore() {
  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, t, o] = await Promise.all([
          listSpecies(),
          listTrails(),
          listObservations(),
        ]);

        setSpecies(s || []);
        setTrails(t || []);
        setObservations(o || []);
      } catch (err) {
        console.error("Error loading Atlas Core:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const core = useMemo(() => {
    return [
      {
        name: "Seasonal Engine",
        desc:
          "Understands the shifting presence of species, weather, bloom cycles, and ecological timing.",
      },
      {
        name: "Corridor Engine",
        desc:
          "Understands movement — migration, flow, bottlenecks, and the invisible highways of wildlife.",
      },
      {
        name: "Habitat Engine",
        desc:
          "Understands the structure of place — chaparral, oak woodland, riparian, coastal, and more.",
      },
      {
        name: "Phenology Engine",
        desc:
          "Understands timing — first bloom, first call, first molt, first arrival, first departure.",
      },
      {
        name: "Journal Engine",
        desc:
          "Understands memory — your observations, your streaks, your ecological year.",
      },
      {
        name: "Companion Engine",
        desc:
          "Understands presence — where you are, what’s around you, and what the land is doing right now.",
      },
    ];
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading Atlas Core…
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Atlas Core
      </h1>

      <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
        The atlas is not a map. It is an ecological organism composed of
        engines — each one responsible for a different way the land expresses
        itself. This page exports the conceptual core of the system.
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Dataset Summary</h2>
        <ul>
          <li>Species: {species.length}</li>
          <li>Trails: {trails.length}</li>
          <li>Observations: {observations.length}</li>
        </ul>
      </section>

      <section>
        <h2>Core Engines</h2>
        {core.map((engine) => (
          <div
            key={engine.name}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ marginBottom: "0.5rem" }}>{engine.name}</h3>
            <p style={{ lineHeight: "1.5" }}>{engine.desc}</p>
          </div>
        ))}
      </section>

    </div>
  );
}
