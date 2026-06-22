// Yearbook.jsx
// Plain-English: Annual ecological memory — species streaks, seasons, and yearly summaries.

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listSpecies, listObservations } from "@/api/entities";
import BottomNav from "./BottomNav";

export default function Yearbook() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [speciesData, obsData] = await Promise.all([
          listSpecies(),
          listObservations(),
        ]);

        setSpecies(speciesData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading Yearbook:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Group observations by year
  const byYear = useMemo(() => {
    const map = {};
    observations.forEach((obs) => {
      const year = new Date(obs.timestamp || Date.now()).getFullYear();
      if (!map[year]) map[year] = [];
      map[year].push(obs);
    });
    return map;
  }, [observations]);

  // Compute species streaks (simple version)
  const streaks = useMemo(() => {
    const map = {};
    observations.forEach((obs) => {
      const name = obs.name || "Unknown species";
      if (!map[name]) map[name] = 0;
      map[name] += 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [observations]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Building your Yearbook…
      </div>
    );
  }

  const years = Object.keys(byYear).sort((a, b) => b - a);

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Yearbook
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Top Species Streaks</h2>
        {streaks.length === 0 ? (
          <p>No observations yet.</p>
        ) : (
          <ul>
            {streaks.map(([name, count]) => (
              <li key={name}>
                {name}: {count} sightings
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Yearly Records</h2>
        {years.length === 0 ? (
          <p>No yearly data yet.</p>
        ) : (
          years.map((year) => (
            <div
              key={year}
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.4rem",
                  marginBottom: "0.5rem",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/year/${year}`)}
              >
                {year}
              </h3>
              <p>{byYear[year].length} observations</p>
            </div>
          ))
        )}
      </section>

    </div>
  );
}
