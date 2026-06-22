// src/pages/AtlasReady.jsx
import { useState, useEffect } from "react";
import { listSpecies, listTrails } from "@/api/entities";

// ✅ must be top‑level, outside any component
export function ErrorBoundary({ children }) {
  return children;
}

export default function AtlasReady() {
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
        console.error("Error loading Atlas data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div style={{ padding: "2rem" }}>Loading Atlas…</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Atlas Ready</h1>
      <h2>Species Loaded</h2>
      <p>{species.length} species available</p>
      <h2>Trails Loaded</h2>
      <p>{trails.length} trails available</p>
    </div>
  );
}
