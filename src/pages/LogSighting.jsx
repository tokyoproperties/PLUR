// LogSighting.jsx
// Plain-English: Allows the user to log a wildlife sighting in the field.

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { listSpecies, listTrails, listObservations } from "@/api/entities";

export default function LogSighting() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedTrail, setSelectedTrail] = useState("");
  const [notes, setNotes] = useState("");

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
        console.error("Error loading sighting data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    console.log("Sighting logged:", {
      species: selectedSpecies,
      trail: selectedTrail,
      notes,
    });

    navigate(-1);
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading sighting form…
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
        Log a Sighting
      </h1>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: "1rem" }}>
          Species:
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            style={{ marginLeft: "1rem" }}
          >
            <option value="">Select species</option>
            {species.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          Trail:
          <select
            value={selectedTrail}
            onChange={(e) => setSelectedTrail(e.target.value)}
            style={{ marginLeft: "1rem" }}
          >
            <option value="">Select trail</option>
            {trails.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          Notes:
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              height: "80px",
              marginTop: "0.5rem",
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Save Sighting
        </button>
      </form>
    </div>
  );
}
