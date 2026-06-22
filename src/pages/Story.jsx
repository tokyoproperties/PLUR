// Story.jsx
// Plain-English: Generates a narrative summary based on species, trails, and observations.

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listSpecies, listTrails, listObservations } from "@/api/entities";
import BottomNav from "./BottomNav";

export default function Story() {
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
        console.error("Error loading story data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const storyText = useMemo(() => {
    const sCount = species.length;
    const tCount = trails.length;
    const oCount = observations.length;

    return `
Your EarthEye Story

This landscape is alive with ${sCount} species,
woven across ${tCount} trails,
and shaped by ${oCount} observations you've recorded.

Each sighting is a thread.
Each trail is a path through memory.
Each species is a character in the world you’re learning to read.

This is your ecological story — still unfolding.
    `.trim();
  }, [species, trails, observations]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontSize: "1.5rem" }}>
        Crafting your story…
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
        Your Story
      </h1>

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
        {storyText}
      </pre>

    </div>
  );
}
