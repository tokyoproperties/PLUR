// Sky.jsx
// Plain-English: Sky Intelligence — shows sky conditions, celestial events, and observation logs.

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listSpecies, listObservations } from "@/api/entities";
import BottomNav from "./BottomNav";

export default function Sky() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get("mode") || "default";

  const [species, setSpecies] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [speciesData, obsData] = await Promise.all([
          listSpecies(),
          listObservations(),
        ]);

        setSpecies(speciesData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading Sky Intelligence data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const skySummary = useMemo(() => {
    return {
      speciesCount: species.length,
      observationCount: observations.length,
    };
  }, [species, observations]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading Sky Intelligence…
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
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
        Sky Intelligence
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Overview</h2>
        <p>{skySummary.speciesCount} species logged</p>
        <p>{skySummary.observationCount} total observations</p>
      </section>

      <section>
        <h2>Recent Observations</h2>
        {observations.length === 0 ? (
          <p>No sky-related observations yet</p>
        ) : (
          <ul>
            {observations.map((obs, i) => (
              <li key={i}>{obs.name || "Unknown observation"}</li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
