// Corridors.jsx
// Plain-English: Shows wildlife corridors, species movement, and related trails.

import { useState, useEffect, useRef } from "react";
import { listSpecies, listTrails } from "@/api/entities";
import { useNavigate, useParams } from "react-router-dom";

export default function Corridors() {
  const { corridorId } = useParams();
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    async function loadCorridorData() {
      try {
        const [speciesData, trailsData] = await Promise.all([
          listSpecies(),
          listTrails(),
        ]);

        setSpecies(speciesData || []);
        setTrails(trailsData || []);
      } catch (err) {
        console.error("Error loading corridor data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCorridorData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading corridor…
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
        Corridor: {corridorId}
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Species using this corridor</h2>
        <p>{species.length} species available</p>
      </section>

      <section>
        <h2>Trails connected to this corridor</h2>
        <p>{trails.length} trails available</p>
      </section>
    </div>
  );
}
