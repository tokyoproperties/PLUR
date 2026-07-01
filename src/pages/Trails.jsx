// src/pages/Trails.jsx
import { useState, useEffect, useMemo } from "react";
import { listTrails } from "@/api/entities";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function TrailsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listTrails().then(data => {
      setTrails(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return trails.filter(t =>
      t.properties?.name?.toLowerCase().includes(query.toLowerCase())
    );
  }, [trails, query]);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading trails…</div>;
  }

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
        ← Back
      </button>

      <h1 style={{ fontSize: "2rem" }}>Trails</h1>

      <input
        type="text"
        value={query}
        onChange={e => setSearchParams({ q: e.target.value })}
        placeholder="Search trails…"
        style={{
          width: "100%",
          padding: "0.75rem",
          marginBottom: "1.5rem"
        }}
      />

      <ul>
        {filtered.map(t => (
          <li
            key={t.id}
            style={{ cursor: "pointer", marginBottom: "0.5rem" }}
            onClick={() => navigate(`/trail/${t.id}`)}
          >
            {t.properties.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
