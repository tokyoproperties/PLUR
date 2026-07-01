// Seasonal.jsx — EarthEye Lite
// Minimal seasonal cycle page with simple four-season layout

export default function Seasonal() {
  return (
    <div style={{ padding: "1.5rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        Seasonal Cycle
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
          The year in four phases
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              background: "#22221f",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontWeight: "bold" }}>Winter</div>
            <div style={{ opacity: 0.7 }}>Cool, quiet, reflective</div>
          </div>

          <div
            style={{
              padding: "1rem",
              background: "#22221f",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontWeight: "bold" }}>Spring</div>
            <div style={{ opacity: 0.7 }}>Bloom, growth, renewal</div>
          </div>

          <div
            style={{
              padding: "1rem",
              background: "#22221f",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontWeight: "bold" }}>Summer</div>
            <div style={{ opacity: 0.7 }}>Heat, activity, motion</div>
          </div>

          <div
            style={{
              padding: "1rem",
              background: "#22221f",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontWeight: "bold" }}>Fall</div>
            <div style={{ opacity: 0.7 }}>Change, migration, light shift</div>
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
          Seasonal Intelligence (Lite)
        </div>
        <div style={{ opacity: 0.7 }}>
          Full seasonal engine coming later
        </div>
      </div>
    </div>
  );
}
