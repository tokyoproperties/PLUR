// ImageAudit.jsx
// Plain-English: Admin tool for reviewing species images and flagging violations.

import { useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import { listSpecies } from "@/api/entities";

export default function ImageAudit() {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flagged, setFlagged] = useState([]);

  const VIOLATIONS = [
    "Hands/Holding",
    "Captive/Zoo/Rehab",
    "Staged",
    "Gore/Predation",
    "Wrong Species",
    "Non-CA",
    "Poor Quality",
  ];

  useEffect(() => {
    async function loadAllSpecies() {
      try {
        const all = await listSpecies();
        setSpecies(all || []);
      } catch (err) {
        console.error("Error loading species:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllSpecies();
  }, []);

  function toggleFlag(id, violation) {
    setFlagged((prev) => {
      const existing = prev.find((f) => f.id === id);
      if (!existing) {
        return [...prev, { id, violations: [violation] }];
      }

      const updated = existing.violations.includes(violation)
        ? existing.violations.filter((v) => v !== violation)
        : [...existing.violations, violation];

      return prev.map((f) =>
        f.id === id ? { ...f, violations: updated } : f
      );
    });
  }

  function exportFlagged() {
    const blob = new Blob([JSON.stringify(flagged, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "flagged.json";
    a.click();
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Fetching species…
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Image Audit
      </h1>

      <button
        onClick={exportFlagged}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        📥 Export Flagged
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {species.map((s) => (
          <div
            key={s.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "0.5rem",
            }}
          >
            <img
              src={s.image}
              alt={s.name}
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "6px",
              }}
            />

            <h3 style={{ marginTop: "0.5rem" }}>{s.name}</h3>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>{s.group}</p>
            <p style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
              {s.image}
            </p>

            <div style={{ marginTop: "0.5rem" }}>
              {VIOLATIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => toggleFlag(s.id, v)}
                  style={{
                    display: "inline-block",
                    margin: "0.2rem",
                    padding: "0.3rem 0.5rem",
                    fontSize: "0.75rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    background:
                      flagged.find((f) => f.id === s.id)?.violations.includes(v)
                        ? "#ffdddd"
                        : "#f7f7f7",
                    cursor: "pointer",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
