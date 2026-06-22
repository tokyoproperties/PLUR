// CuratorReview.jsx
// Plain-English: Curator tool for reviewing species images and approving/rejecting replacements.

import { useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import { listSpecies, listObservations } from "@/api/entities";

export default function CuratorReview() {
  const [species, setSpecies] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [flags, setFlags] = useState({});

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
    async function loadData() {
      try {
        const [speciesData, obsData] = await Promise.all([
          listSpecies(),
          listObservations(),
        ]);

        setSpecies(speciesData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading curator data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function next() {
    setIndex((i) => Math.min(i + 1, species.length - 1));
  }

  function prev() {
    setIndex((i) => Math.max(i - 1, 0));
  }

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
    a.download = "curator-flags.json";
    a.click();
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading curator review…
      </div>
    );
  }

  const current = species[index];
  if (!current) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>No species found.</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Curator Review
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
        📥 Export Flags
      </button>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h2>{current.name}</h2>
        <p style={{ color: "#666" }}>{current.group}</p>

        <img
          src={current.image}
          alt={current.name}
          style={{
            width: "100%",
            height: "240px",
            objectFit: "cover",
            borderRadius: "6px",
            marginTop: "0.5rem",
          }}
        />

        <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
          {current.image}
        </p>

        <div style={{ marginTop: "1rem" }}>
          <h3>Flag Violations</h3>
          {VIOLATIONS.map((v) => (
            <button
              key={v}
              onClick={() => toggleFlag(current.id, v)}
              style={{
                display: "inline-block",
                margin: "0.2rem",
                padding: "0.3rem 0.5rem",
                fontSize: "0.75rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                background:
                  flags[current.id]?.includes(v) ? "#ffdddd" : "#f7f7f7",
                cursor: "pointer",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={prev}
          disabled={index === 0}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: index === 0 ? "not-allowed" : "pointer",
          }}
        >
          ← Previous
        </button>

        <button
          onClick={next}
          disabled={index === species.length - 1}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor:
              index === species.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          Next →
        </button>
      </div>

    </div>
  );
}
