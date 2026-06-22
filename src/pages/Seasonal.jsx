// Seasonal.jsx
// Plain-English: Shows seasonal species patterns and trail conditions.

import BottomNav from "./BottomNav";
import { useState, useEffect } from "react";
import { listSpecies, listTrails, listObservations } from "@/api/entities";
import { useNavigate } from "react-router-dom";

export default function Seasonal() {
  const navigate = useNavigate();

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
        console.error("Error loading seasonal data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading seasonal insights…
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
        Seasonal Patterns
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Species Active This Season</h2>
        <p>{species.length} species observed</p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Trail Conditions</h2>
        <p>{trails.length} trails monitored</p>
      </section>

      <section>
        <h2>Recent Seasonal Observations</h2>
        {observations.length === 0 ? (
          <p>No recent observations</p>
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
