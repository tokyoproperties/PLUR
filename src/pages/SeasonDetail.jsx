// SeasonDetail.jsx
// Plain-English: Shows details for a specific season, including species, trails, and observations.

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listSpecies, listTrails, listObservations } from "@/api/entities";

export default function SeasonDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const season = searchParams.get("season") || "Unknown Season";

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [speciesData, trailsData, obsData] = await Promise.all([
          listSpecies(),
          listTrails(),
          listObservations(),
        ]);

        setSpecies(speciesData || []);
        setTrails(trailsData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading season detail:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading seasonal details…
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
        {season} Season
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Active Species</h2>
        <p>{species.length} species observed</p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Trail Conditions</h2>
        <p>{trails.length} trails monitored</p>
      </section>

      <section>
        <h2>Seasonal Observations</h2>
        {observations.length === 0 ? (
          <p>No observations for this season</p>
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
