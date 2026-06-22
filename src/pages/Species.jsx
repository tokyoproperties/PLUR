// Species.jsx
// Plain-English: Displays all species and allows filtering, searching, and navigation.

import { useState, useEffect, useMemo, useRef } from "react";
import BottomNav from "./BottomNav";
import { listSpecies, listObservations } from "@/api/entities";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

export default function SpeciesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const query = searchParams.get("q") || "";

  const [species, setSpecies] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    async function loadData() {
      try {
        const [speciesData, obsData] = await Promise.all([
          listSpecies(),
          listObservations(),
        ]);

        setSpecies(speciesData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading species data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredSpecies = useMemo(() => {
    return species.filter((s) =>
      s.name?.toLowerCase().includes(query.toLowerCase())
    );
  }, [species, query]);

  function updateQuery(value) {
    setSearchParams({ q: value });
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading species…
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
        Species
      </h1>

      <input
        type="text"
        value={query}
        onChange={(e) => updateQuery(e.target.value)}
        placeholder="Search species…"
        style={{
          width: "100%",
          padding: "0.75rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginBottom: "1.5rem",
        }}
      />

      <section>
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

    </div>
  );
}
