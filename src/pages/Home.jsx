// Home.jsx
// Plain-English: Main dashboard showing quick access to species, trails, and field mode.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listSpecies, listTrails } from "@/api/entities";
import BottomNav from "./BottomNav";

export default function Home() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [speciesData, trailsData] = await Promise.all([
          listSpecies(),
          listTrails(),
        ]);

        setSpecies(speciesData || []);
        setTrails(trailsData || []);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading EarthEye…
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        EarthEye Home
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Species</h2>
        <p>{species.length} species available</p>
        <button
          onClick={() => navigate("/species")}
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          View Species →
        </button>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Trails</h2>
        <p>{trails.length} trails available</p>
        <button
          onClick={() => navigate("/trails")}
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          View Trails →
        </button>
      </section>

      <section>
        <h2>Field Mode</h2>
        <button
          onClick={() => navigate("/field")}
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Enter Field Mode →
        </button>
      </section>

    </div>
  );
}
