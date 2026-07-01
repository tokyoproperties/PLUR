// src/pages/Species.jsx
import { useState, useEffect, useMemo } from "react";
import { listSpecies } from "@/api/entities";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SpeciesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSpecies().then(data => {
      setSpecies(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return species.filter(s =>
      s.properties?.name?.toLowerCase().includes(query.toLowerCase())
    );
  }, [species, query]);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading species…</div>;
  }

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
        ← Back
      </button>

      <h1 style={{ fontSize: "2rem" }}>Species</h1>

      <input
        type="text"
        value={query}
        onChange={e => setSearchParams({ q: e.target.value })}
        placeholder="Search species…"
        style={{
          width: "100%",
          padding: "0.75rem",
          marginBottom: "1.5rem"
        }}
      />

      <ul>
        {filtered.map(s => (
          <li
            key={s.id}
            style={{ cursor: "pointer", marginBottom: "0.5rem" }}
            onClick={() => navigate(`/species/${s.id}`)}
          >
            {s.properties.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
