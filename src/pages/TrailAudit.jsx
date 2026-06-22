// TrailAudit.jsx
// Plain-English: Admin tool for reviewing trail images, metadata, and mismatches.

import { useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import { listTrails, listObservations } from "@/api/entities";

export default function TrailAudit() {
  const [trails, setTrails] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState({});

  const VIOLATIONS = [
    "Wrong Image",
    "Duplicate Image",
    "Mismatch Biome",
    "Urban Instead of Natural",
    "Low Quality",
    "Not OC",
    "Missing Image",
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [trailData, obsData] = await Promise.all([
          listTrails(),
          listObservations(),
        ]);

        setTrails(trailData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading trail audit data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function toggleFlag(id, violation) {
    setFlags((prev) => {
      const existing = prev[id] || [];
      const updated = existing.includes(violation)
        ? existing.filter((v) => v !== violation)
        : [...existing, violation];

      return { ...prev, [id]: updated };
    });
  }

  function exportFlags() {
    const blob = new Blob([JSON.stringify(flags, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "trail-audit.json";
    a.click();
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading trail audit…
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Trail Audit
      </h1>

      <button
        onClick={exportFlags}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        📥 Export Audit Results
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
        }}
      >
        {trails.map((t) => {
          const obsCount = observations.filter(
            (o) => String(o.trailId) === String(t.id)
          ).length;

          return (
            <div
              key={t.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "0.75rem",
              }}
            >
              <img
                src={t.heroImage}
                alt={t.name}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />

              <h3 style={{ marginTop: "0.5rem" }}>{t.name}</h3>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                {t.region || "Unknown region"}
              </p>

              <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                Observations: {obsCount}
              </p>

              <p style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
                {t.heroImage}
              </p>

              <div style={{ marginTop: "0.5rem" }}>
                {VIOLATIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => toggleFlag(t.id, v)}
                    style={{
                      display: "inline-block",
                      margin: "0.2rem",
                      padding: "0.3rem 0.5rem",
                      fontSize: "0.75rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      background:
                        flags[t.id]?.includes(v) ? "#ffdddd" : "#f7f7f7",
                      cursor: "pointer",
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
