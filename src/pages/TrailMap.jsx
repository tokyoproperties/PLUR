// TrailMap.jsx
// Plain-English: A conceptual map of the trail network — simplified and Vite-safe.

import { useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import { listTrails, listObservations } from "@/api/entities";

export default function TrailMap() {
  const [trails, setTrails] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [t, o] = await Promise.all([listTrails(), listObservations()]);
        setTrails(t || []);
        setObservations(o || []);
      } catch (err) {
        console.error("Error loading trail map:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading trail map…
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Trail Map
      </h1>

      <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
        This is a conceptual map of the trail network — a simplified view of
        how trails relate to each other, how they cluster, and how they form
        the movement structure of the region.
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Dataset Summary</h2>
        <ul>
          <li>Trails: {trails.length}</li>
          <li>Observations: {observations.length}</li>
        </ul>
      </section>

      <section>
        <h2>Trail Network</h2>
        {trails.map((t) => {
          const count = observations.filter(
            (o) => String(o.trailId) === String(t.id)
          ).length;

          return (
            <div
              key={t.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>{t.name}</h3>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                {t.region || "Unknown region"}
              </p>

              <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                Observations: {count}
              </p>

              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.8rem",
                  wordBreak: "break-all",
                }}
              >
                {t.heroImage}
              </p>
            </div>
          );
        })}
      </section>

    </div>
  );
}
