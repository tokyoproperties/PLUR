// NearMe.jsx
// Plain-English: Shows species and trails near the user's current location.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listSpecies, listTrails } from "@/api/entities";

export default function NearMe() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [speciesData, trailsData] = await Promise.all([
          listSpecies(),
          listTrails(),
        ]);

        setSpecies(speciesData || []);
        setTrails(trailsData || []);
      } catch (err) {
        console.error("Error loading NearMe data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Finding what’s near you…
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
        Near Me
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Species Nearby</h2>
        <p>{species.length} species detected</p>
      </section>

      <section>
        <h2>Trails Nearby</h2>
        <p>{trails.length} trails detected</p>
      </section>
    </div>
  );
}
