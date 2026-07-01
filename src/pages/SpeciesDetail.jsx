// src/pages/SpeciesDetail.jsx
import { useEffect, useState } from "react";
import { getSpecies } from "@/api/entities";
import { useParams, useNavigate } from "react-router-dom";

export default function SpeciesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [species, setSpecies] = useState(null);

  useEffect(() => {
    getSpecies(id).then(setSpecies);
  }, [id]);

  if (!species) {
    return <div style={{ padding: "2rem" }}>Loading…</div>;
  }

  const p = species.properties;

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1 style={{ fontSize: "2rem" }}>{p.name}</h1>

      {p.photo && (
        <img
          src={p.photo}
          alt={p.name}
          style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }}
        />
      )}

      <p><strong>Habitat:</strong> {p.habitat}</p>
      <p><strong>Range:</strong> {p.range}</p>

      <p>
        <strong>Coordinates:</strong>{" "}
        {species.geometry.coordinates.join(", ")}
      </p>
    </div>
  );
}
