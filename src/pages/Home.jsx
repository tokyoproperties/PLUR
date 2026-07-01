// Home.jsx — EarthEye Lite Dashboard
// Minimal, stable, clean, PLUR/LOVE aligned

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listSpecies, listTrails } from "@/api/entities";

export default function Home() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, t] = await Promise.all([listSpecies(), listTrails()]);
      setSpecies(s || []);
      setTrails(t || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.25rem" }}>
        Loading EarthEye…
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem", paddingBottom: "5rem" }}>
      {/* EarthEye Title */}
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        EarthEye
      </h1>

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          onClick={() => navigate("/species")}
          style={{
            padding: "1rem",
            background: "#1a1a18",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
            {species.length}
          </div>
          <div style={{ opacity: 0.7 }}>Species</div>
        </div>

        <div
          onClick={() => navigate("/trails")}
          style={{
            padding: "1rem",
            background: "#1a1a18",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
            {trails.length}
          </div>
          <div style={{ opacity: 0.7 }}>Trails</div>
        </div>
      </div>

      {/* Field Mode */}
      <div
        onClick={() => navigate("/field")}
        style={{
          padding: "1rem",
          background: "#1a1a18",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
          Field Mode
        </div>
        <div style={{ opacity: 0.7 }}>Enter observation mode</div>
      </div>

      {/* Seasonal */}
      <div
        onClick={() => navigate("/seasonal")}
        style={{
          padding: "1rem",
          background: "#1a1a18",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
          Seasonal Cycle
        </div>
        <div style={{ opacity: 0.7 }}>See the year in motion</div>
      </div>

      {/* Sky */}
      <div
        onClick={() => navigate("/sky")}
        style={{
          padding: "1rem",
          background: "#1a1a18",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
          Sky
        </div>
        <div style={{ opacity: 0.7 }}>Light, horizon, and zenith</div>
      </div>
    </div>
  );
}
