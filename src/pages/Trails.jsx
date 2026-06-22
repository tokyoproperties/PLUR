// Trails.jsx
// Plain-English: Displays all trails with search, filtering, and navigation.

import { useState, useEffect, useMemo } from "react";
import BottomNav from "./BottomNav";
import { listTrails, listObservations } from "@/api/entities";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function TrailsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  const [trails, setTrails] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [trailData, obsData] = await Promise.all([
          listTrails(),
          listObservations(),
        ]);

        setTrails(trailData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading trails:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredTrails = useMemo(() => {
    return trails.filter((t) =>
      t.name?.toLowerCase().includes(query.toLowerCase())
    );
  }, [trails, query]);

  function updateQuery(value) {
    setSearchParams({ q: value });
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading trails…
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
        Trails
      </h1>

      <input
        type="text"
        value={query}
        onChange={(e) => updateQuery(e.target.value)}
        placeholder="Search trails…"
        style={{
          width: "100%",
          padding: "0.75rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginBottom: "1.5rem",
        }}
      />

      <section>
        {filteredTrails.length === 0 ? (
          <p>No matching trails</p>
        ) : (
          <ul>
            {filteredTrails.map((t) => (
              <li
                key={t.id}
                style={{ cursor: "pointer", marginBottom: "0.5rem" }}
                onClick={() => navigate(`/trail/${t.id}`)}
              >
                {t.name}
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
