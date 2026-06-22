// Search.jsx
// Plain-English: Search across species and trails with live filtering.

import BottomNav from "./BottomNav";
import { useState, useEffect, useRef } from "react";
import { listSpecies, listTrails } from "@/api/entities";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    async function loadData() {
      try {
        const [speciesData, trailsData] = await Promise.all([
          listSpecies(),
          listTrails(),
        ]);

        setSpecies(speciesData || []);
        setTrails(trailsData || []);
      } catch (err) {
        console.error("Error loading search data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function updateQuery(value) {
    setQuery(value);
    setSearchParams({ q: value });
  }

  const filteredSpecies = species.filter((s) =>
    s.name?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTrails = trails.filter((t) =>
    t.name?.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Searching EarthEye…
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
        Search
      </h1>

      <input
        type="text"
        value={query}
        onChange={(e) => updateQuery(e.target.value)}
        placeholder="Search species or trails…"
        style={{
          width: "100%",
          padding: "0.75rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginBottom: "1.5rem",
        }}
      />

      <section style={{ marginBottom: "2rem" }}>
        <h2>Species</h2>
        {filteredSpecies.length === 0 ? (
          <p>No matching species</p>
        ) : (
          <ul>
            {filteredSpecies.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Trails</h2>
        {filteredTrails.length === 0 ? (
          <p>No matching trails</p>
        ) : (
          <ul>
            {filteredTrails.map((t) => (
              <li key={t.id}>{t.name}</li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
