// HabitatDetail.jsx
// Plain-English: Detailed view for a single habitat — species, trails, and observations.

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listSpecies, listTrails, listObservations } from "@/api/entities";
import BottomNav from "./BottomNav";

export default function HabitatDetail() {
  const navigate = useNavigate();
  const { type } = useParams(); // e.g., "chaparral", "oak-woodland"

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // This is where you'd normally map habitat types to metadata
  const habitatName = type
    ? type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Unknown Habitat";

  useEffect(() => {
    async function loadData() {
      try {
        const [speciesData, trailsData, obsData] = await Promise.all([
          listSpecies(),
          listTrails(),
          listObservations(),
        ]);

        setSpecies(speciesData || []);
        setTrails(trailsData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading habitat detail:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [type]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading habitat…
      </div>
    );
  }

  // Filter observations by habitat type if your data supports it
  const relatedObservations = observations.filter(
    (o) => o.habitat && o.habitat.toLowerCase() === type?.toLowerCase()
  );

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
        {habitatName}
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Habitat Overview</h2>
        <p>
          This habitat contains {species.length} species and {trails.length} trails
          associated with it.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Species in This Habitat</h2>
        {species.length === 0 ? (
          <p>No species recorded for this habitat.</p>
        ) : (
          <ul>
            {species.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Trails in This Habitat</h2>
        {trails.length === 0 ? (
          <p>No trails recorded for this habitat.</p>
        ) : (
          <ul>
            {trails.map((t) => (
              <li key={t.id}>{t.name}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Recent Observations</h2>
        {relatedObservations.length === 0 ? (
          <p>No observations for this habitat yet.</p>
        ) : (
          <ul>
            {relatedObservations.map((obs, i) => (
              <li key={i}>{obs.notes || "Observation recorded"}</li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
