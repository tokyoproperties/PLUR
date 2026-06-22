// Stewardship.jsx
// Plain-English: The stewardship dashboard — your actions, patterns, and ecological impact.

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listSpecies, listTrails, listObservations } from "@/api/entities";
import BottomNav from "./BottomNav";

export default function Stewardship() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
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

        setSpecies(speciesData || []);
        setTrails(trailsData || []);
        setObservations(obsData || []);
      } catch (err) {
        console.error("Error loading stewardship data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Stewardship metrics
  const metrics = useMemo(() => {
    return {
      speciesCount: species.length,
      trailCount: trails.length,
      observationCount: observations.length,
    };
  }, [species, trails, observations]);

  // Stewardship narrative
  const narrative = useMemo(() => {
    return `
Your Stewardship Summary

You’ve observed ${metrics.speciesCount} species,
walked or monitored ${metrics.trailCount} trails,
and recorded ${metrics.observationCount} ecological moments.

Stewardship isn’t performance — it’s presence.
It’s noticing patterns, returning to places,
and letting the land teach you how to care for it.

This dashboard reflects your quiet work.
    `.trim();
  }, [metrics]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Loading stewardship…
      </div>
    );
  }

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
        Stewardship
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Your Metrics</h2>
        <ul>
          <li>Species logged: {metrics.speciesCount}</li>
          <li>Trails engaged: {metrics.trailCount}</li>
          <li>Observations recorded: {metrics.observationCount}</li>
        </ul>
      </section>

      <section>
        <h2>Your Stewardship Story</h2>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            lineHeight: "1.5",
            fontSize: "1.1rem",
            background: "#f7f7f7",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          {narrative}
        </pre>
      </section>

    </div>
  );
}
