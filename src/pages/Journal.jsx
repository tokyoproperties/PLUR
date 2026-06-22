// Journal.jsx
// Plain-English: Shows the user's logged wildlife sightings.

import BottomNav from "./BottomNav";
import { useState, useEffect, useCallback } from "react";
import { listSpecies, listTrails, listObservations } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import LogSighting from "./LogSighting";

export default function Journal() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
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
      console.error("Error loading journal data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading journal…
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Wildlife Journal
      </h1>

      <button
        onClick={() => navigate("/log")}
        style={{
          marginBottom: "1.5rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        + Log New Sighting
      </button>

      <section>
        {observations.length === 0 ? (
          <p>No sightings logged yet.</p>
        ) : (
          <ul>
            {observations.map((obs, i) => (
              <li key={i} style={{ marginBottom: "1rem" }}>
                <strong>{obs.name || "Unknown species"}</strong>
                <br />
                {obs.trail && <span>Trail: {obs.trail}</span>}
                {obs.notes && (
                  <div style={{ marginTop: "0.25rem" }}>{obs.notes}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
