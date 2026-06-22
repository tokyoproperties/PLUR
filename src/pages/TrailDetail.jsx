// TrailDetail.jsx
// Plain-English: Detailed view for a single trail — species, conditions, observations.

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listSpecies, listTrails, listObservations } from "@/api/entities";
import BottomNav from "./BottomNav";

export default function TrailDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [trail, setTrail] = useState(null);
  const [species, setSpecies] = useState([]);
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

        const match = trailsData?.find((t) => String(t.id) === String(id));
        setTrail(match || null);

        setSpecies(speciesData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading trail detail:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading trail…
      </div>
    );
  }

  if (!trail) {
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
        <h1>Trail Not Found</h1>
      </div>
    );
  }

  const relatedObservations = observations.filter(
    (o) => o.trailId && String(o.trailId) === String(id)
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
        {trail.name}
      </h1>

      {trail.region && (
        <p style={{ marginBottom: "1rem" }}>
          Region: {trail.region}
        </p>
      )}

      <section style={{ marginBottom: "2rem" }}>
        <h2>Description</h2>
        <p>{trail.description || "No description available."}</p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Distance</h2>
        <p>{trail.distance || "Unknown"} miles</p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Difficulty</h2>
        <p>{trail.difficulty || "Unknown"}</p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Species Seen Here</h2>
        <p>{species.length} species logged</p>
      </section>

      <section>
        <h2>Recent Observations</h2>
        {relatedObservations.length === 0 ? (
          <p>No observations for this trail yet.</p>
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
