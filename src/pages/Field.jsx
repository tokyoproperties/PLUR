// Field.jsx
// Plain-English: Field mode for quick observations, species lookup, and trail context.

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listSpecies, listTrails, listObservations } from "@/api/entities";
import BottomNav from "./BottomNav";

export default function Field() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFieldData() {
      try {
        const [speciesData, trailsData, obsData] = await Promise.all([
          listSpecies(),
          listTrails(),
          listObservations?.() ?? Promise.resolve([]),
        ]);

        setSpecies(speciesData || []);
        setTrails(trailsData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading field data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFieldData();
  }, []);

  const recentObservations = useMemo(() => {
    return observations.slice(0, 5);
  }, [observations]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading field data…
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Field Mode
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Species Nearby</h2>
        <p>{species.length} species available</p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Trails Nearby</h2>
        <p>{trails.length} trails available</p>
      </section>

      <section>
        <h2>Recent Observations</h2>
        {recentObservations.length === 0 ? (
          <p>No observations yet</p>
        ) : (
          <ul>
            {recentObservations.map((obs, i) => (
              <li key={i}>{obs.name || "Unknown observation"}</li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
