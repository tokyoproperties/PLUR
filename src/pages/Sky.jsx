// Sky.jsx — EarthEye Lite
// Minimal sky page with simple horizon + zenith display

export default function Sky() {
  return (
    <div style={{ padding: "1.5rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        Sky
      </h1>

      <div
        style={{
          background: "linear-gradient(to bottom, #1e1e1c, #0f0f0d)",
          borderRadius: "12px",
          padding: "2rem",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
          Zenith
        </div>
        <div style={{ opacity: 0.7, marginBottom: "1.5rem" }}>
          The point directly overhead
        </div>

        <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
          Horizon
        </div>
        <div style={{ opacity: 0.7 }}>
          Where the sky meets the land
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
          Sky Intelligence (Lite)
        </div>
        <div style={{ opacity: 0.7 }}>
          Full sky engine coming later
        </div>
      </div>
    </div>
  );
}
