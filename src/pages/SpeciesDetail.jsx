// SpeciesDetail.jsx
// Plain-English: Detailed view for a single species — description, notes, seasonality, trails.

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listSpecies, listTrails, listObservations } from "@/api/entities";
import BottomNav from "./BottomNav";

export default function SpeciesDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [species, setSpecies] = useState(null);
  const [trails, setTrails] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [speciesData, trailsData, obsData] = await Promise.all([
          listSpecies(),
          listTrails(),
          listObservations(),
        ]);

        const match = speciesData?.find((s) => String(s.id) === String(id));
        setSpecies(match || null);

        setTrails(trailsData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading species detail:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading species…
      </div>
    );
  }

  if (!species) {
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
        <h1>Species Not Found</h1>
      </div>
    );
  }

  const relatedObservations = observations.filter(
    (o) => o.speciesId && String(o.speciesId) === String(id)
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

      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        {species.name}
      </h1>

      {species.scientificName && (
        <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>
          {species.scientificName}
        </p>
      )}

      <section style={{ marginBottom: "2rem" }}>
        <h2>Description</h2>
        <p>{species.description || "No description available."}</p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Field Notes</h2>
        {species.notes?.length ? (
          <ul>
            {species.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        ) : (
          <p>No field notes yet.</p>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Seasonality</h2>
        {species.seasonality?.length ? (
          <p>Active months: {species.seasonality.join(", ")}</p>
        ) : (
          <p>No seasonality data.</p>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Trails Where Seen</h2>
        <p>{trails.length} trails available</p>
      </section>

      <section>
        <h2>Recent Observations</h2>
        {relatedObservations.length === 0 ? (
          <p>No observations for this species yet.</p>
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
