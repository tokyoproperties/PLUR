// src/pages/TrailDetail.jsx
import { useEffect, useState } from "react";
import { getTrail } from "@/api/entities";
import { useParams, useNavigate } from "react-router-dom";

export default function TrailDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trail, setTrail] = useState(null);

  useEffect(() => {
    getTrail(id).then(setTrail);
  }, [id]);

  if (!trail) {
    return <div style={{ padding: "2rem" }}>Loading…</div>;
  }

  const p = trail.properties;

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1 style={{ fontSize: "2rem" }}>{p.name}</h1>

      <p>
        <strong>Coordinates:</strong>{" "}
        {trail.geometry.coordinates.join(", ")}
      </p>
    </div>
  );
}
