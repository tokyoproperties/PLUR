// Cycles.jsx — EarthEye Lite
// Minimal ecological cycles page with simple system placeholders

export default function Cycles() {
  return (
    <div style={{ padding: "1.5rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        Cycles
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
          The repeating patterns that shape the landscape
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
          <div style={{ fontWeight: "bold" }}>Water Cycle</div>
          <div style={{ opacity: 0.7 }}>
            Rain, flow, evaporation, and return
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
          <div style={{ fontWeight: "bold" }}>Light Cycle</div>
          <div style={{ opacity: 0.7 }}>
            Day, night, and shifting seasonal light
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
          <div style={{ fontWeight: "bold" }}>Life Cycle</div>
          <div style={{ opacity: 0.7 }}>
            Growth, reproduction, migration, renewal
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
          Cycle Intelligence (Lite)
        </div>
        <div style={{ opacity: 0.7 }}>
          Full systems engine coming later
        </div>
      </div>
    </div>
  );
}
