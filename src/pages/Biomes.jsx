// Biomes.jsx
// Plain-English: Shows biome details, species, and trails for a given biome.

import { useState, useEffect, useRef } from "react";
import { listSpecies, listTrails } from "@/api/entities";
import { useNavigate, useParams } from "react-router-dom";

export default function Biomes() {
  const { biomeId } = useParams();
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    async function loadBiomeData() {
      try {
        const [speciesData, trailsData] = await Promise.all([
          listSpecies(),
          listTrails(),
        ]);

        setSpecies(speciesData || []);
        setTrails(trailsData || []);
      } catch (err) {
        console.error("Error loading biome data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBiomeData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading biome…
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Biome: {biomeId}
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Species in this biome</h2>
        <p>{species.length} species available</p>
      </section>

      <section>
        <h2>Trails in this biome</h2>
        <p>{trails.length} trails available</p>
      </section>
    </div>
  );
}
