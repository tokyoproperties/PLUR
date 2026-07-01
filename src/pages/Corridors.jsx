// Corridors.jsx — EarthEye Lite
// Minimal ecological corridor placeholder page

export default function Corridors() {
  return (
    <div style={{ padding: "1.5rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        Corridors
      </h1>

      <div
        style={{
          background: "#1a1a18",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "2rem",
        }}
      >
        <div style={{ opacity: 0.8, marginBottom: "1rem" }}>
          Wildlife movement pathways
        </div>

        <div
          style={{
            padding: "1rem",
            background: "#22221f",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "1rem",
          }}
        >
          <div style={{ fontWeight: "bold" }}>North–South Corridor</div>
          <div style={{ opacity: 0.7 }}>
            Foothill movement and seasonal travel
          </div>
        </div>

        <div
          style={{
            padding: "1rem",
            background: "#22221f",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "1rem",
          }}
        >
          <div style={{ fontWeight: "bold" }}>East–West Corridor</div>
          <div style={{ opacity: 0.7 }}>
            Linking coastal and inland habitats
          </div>
        </div>

        <div
          style={{
            padding: "1rem",
            background: "#22221f",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontWeight: "bold" }}>River Corridor</div>
          <div style={{ opacity: 0.7 }}>
            Movement along riparian waterways
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "1rem",
          background: "#1a1a18",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
          Corridor Intelligence (Lite)
        </div>
        <div style={{ opacity: 0.7 }}>
          Full movement engine coming later
        </div>
      </div>
    </div>
  );
}
