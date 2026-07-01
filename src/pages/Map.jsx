// Map.jsx — EarthEye Lite
// Minimal placeholder for the future interactive map

export default function Map() {
  return (
    <div style={{ padding: "1.5rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        Map
      </h1>

      <div
        style={{
          background: "#1a1a18",
          borderRadius: "12px",
          padding: "2rem",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
          Map (Lite)
        </div>
        <div style={{ opacity: 0.7, marginTop: "0.5rem" }}>
          Interactive map coming in a future build
        </div>

        <div
          style={{
            marginTop: "1.5rem",
            height: "150px",
            borderRadius: "8px",
            background:
              "linear-gradient(to bottom right, #22221f, #0f0f0d)",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.5,
            fontSize: "0.9rem",
          }}
        >
          Map preview placeholder
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
          Map Intelligence (Lite)
        </div>
        <div style={{ opacity: 0.7 }}>
          Trails, species, and layers will appear here later
        </div>
      </div>
    </div>
  );
}
